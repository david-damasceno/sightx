
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileId, tableName, description } = await req.json()
    
    if (!fileId || !tableName) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )
    
    // Buscar metadados das colunas
    const { data: columns, error: columnsError } = await supabase
      .from('column_metadata')
      .select('*')
      .eq('import_id', fileId)
    
    if (columnsError) {
      console.error('Erro ao buscar metadados:', columnsError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar metadados de colunas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Buscar amostra de dados da tabela
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(10)
    
    if (sampleError) {
      console.error('Erro ao buscar amostra de dados:', sampleError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar amostra de dados' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Preparar dados para análise pela Azure OpenAI
    const contextData = {
      tableName,
      description: description || 'Tabela de dados importados',
      columns: columns,
      sampleData: sampleData
    }
    
    // Chamar Azure OpenAI para análise
    const openaiEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')
    const openaiKey = Deno.env.get('AZURE_OPENAI_API_KEY')
    const openaiDeployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT')
    
    if (!openaiEndpoint || !openaiKey || !openaiDeployment) {
      console.error('Credenciais da Azure OpenAI não configuradas')
      return new Response(
        JSON.stringify({ error: 'Serviço de IA não configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const prompt = `
    Analise esta tabela de dados:
    
    Nome da tabela: ${tableName}
    Descrição: ${description || 'Tabela de dados importados'}
    
    Colunas:
    ${columns.map(col => `- ${col.original_name} (${col.data_type}): ${JSON.stringify(col.sample_values)}`).join('\n')}
    
    Amostra de dados:
    ${JSON.stringify(sampleData, null, 2)}
    
    Por favor, forneça:
    1. Nomes mais adequados para as colunas (em português, termos técnicos claros)
    2. Descrição curta para cada coluna
    3. Tipos de análises recomendadas para estes dados
    4. Possíveis visualizações relevantes
    5. Possíveis melhorias na qualidade dos dados
    
    Responda em formato JSON com a seguinte estrutura:
    {
      "columns": [
        {
          "original_name": "nome_original",
          "suggested_name": "nome_sugerido",
          "description": "descrição da coluna",
          "recommendations": "recomendações específicas para esta coluna"
        }
      ],
      "analyses": [
        {
          "type": "tipo_de_analise",
          "description": "descrição da análise",
          "relevance": "relevância (alta, média, baixa)"
        }
      ],
      "visualizations": [
        {
          "type": "tipo_de_visualizacao",
          "description": "descrição da visualização",
          "columns": ["colunas_envolvidas"]
        }
      ],
      "quality_improvements": [
        {
          "issue": "problema identificado",
          "suggestion": "sugestão de melhoria"
        }
      ]
    }
    `
    
    const openaiResponse = await fetch(
      `${openaiEndpoint}/openai/deployments/${openaiDeployment}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': openaiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Você é um analista de dados especialista que ajuda a entender e contextualizar dados.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      }
    )
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('Erro na chamada da OpenAI:', errorText)
      return new Response(
        JSON.stringify({ error: 'Erro na análise de IA', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const openaiResult = await openaiResponse.json()
    let analysisResult
    
    try {
      // Extrair o JSON da resposta
      const content = openaiResult.choices[0].message.content
      analysisResult = JSON.parse(content)
    } catch (e) {
      console.error('Erro ao processar resposta da OpenAI:', e)
      return new Response(
        JSON.stringify({ error: 'Erro ao processar resposta da IA' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Salvar as sugestões de análise
    await supabase
      .from('data_analyses')
      .insert({
        import_id: fileId,
        analysis_type: 'context',
        results: analysisResult
      })
    
    // Atualizar metadados de colunas com as sugestões
    for (const col of analysisResult.columns) {
      await supabase
        .from('column_metadata')
        .update({
          display_name: col.suggested_name,
          description: col.description
        })
        .eq('import_id', fileId)
        .eq('original_name', col.original_name)
    }
    
    // Atualizar descrição da tabela importada
    await supabase
      .from('data_imports')
      .update({
        description: description || 'Tabela de dados importados',
        metadata: { 
          analyses: analysisResult.analyses,
          visualizations: analysisResult.visualizations,
          quality_improvements: analysisResult.quality_improvements
        }
      })
      .eq('id', fileId)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        result: analysisResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Erro na análise de contexto:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
