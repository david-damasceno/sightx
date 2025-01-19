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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar variáveis de ambiente
    if (!apiKey || !endpoint || !deployment) {
      const error = 'Missing required Azure OpenAI configuration'
      console.error(error, {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        hasDeployment: !!deployment
      })
      throw new Error(error)
    }

    // Parse request body
    const { message, context } = await req.json()
    console.log('Processing request:', { message, context })

    // Prepare Azure OpenAI request
    const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    const url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`
    
    console.log('Calling Azure OpenAI at:', url)

    // Make request to Azure OpenAI
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
            content: 'Você é DONA, uma assistente virtual especializada em análise de dados e insights empresariais. Você é profissional mas amigável, e sempre tenta ajudar os usuários a entenderem melhor seus dados e tomar decisões baseadas em evidências.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    // Log Azure OpenAI response status
    console.log('Azure OpenAI response status:', azureResponse.status)

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text()
      console.error('Azure OpenAI Error:', errorText)
      throw new Error(`Azure OpenAI Error: ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Azure OpenAI Response:', data)

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Azure OpenAI')
    }

    const aiResponse = data.choices[0].message.content

    // Return successful response
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    // Log and return error
    console.error('Error in chat-with-dona function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Error processing chat request'
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