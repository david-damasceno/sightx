
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

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validação das configurações do Azure
    if (!apiKey || !endpoint || !deployment) {
      console.error('Configuração do Azure OpenAI ausente')
      throw new Error('Configuração do Azure OpenAI ausente')
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
      sampleDataCount: sampleData?.length
    })

    const prompt = `
      Como um especialista em análise de dados, sugira nomes apropriados para as colunas de uma tabela de dados.
      
      Descrição dos dados: ${description}
      
      Colunas originais e exemplos de dados:
      ${columns.map((col: string, index: number) => 
        `${col}: ${sampleData?.slice(0, 3).map((row: any) => row[col]).join(', ')}`
      ).join('\n')}
      
      Por favor, sugira nomes de colunas mais descritivos e seus tipos de dados apropriados.
      Retorne apenas um array JSON com o seguinte formato para cada coluna:
      {
        "original_name": "nome_original",
        "suggested_name": "nome_sugerido",
        "type": "tipo_sugerido",
        "description": "breve descrição"
      }
    `

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`
    
    console.log('Chamando Azure OpenAI:', url)

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
            content: 'Você é um especialista em análise de dados que ajuda a sugerir nomes apropriados para colunas de tabelas.'
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
      console.error('Erro na resposta do Azure OpenAI:', errorText)
      throw new Error(`Erro na API do Azure OpenAI: ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Resposta do Azure OpenAI:', data)

    let suggestions
    try {
      suggestions = JSON.parse(data.choices[0].message.content)
      console.log('Sugestões processadas:', suggestions)
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
    console.error('Erro na função suggest-column-names:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
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
