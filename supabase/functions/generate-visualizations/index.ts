
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
    const { fileId, tableName, analysisId, visualizationType } = await req.json()
    
    if (!fileId || !tableName || !visualizationType) {
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
    
    // Buscar a análise relacionada se existir
    let analysisData = null
    if (analysisId) {
      const { data, error } = await supabase
        .from('data_analyses')
        .select('*')
        .eq('id', analysisId)
        .single()
      
      if (!error) {
        analysisData = data
      }
    }
    
    // Gerar configuração de visualização baseada no tipo solicitado
    const visualizationConfig = generateVisualizationConfig(
      visualizationType, 
      columns, 
      tableName, 
      analysisData
    )
    
    // Executar consulta SQL para dados da visualização
    const { data: visualizationData, error: queryError } = await supabase.rpc(
      'execute_visualization_query',
      { 
        query: visualizationConfig.query,
        params: visualizationConfig.params
      }
    )
    
    if (queryError) {
      console.error('Erro ao executar consulta:', queryError)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar dados para visualização' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Salvar configuração da visualização
    const { data: savedVisualization, error: saveError } = await supabase
      .from('data_visualizations')
      .insert({
        analysis_id: analysisId || null,
        type: visualizationType,
        configuration: {
          ...visualizationConfig,
          data: visualizationData
        }
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('Erro ao salvar visualização:', saveError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar configuração de visualização' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        visualization: {
          id: savedVisualization.id,
          type: visualizationType,
          config: visualizationConfig,
          data: visualizationData
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Erro na geração de visualização:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateVisualizationConfig(type, columns, tableName, analysisData) {
  // Identificar colunas apropriadas para o tipo de visualização
  const numericColumns = columns.filter(col => 
    col.data_type === 'integer' || col.data_type === 'numeric'
  )
  
  const categoricalColumns = columns.filter(col => 
    col.data_type === 'text' && 
    (col.statistics?.uniqueness < 50 || col.statistics?.distinct_count < 20)
  )
  
  const dateColumns = columns.filter(col => 
    col.data_type === 'date' || col.data_type === 'timestamp'
  )
  
  // Gerar configuração baseada no tipo
  switch (type) {
    case 'bar_chart':
      return {
        title: 'Gráfico de Barras',
        description: 'Visualização de dados categóricos',
        xAxis: categoricalColumns.length > 0 ? categoricalColumns[0].original_name : null,
        yAxis: numericColumns.length > 0 ? numericColumns[0].original_name : null,
        query: `SELECT "${categoricalColumns.length > 0 ? categoricalColumns[0].original_name : ''}" as category, 
                SUM("${numericColumns.length > 0 ? numericColumns[0].original_name : ''}") as value 
                FROM "${tableName}" 
                GROUP BY category 
                ORDER BY value DESC 
                LIMIT 10`,
        params: {}
      }
      
    case 'line_chart':
      return {
        title: 'Gráfico de Linha',
        description: 'Tendência ao longo do tempo',
        xAxis: dateColumns.length > 0 ? dateColumns[0].original_name : null,
        yAxis: numericColumns.length > 0 ? numericColumns[0].original_name : null,
        query: `SELECT "${dateColumns.length > 0 ? dateColumns[0].original_name : ''}" as time_period, 
                SUM("${numericColumns.length > 0 ? numericColumns[0].original_name : ''}") as value 
                FROM "${tableName}" 
                GROUP BY time_period 
                ORDER BY time_period`,
        params: {}
      }
      
    case 'pie_chart':
      return {
        title: 'Gráfico de Pizza',
        description: 'Distribuição proporcional',
        dimension: categoricalColumns.length > 0 ? categoricalColumns[0].original_name : null,
        metric: numericColumns.length > 0 ? numericColumns[0].original_name : null,
        query: `SELECT "${categoricalColumns.length > 0 ? categoricalColumns[0].original_name : ''}" as category, 
                SUM("${numericColumns.length > 0 ? numericColumns[0].original_name : ''}") as value 
                FROM "${tableName}" 
                GROUP BY category 
                ORDER BY value DESC 
                LIMIT 10`,
        params: {}
      }
      
    case 'scatter_plot':
      return {
        title: 'Gráfico de Dispersão',
        description: 'Correlação entre variáveis',
        xAxis: numericColumns.length > 0 ? numericColumns[0].original_name : null,
        yAxis: numericColumns.length > 1 ? numericColumns[1].original_name : (numericColumns.length > 0 ? numericColumns[0].original_name : null),
        query: `SELECT "${numericColumns.length > 0 ? numericColumns[0].original_name : ''}" as x, 
                "${numericColumns.length > 1 ? numericColumns[1].original_name : (numericColumns.length > 0 ? numericColumns[0].original_name : '')}" as y 
                FROM "${tableName}" 
                LIMIT 100`,
        params: {}
      }
      
    case 'heatmap':
      return {
        title: 'Mapa de Calor',
        description: 'Intensidade de valores em duas dimensões',
        xAxis: categoricalColumns.length > 0 ? categoricalColumns[0].original_name : null,
        yAxis: categoricalColumns.length > 1 ? categoricalColumns[1].original_name : (categoricalColumns.length > 0 ? categoricalColumns[0].original_name : null),
        metric: numericColumns.length > 0 ? numericColumns[0].original_name : null,
        query: `SELECT "${categoricalColumns.length > 0 ? categoricalColumns[0].original_name : ''}" as x, 
                "${categoricalColumns.length > 1 ? categoricalColumns[1].original_name : (categoricalColumns.length > 0 ? categoricalColumns[0].original_name : '')}" as y,
                SUM("${numericColumns.length > 0 ? numericColumns[0].original_name : ''}") as value 
                FROM "${tableName}" 
                GROUP BY x, y 
                ORDER BY value DESC 
                LIMIT 100`,
        params: {}
      }
      
    default:
      return {
        title: 'Tabela',
        description: 'Visualização em formato de tabela',
        columns: columns.map(col => col.original_name),
        query: `SELECT * FROM "${tableName}" LIMIT 100`,
        params: {}
      }
  }
}
