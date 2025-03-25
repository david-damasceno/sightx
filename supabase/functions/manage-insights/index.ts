
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Extrair parâmetros da solicitação
    const { action, organizationId, insightId } = await req.json()
    
    if (!organizationId) {
      throw new Error('ID da organização é obrigatório')
    }
    
    // Obter informações da organização
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*, settings')
      .eq('id', organizationId)
      .maybeSingle()
      
    if (orgError || !orgData) {
      throw new Error('Organização não encontrada: ' + (orgError?.message || ''))
    }
    
    // Determinar o esquema da organização
    const orgSchemaName = orgData?.settings?.schema_name || 'public'
    
    switch (action) {
      case 'generate':
        return await generateInsights(supabase, organizationId, orgSchemaName, orgData)
      
      case 'delete':
        if (!insightId) throw new Error('ID do insight é obrigatório para exclusão')
        return await deleteInsight(supabase, organizationId, insightId)
      
      case 'favorite':
        if (!insightId) throw new Error('ID do insight é obrigatório para favoritar')
        return await toggleFavoriteInsight(supabase, organizationId, insightId)
        
      default:
        throw new Error('Ação desconhecida: ' + action)
    }
  } catch (error) {
    console.error('Erro na função manage-insights:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateInsights(supabase, organizationId, schemaName, orgData) {
  console.log(`Gerando insights para organização ${organizationId} (esquema: ${schemaName})`)
  
  // 1. Obter metadados do esquema da organização
  const { data: schemaMetadata, error: metadataError } = await supabase.rpc(
    'get_organization_schema_metadata',
    { p_organization_id: organizationId }
  )
  
  if (metadataError) {
    throw new Error('Erro ao obter metadados do esquema: ' + metadataError.message)
  }
  
  // 2. Obter histórico de análises e consultas recentes
  const { data: queryHistory, error: queryError } = await supabase
    .from('ai_analysis_history')
    .select('query_text, executed_sql, result_summary, full_result')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (queryError) {
    console.error('Erro ao obter histórico de consultas:', queryError)
  }
  
  // 3. Preparar prompt para a IA
  const orgDescription = orgData.settings?.description || ''
  const orgSector = orgData.settings?.sector || ''
  const orgLocation = orgData.settings?.city ? `${orgData.settings.city}, ${orgData.settings.state || ''}` : ''
  
  const prompt = `
Você é um especialista em análise de dados e insights empresariais. Com base nos dados disponíveis e no contexto da empresa, 
gere insights valiosos e acionáveis para a organização.

INFORMAÇÕES DA ORGANIZAÇÃO:
Nome: ${orgData.name}
Setor: ${orgSector}
Localização: ${orgLocation}
Descrição: ${orgDescription}

ESTRUTURA DE DADOS (TABELAS E COLUNAS):
${JSON.stringify(schemaMetadata, null, 2)}

ANÁLISES RECENTES:
${queryHistory?.length > 0 ? 
  queryHistory.map(q => `Consulta: ${q.query_text}\nSQL: ${q.executed_sql}\nResultados: ${JSON.stringify(q.full_result)}`).join('\n\n') : 
  'Nenhuma análise recente disponível.'
}

TAREFA:
Gere de 5 a 8 insights relevantes para a empresa. Cada insight deve ser acionável e baseado nos dados disponíveis.
Para cada insight, forneça:
1. Uma descrição clara e concisa do insight.
2. O tipo de insight (ai, warning, success, info).
3. A prioridade (high, medium, low).
4. A categoria (Estoque, Vendas, Operacional, Clientes, RH, Financeiro, Marketing, Fidelização).
5. O impacto esperado (Alto, Médio, Baixo).
6. O tempo estimado para implementação (quando aplicável).
7. A fonte do insight (Análise de Dados, IA Preditiva, Tendência de Mercado, etc.).

Retorne os insights como um array JSON no seguinte formato:
[
  {
    "text": "Descrição do insight",
    "type": "ai|warning|success|info",
    "priority": "high|medium|low",
    "category": "Categoria",
    "impact": "Alto|Médio|Baixo",
    "timeToImplement": "Tempo de implementação (opcional)",
    "source": "Fonte do insight"
  }
]
`

  // 4. Enviar solicitação para o provedor de IA
  let url, headers;
  
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
        { 
          role: 'system', 
          content: 'Você é um analista de dados especializado em gerar insights empresariais acionáveis.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text()
    throw new Error(`Erro no serviço de IA: ${errorText}`)
  }

  const aiData = await aiResponse.json()
  const aiContent = aiData.choices[0].message.content

  // 5. Processar resposta da IA e extrair insights
  let insights = []
  try {
    // Tentar extrair o JSON diretamente
    const jsonMatch = aiContent.match(/\[\s*\{.*\}\s*\]/s)
    if (jsonMatch) {
      insights = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Formato de resposta não reconhecido')
    }
  } catch (parseError) {
    console.error('Erro ao processar resposta da IA:', parseError)
    throw new Error('Não foi possível processar a resposta da IA: ' + parseError.message)
  }

  // 6. Salvar os insights no banco de dados
  const timestamp = new Date().toISOString()
  const insightsToInsert = insights.map(insight => ({
    organization_id: organizationId,
    text: insight.text,
    type: insight.type || 'ai',
    priority: insight.priority || 'medium',
    category: insight.category || 'Operacional',
    impact: insight.impact || 'Médio',
    time_to_implement: insight.timeToImplement,
    source: insight.source || 'Análise de IA',
    created_at: timestamp
  }))
  
  const { error: insertError } = await supabase
    .from('organization_insights')
    .insert(insightsToInsert)
    
  if (insertError) {
    throw new Error('Erro ao salvar insights: ' + insertError.message)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `${insightsToInsert.length} insights gerados com sucesso`,
      count: insightsToInsert.length
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function deleteInsight(supabase, organizationId, insightId) {
  const { error } = await supabase
    .from('organization_insights')
    .delete()
    .eq('id', insightId)
    .eq('organization_id', organizationId)
    
  if (error) {
    throw new Error('Erro ao excluir insight: ' + error.message)
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Insight excluído com sucesso' 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function toggleFavoriteInsight(supabase, organizationId, insightId) {
  // Verificar se o insight já está favoritado
  const { data, error } = await supabase
    .from('organization_insights')
    .select('is_favorite')
    .eq('id', insightId)
    .eq('organization_id', organizationId)
    .single()
    
  if (error) {
    throw new Error('Erro ao verificar status do insight: ' + error.message)
  }
  
  const newStatus = !data.is_favorite
  
  // Atualizar o status de favorito
  const { error: updateError } = await supabase
    .from('organization_insights')
    .update({ is_favorite: newStatus })
    .eq('id', insightId)
    .eq('organization_id', organizationId)
    
  if (updateError) {
    throw new Error('Erro ao atualizar status do insight: ' + updateError.message)
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: newStatus ? 'Insight adicionado aos favoritos' : 'Insight removido dos favoritos',
      is_favorite: newStatus
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
