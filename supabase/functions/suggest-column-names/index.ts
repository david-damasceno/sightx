import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY')
const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')
const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!apiKey || !endpoint || !deployment) {
      throw new Error('Missing Azure OpenAI configuration')
    }

    const { description, columns, sampleData } = await req.json()

    if (!description || !columns || !Array.isArray(columns)) {
      throw new Error('Invalid request data')
    }

    console.log('Processing request with:', {
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
    
    console.log('Calling Azure OpenAI with URL:', url)

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
      console.error('Azure OpenAI Error Response:', errorText)
      throw new Error(`Azure OpenAI Error: ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Azure OpenAI Response:', data)

    let suggestions
    try {
      suggestions = JSON.parse(data.choices[0].message.content)
    } catch (error) {
      console.error('Error parsing suggestions:', error)
      console.log('Raw content:', data.choices[0].message.content)
      throw new Error('Failed to parse suggestions from AI response')
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
    console.error('Error in suggest-column-names function:', error)
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