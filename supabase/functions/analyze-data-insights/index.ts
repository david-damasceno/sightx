
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY')
const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || "https://api.openai.com/v1"
const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') || "gpt-4o-mini"
const isAzure = !!Deno.env.get('AZURE_OPENAI_ENDPOINT')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { previewData, description, importId, organizationId } = await req.json()

    if (!previewData || !importId || !organizationId) {
      throw new Error('Dados insuficientes para análise')
    }

    // Obter informações da organização para identificar o esquema
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar informações da organização para obter o esquema
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Erro ao buscar organização:', orgError)
      throw new Error('Organização não encontrada')
    }

    const orgSchemaName = orgData?.settings?.schema_name || 'public'
    console.log(`Usando esquema da organização: ${orgSchemaName} para análise de dados`)

    // Construir um prompt informativo para a IA
    const prompt = `Como um analista de dados especializado, analise os seguintes dados e sugira análises relevantes.
    
    Descrição dos dados: ${description || 'Não fornecida'}
    
    Dados de exemplo:
    ${JSON.stringify(previewData.slice(0, 5), null, 2)}
    
    Esquema do banco de dados a ser usado: ${orgSchemaName}
    
    Por favor, sugira análises específicas que possam ser realizadas com estes dados. Para cada análise sugerida, forneça:
    1. Título da análise
    2. Descrição do que pode ser descoberto
    3. Métricas relevantes
    4. Tipo de visualização recomendada
    
    IMPORTANTE: Quando gerar consultas SQL, SEMPRE use o esquema "${orgSchemaName}." como prefixo para todas as tabelas.
    Exemplo: Use "${orgSchemaName}.nome_da_tabela" em vez de apenas "nome_da_tabela".
    
    Retorne apenas um array JSON com o seguinte formato para cada análise:
    {
      "title": "título da análise",
      "description": "descrição detalhada",
      "metrics": ["métrica 1", "métrica 2"],
      "visualization": "tipo de visualização",
      "type": "um dos seguintes: time_series, correlation, distribution, clustering, segmentation, forecasting, anomaly_detection"
    }`

    let url, headers;
    
    // Configurar a chamada para Azure OpenAI ou OpenAI padrão
    if (isAzure) {
      // Azure OpenAI
      const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
      url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`
      headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      }
    } else {
      // OpenAI padrão
      url = `${endpoint}/chat/completions`
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      }
    }

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: isAzure ? null : deployment,
        messages: [
          { role: 'system', content: 'Você é um analista de dados especializado em sugerir análises relevantes.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error('Erro ao gerar sugestões de análise')
    }

    const data = await aiResponse.json()
    const resultContent = data.choices[0].message.content
    
    // Tentar analisar o JSON da resposta
    let suggestions = []
    try {
      suggestions = JSON.parse(resultContent)
    } catch (e) {
      // Tentar encontrar array JSON na resposta se não for JSON puro
      const jsonMatch = resultContent.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Formato de resposta inválido da IA')
      }
    }

    // Salvar sugestões no banco de dados
    const { error: insertError } = await supabase
      .from('data_analysis_suggestions')
      .insert({
        organization_id: organizationId,
        data_import_id: importId,
        suggested_analyses: suggestions
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        suggestions,
        schema: orgSchemaName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na função analyze-data-insights:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
