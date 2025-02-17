
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
      console.error('Missing Azure OpenAI configuration:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        hasDeployment: !!deployment
      })
      throw new Error('Missing required Azure OpenAI configuration')
    }

    const { message, context } = await req.json()
    console.log('Processing request:', { message, context })

    const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    const url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`
    
    console.log('Calling Azure OpenAI at:', url)
    console.log('Using deployment:', deployment)

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
      throw new Error(`Azure OpenAI Error: ${errorText}`)
    }

    const data = await azureResponse.json()
    console.log('Azure OpenAI Response:', data)

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Azure OpenAI')
    }

    const aiResponse = data.choices[0].message.content

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
