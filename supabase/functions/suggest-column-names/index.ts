
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY')
const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')
const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista de palavras reservadas do PostgreSQL mais comuns
const POSTGRESQL_RESERVED_WORDS = new Set([
  'select', 'from', 'where', 'table', 'index', 'primary', 'key', 'foreign',
  'references', 'constraint', 'unique', 'check', 'default', 'order', 'by',
  'group', 'having', 'limit', 'offset', 'union', 'case', 'when', 'then',
  'else', 'end', 'create', 'alter', 'drop', 'update', 'delete', 'insert',
  'into', 'values', 'user', 'password', 'grant', 'revoke', 'column', 'row'
])

// Função para validar nome de coluna PostgreSQL
function validateColumnName(name: string): { isValid: boolean; reason?: string } {
  if (name.length > 63) {
    return { isValid: false, reason: 'Nome muito longo (máximo 63 caracteres)' }
  }

  if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
    return { isValid: false, reason: 'Nome deve conter apenas letras minúsculas, números e underscore, e começar com letra ou underscore' }
  }

  if (POSTGRESQL_RESERVED_WORDS.has(name.toLowerCase())) {
    return { isValid: false, reason: 'Nome é uma palavra reservada do PostgreSQL' }
  }

  return { isValid: true }
}

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validação das configurações do Azure
    if (!apiKey || !endpoint || !deployment) {
      console.error('Configurações do Azure OpenAI:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        hasDeployment: !!deployment
      })
      throw new Error('Configurações do Azure OpenAI incompletas')
    }

    // Validação do JWT e autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autenticação não fornecido')
    }

    // Parse do corpo da requisição
    const { description, columns, sampleData } = await req.json()

    // Validação dos dados de entrada
    if (!description || !columns || !Array.isArray(columns)) {
      console.error('Dados inválidos:', { description, columnsLength: columns?.length })
      throw new Error('Dados de entrada inválidos')
    }

    console.log('Processando requisição:', {
      description,
      columns,
      sampleDataCount: sampleData?.length,
      deployment,
      endpoint
    })

    const prompt = `
      Como um especialista em análise de dados, sugira nomes apropriados para as colunas de uma tabela PostgreSQL.
      
      REGRAS IMPORTANTES PARA NOMES DE COLUNAS:
      1. Use apenas letras minúsculas e underscore (snake_case)
      2. Comece com letra ou underscore (nunca com número)
      3. Use apenas caracteres: a-z, 0-9 e _ (underscore)
      4. Máximo de 63 caracteres
      5. Evite palavras reservadas do PostgreSQL como: select, from, where, table, etc.
      6. Seja conciso mas descritivo
      
      EXEMPLOS DE NOMES CORRETOS:
      ✅ data_nascimento (não "data_de_nascimento")
      ✅ valor_total
      ✅ endereco_entrega
      ✅ status_pedido
      
      EXEMPLOS DE NOMES INCORRETOS:
      ❌ Data_Nascimento (não use maiúsculas)
      ❌ valor-total (não use hífen)
      ❌ endereço_entrega (não use caracteres especiais)
      ❌ 1_coluna (não comece com número)
      
      Descrição dos dados: ${description}
      
      Colunas originais e exemplos de dados:
      ${columns.map((col: string, index: number) => 
        `${col}: ${sampleData?.slice(0, 3).map((row: any) => row[col]).join(', ')}`
      ).join('\n')}
      
      Retorne apenas um array JSON com o seguinte formato para cada coluna:
      {
        "original_name": "nome_original",
        "suggested_name": "nome_sugerido_em_snake_case",
        "type": "tipo_sugerido",
        "description": "breve descrição"
      }
    `

    // Remover qualquer barra final do endpoint
    const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    
    // Construir a URL correta para a API do Azure OpenAI
    const url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`
    
    console.log('Chamando Azure OpenAI:', {
      url,
      deployment,
      promptLength: prompt.length
    })

    const azureResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de dados e bancos de dados PostgreSQL que ajuda a sugerir nomes apropriados para colunas de tabelas seguindo as melhores práticas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      }),
    })

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text()
      console.error('Erro na resposta do Azure OpenAI:', {
        status: azureResponse.status,
        statusText: azureResponse.statusText,
        error: errorText,
        url,
        deployment
      })
      throw new Error(`Erro na API do Azure OpenAI: [${azureResponse.status}] ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Resposta do Azure OpenAI:', {
      status: azureResponse.status,
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      firstChoice: data.choices?.[0]?.message?.content?.substring(0, 100) + '...'
    })

    let suggestions
    try {
      suggestions = JSON.parse(data.choices[0].message.content)
      
      // Validar e ajustar cada sugestão
      suggestions = suggestions.map((suggestion: any) => {
        const validation = validateColumnName(suggestion.suggested_name)
        if (!validation.isValid) {
          console.warn(`Nome sugerido inválido: ${suggestion.suggested_name}. Razão: ${validation.reason}`)
          // Sanitizar o nome sugerido
          suggestion.suggested_name = suggestion.suggested_name
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/^[0-9]/, '_$&')
            .substring(0, 63)
          suggestion.needs_review = true
          suggestion.validation_message = validation.reason
        }
        return suggestion
      })

      console.log('Sugestões processadas e validadas:', suggestions)
    } catch (error) {
      console.error('Erro ao processar sugestões:', error)
      console.log('Conteúdo bruto:', data.choices[0].message.content)
      throw new Error('Falha ao processar sugestões da resposta da IA')
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Erro na função suggest-column-names:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    })
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: `Erro detalhado: ${error.stack || 'Stack não disponível'}`
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

