
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Construir um prompt informativo para a IA
    const prompt = `Como um analista de dados especializado, analise os seguintes dados e sugira análises relevantes.
    
    Descrição dos dados: ${description || 'Não fornecida'}
    
    Dados de exemplo:
    ${JSON.stringify(previewData.slice(0, 5), null, 2)}
    
    Por favor, sugira análises específicas que possam ser realizadas com estes dados. Para cada análise sugerida, forneça:
    1. Título da análise
    2. Descrição do que pode ser descoberto
    3. Métricas relevantes
    4. Tipo de visualização recomendada
    
    Retorne apenas um array JSON com o seguinte formato para cada análise:
    {
      "title": "título da análise",
      "description": "descrição detalhada",
      "metrics": ["métrica 1", "métrica 2"],
      "visualization": "tipo de visualização",
      "type": "um dos seguintes: time_series, correlation, distribution, clustering, segmentation, forecasting, anomaly_detection"
    }`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('AZURE_OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um analista de dados especializado em sugerir análises relevantes.' },
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao gerar sugestões de análise')
    }

    const data = await response.json()
    const suggestions = JSON.parse(data.choices[0].message.content)

    // Salvar sugestões no banco de dados
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: insertError } = await supabase
      .from('data_analysis_suggestions')
      .insert({
        organization_id: organizationId,
        data_import_id: importId,
        suggested_analyses: suggestions
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ suggestions }),
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
