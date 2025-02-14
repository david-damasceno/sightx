
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.16.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileId } = await req.json()

    // Inicializar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Buscar dados do arquivo
    const { data: importData, error: importError } = await supabaseClient
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .single()

    if (importError) throw importError

    // Ler amostra de dados do arquivo
    const { data: sampleData, error: sampleError } = await supabaseClient.functions
      .invoke('read-file-data', {
        body: { fileId, page: 1, pageSize: 10 }
      })

    if (sampleError) throw sampleError

    // Configurar Azure OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('AZURE_OPENAI_API_KEY'),
      azure: {
        apiKey: Deno.env.get('AZURE_OPENAI_API_KEY'),
        endpoint: Deno.env.get('AZURE_OPENAI_ENDPOINT'),
        deploymentName: Deno.env.get('AZURE_OPENAI_DEPLOYMENT'),
      },
    })
    const openai = new OpenAIApi(configuration)

    // Criar prompt para o Azure OpenAI
    const prompt = `
      Contexto dos dados: ${importData.context}
      
      Amostra dos dados:
      ${JSON.stringify(sampleData.data, null, 2)}
      
      Com base no contexto e na amostra dos dados:
      1. Analise o significado de cada coluna
      2. Sugira nomes adequados para as colunas seguindo o padrão PostgreSQL (snake_case, sem caracteres especiais)
      3. Retorne um objeto JSON com o mapeamento de nomes originais para nomes sugeridos
      
      Formato da resposta:
      {
        "nome_original_1": "nome_sugerido_1",
        "nome_original_2": "nome_sugerido_2"
      }
    `

    // Enviar para Azure OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Você é um especialista em análise de dados e nomenclatura de banco de dados.' },
        { role: 'user', content: prompt }
      ]
    })

    const suggestedNames = JSON.parse(completion.data.choices[0].message?.content || '{}')

    // Salvar sugestões no banco
    const columns = Object.entries(suggestedNames).map(([original, suggested]) => ({
      file_id: fileId,
      organization_id: importData.organization_id,
      original_name: original,
      mapped_name: suggested,
      status: 'pending'
    }))

    const { error: columnsError } = await supabaseClient
      .from('data_file_columns')
      .insert(columns)

    if (columnsError) throw columnsError

    // Atualizar status do import
    const { error: updateError } = await supabaseClient
      .from('data_imports')
      .update({ status: 'editing' })
      .eq('id', fileId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
