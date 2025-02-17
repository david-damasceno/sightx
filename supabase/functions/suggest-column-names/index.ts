
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!apiKey || !endpoint || !deployment) {
      console.error('Azure OpenAI configuration missing:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        hasDeployment: !!deployment
      })
      throw new Error('Missing required Azure OpenAI configuration')
    }

    const { description, columns, sampleData } = await req.json()

    if (!description || !columns || !Array.isArray(columns)) {
      throw new Error('Invalid input data')
    }

    console.log('Processing request:', {
      description,
      columnsCount: columns.length,
      sampleDataCount: sampleData?.length
    })

    // Construir o prompt
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

    // Remover qualquer barra final do endpoint
    const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    
    // Construir a URL correta para a API do Azure OpenAI
    const url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`
    
    console.log('Calling Azure OpenAI API at:', url)

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
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      }),
    })

    console.log('Azure OpenAI response status:', azureResponse.status)

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text()
      console.error('Azure OpenAI Error Response:', errorText)
      throw new Error(`Azure OpenAI API Error: ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Azure OpenAI Response received:', {
      hasResponse: !!data,
      hasChoices: !!data.choices,
      firstChoice: data.choices?.[0]
    })

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Azure OpenAI')
    }

    try {
      const content = data.choices[0].message.content
      const suggestions = typeof content === 'string' ? JSON.parse(content) : content

      console.log('Suggestions received:', suggestions.slice(0, 2))
      
      // Process and validate each suggestion
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

      console.log('Processed suggestions:', processedSuggestions.slice(0, 2))

      return new Response(
        JSON.stringify({ suggestions: processedSuggestions }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )

    } catch (error) {
      console.error('Error processing suggestions:', error)
      throw new Error('Failed to process AI response suggestions')
    }

  } catch (error) {
    console.error('Error in suggest-column-names function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || 'Stack trace not available'
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
