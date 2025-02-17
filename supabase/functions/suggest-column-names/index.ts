
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

const POSTGRESQL_RESERVED_WORDS = new Set([
  'select', 'from', 'where', 'table', 'index', 'primary', 'key', 'foreign',
  'references', 'constraint', 'unique', 'check', 'default', 'order', 'by',
  'group', 'having', 'limit', 'offset', 'union', 'case', 'when', 'then',
  'else', 'end', 'create', 'alter', 'drop', 'update', 'delete', 'insert',
  'into', 'values', 'user', 'password', 'grant', 'revoke', 'column', 'row'
])

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!apiKey || !endpoint || !deployment) {
      console.error('Configurações do Azure OpenAI:', {
        temApiKey: !!apiKey,
        temEndpoint: !!endpoint,
        temDeployment: !!deployment
      })
      throw new Error('Configurações do Azure OpenAI incompletas')
    }

    const { description, columns, sampleData } = await req.json()

    if (!description || !columns || !Array.isArray(columns)) {
      throw new Error('Dados de entrada inválidos')
    }

    console.log('Processando requisição:', {
      description,
      columnsCount: columns.length,
      primeirasAmostras: sampleData?.slice(0, 2)
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
      
      Descrição dos dados: ${description}
      
      Colunas originais e exemplos de dados:
      ${columns.map((col: string, index: number) => 
        `${col}: ${sampleData?.slice(0, 3).map((row: any) => row[col]).join(', ')}`
      ).join('\n')}
      
      Retorne apenas um array JSON com o seguinte formato para cada coluna:
      [
        {
          "original_name": "nome_original",
          "suggested_name": "nome_sugerido_em_snake_case",
          "type": "tipo_sugerido",
          "description": "breve descrição"
        }
      ]
    `

    const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    const apiUrl = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`
    
    console.log('Chamando Azure OpenAI:', {
      url: apiUrl,
      temChaveApi: !!apiKey
    })

    const azureResponse = await fetch(apiUrl, {
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

    console.log('Status da resposta Azure OpenAI:', azureResponse.status)

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text()
      console.error('Erro na resposta do Azure OpenAI:', {
        status: azureResponse.status,
        texto: errorText
      })
      throw new Error(`Erro na API do Azure OpenAI: [${azureResponse.status}] ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Resposta do Azure OpenAI recebida:', {
      temResposta: !!data,
      temEscolhas: !!data.choices,
      primeiraEscolha: data.choices?.[0]
    })

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Resposta inválida do Azure OpenAI')
    }

    let suggestions
    try {
      const content = data.choices[0].message.content
      suggestions = typeof content === 'string' ? JSON.parse(content) : content

      console.log('Sugestões obtidas:', suggestions.slice(0, 2))
      
      // Processar e validar cada sugestão
      const processedSuggestions = suggestions.map((suggestion: any) => {
        const validation = validateColumnName(suggestion.suggested_name)
        if (!validation.isValid) {
          suggestion.suggested_name = suggestion.suggested_name
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/^[0-9]/, '_$&')
            .substring(0, 63)
          suggestion.needs_review = true
          suggestion.validation_message = validation.reason
        }
        
        return {
          original_name: suggestion.original_name,
          suggested_name: suggestion.suggested_name,
          type: suggestion.type,
          description: suggestion.description,
          needs_review: suggestion.needs_review || false,
          validation_message: suggestion.validation_message
        }
      })

      return new Response(
        JSON.stringify({ 
          suggestions: processedSuggestions 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )

    } catch (error) {
      console.error('Erro ao processar sugestões:', error)
      throw new Error('Falha ao processar sugestões da resposta da IA')
    }

  } catch (error) {
    console.error('Erro na função suggest-column-names:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || 'Stack não disponível'
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
