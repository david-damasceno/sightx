
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0'
import { corsHeaders } from '../_shared/cors.ts'

interface GenerateVisualizationsRequest {
  fileId: string;
  tableName: string;
  organizationId: string;
}

serve(async (req) => {
  // Lidar com opções de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { fileId, tableName, organizationId } = await req.json() as GenerateVisualizationsRequest
    
    // Verificar existência da tabela e do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()
    
    if (fileError || !fileData) {
      throw new Error(fileError?.message || 'Arquivo não encontrado')
    }
    
    // Buscar metadados das colunas
    const { data: columnsData, error: columnsError } = await supabase
      .from('column_metadata')
      .select('*')
      .eq('import_id', fileId)
    
    if (columnsError) {
      throw new Error(columnsError.message)
    }
    
    if (!columnsData || columnsData.length === 0) {
      throw new Error('Nenhuma coluna encontrada para análise')
    }
    
    // Buscar dados para análise
    const { data: tableData, error: tableError } = await supabase
      .from(tableName)
      .select('*')
      .limit(500) // Limitar a 500 registros para análise
    
    if (tableError) {
      throw new Error(tableError.message)
    }
    
    if (!tableData || tableData.length === 0) {
      throw new Error('Nenhum dado encontrado para análise')
    }
    
    // Preparar dados para o Azure OpenAI
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY') || ''
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || ''
    const azureDeploymentName = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') || ''
    
    if (!azureApiKey || !azureEndpoint || !azureDeploymentName) {
      throw new Error('Configurações do Azure OpenAI não encontradas')
    }
    
    // Preparar prompt para IA
    const columnDefinitions = columnsData.map(column => ({
      name: column.original_name,
      displayName: column.display_name || column.original_name,
      description: column.description,
      dataType: column.data_type
    }))
    
    // Analisa dados para determinar tipos numéricos e categóricos
    const numericColumns = columnsData
      .filter(col => ['integer', 'numeric', 'bigint', 'double precision', 'real', 'smallint'].includes(col.data_type.toLowerCase()))
      .map(col => col.original_name)
    
    const dateColumns = columnsData
      .filter(col => ['date', 'timestamp', 'time'].some(type => col.data_type.toLowerCase().includes(type)))
      .map(col => col.original_name)
    
    const categoricalColumns = columnsData
      .filter(col => 
        !numericColumns.includes(col.original_name) && 
        !dateColumns.includes(col.original_name) &&
        col.original_name !== 'id' &&
        col.original_name !== 'organization_id' &&
        col.original_name !== 'created_at'
      )
      .map(col => col.original_name)
    
    // Verificar se já existe uma análise
    const { data: existingAnalyses, error: analysesError } = await supabase
      .from('data_analyses')
      .select('*')
      .eq('import_id', fileId)
      .eq('analysis_type', 'visualization')
      .limit(1)
    
    let analysisId
    
    if (analysesError) {
      throw new Error(analysesError.message)
    }
    
    if (existingAnalyses && existingAnalyses.length > 0) {
      // Usar análise existente
      analysisId = existingAnalyses[0].id
    } else {
      // Criar nova análise
      const { data: newAnalysis, error: newAnalysisError } = await supabase
        .from('data_analyses')
        .insert({
          import_id: fileId,
          analysis_type: 'visualization',
          configuration: {
            numericColumns,
            categoricalColumns,
            dateColumns
          },
          results: {}
        })
        .select()
        .single()
      
      if (newAnalysisError) {
        throw new Error(newAnalysisError.message)
      }
      
      analysisId = newAnalysis.id
    }
    
    // Gerar visualizações básicas (sem IA primeiro)
    const visualizations = []
    
    // 1. Para cada coluna numérica, gerar distribuição em barras
    for (const numericCol of numericColumns.slice(0, 2)) { // Limitar a 2 para não sobrecarregar
      const { data: aggregateData, error: aggregateError } = await supabase.rpc(
        'aggregate_numeric_column',
        { 
          p_table_name: tableName,
          p_column_name: numericCol,
          p_buckets: 10
        }
      )
      
      if (!aggregateError) {
        const columnInfo = columnsData.find(col => col.original_name === numericCol)
        const displayName = columnInfo?.display_name || numericCol
        
        visualizations.push({
          analysis_id: analysisId,
          type: 'bar',
          configuration: {
            type: 'bar',
            title: `Distribuição de ${displayName}`,
            description: `Mostra a distribuição de valores para ${displayName}`,
            data: aggregateData || [],
            dataKey: 'value',
            nameKey: 'range',
            color: '#7c3aed'
          }
        })
      }
    }
    
    // 2. Para cada coluna categórica, gerar gráfico de pizza
    for (const categoricalCol of categoricalColumns.slice(0, 2)) { // Limitar a 2
      const { data: countData, error: countError } = await supabase.rpc(
        'count_by_category',
        { 
          p_table_name: tableName,
          p_column_name: categoricalCol,
          p_limit: 10
        }
      )
      
      if (!countError) {
        const columnInfo = columnsData.find(col => col.original_name === categoricalCol)
        const displayName = columnInfo?.display_name || categoricalCol
        
        visualizations.push({
          analysis_id: analysisId,
          type: 'pie',
          configuration: {
            type: 'pie',
            title: `Distribuição por ${displayName}`,
            description: `Mostra a distribuição de registros por ${displayName}`,
            data: countData || [],
            dataKey: 'count',
            nameKey: 'category',
            color: '#8b5cf6'
          }
        })
      }
    }
    
    // 3. Para colunas de data, gerar série temporal
    for (const dateCol of dateColumns.slice(0, 1)) { // Limitar a 1
      // Encontrar uma coluna numérica para usar com a data
      if (numericColumns.length > 0) {
        const numericCol = numericColumns[0]
        
        const { data: timeSeriesData, error: timeSeriesError } = await supabase.rpc(
          'time_series_analysis',
          { 
            p_table_name: tableName,
            p_date_column: dateCol,
            p_value_column: numericCol
          }
        )
        
        if (!timeSeriesError) {
          const columnInfo = columnsData.find(col => col.original_name === dateCol)
          const numericInfo = columnsData.find(col => col.original_name === numericCol)
          const dateName = columnInfo?.display_name || dateCol
          const valueName = numericInfo?.display_name || numericCol
          
          visualizations.push({
            analysis_id: analysisId,
            type: 'line',
            configuration: {
              type: 'line',
              title: `${valueName} por ${dateName}`,
              description: `Mostra a evolução de ${valueName} ao longo do tempo`,
              data: timeSeriesData || [],
              dataKey: 'value',
              nameKey: 'date',
              color: '#0ea5e9'
            }
          })
        }
      }
    }
    
    // Inserir visualizações geradas
    if (visualizations.length > 0) {
      const { error: insertError } = await supabase
        .from('data_visualizations')
        .insert(visualizations)
      
      if (insertError) {
        throw new Error(insertError.message)
      }
    }
    
    // Agora vamos usar a IA para sugerir visualizações mais avançadas
    const sampleData = tableData.slice(0, 20) // Limitar a 20 registros para o prompt
    
    const prompt = `
      Analise esta tabela de dados e sugira 3 visualizações adicionais que sejam relevantes para entender os dados.
      
      Informações da tabela:
      - Nome da tabela: ${tableName}
      - Número de registros: ${tableData.length}
      
      Colunas:
      ${JSON.stringify(columnDefinitions, null, 2)}
      
      Colunas numéricas: ${numericColumns.join(', ')}
      Colunas categóricas: ${categoricalColumns.join(', ')}
      Colunas de data: ${dateColumns.join(', ')}
      
      Amostra de dados:
      ${JSON.stringify(sampleData, null, 2)}
      
      Formate a resposta como JSON com a seguinte estrutura:
      {
        "visualizations": [
          {
            "type": "bar|line|pie|area",
            "title": "Título da visualização",
            "description": "Descrição breve",
            "columns": ["coluna1", "coluna2"],
            "aggregation": "sum|count|average", // opcional
            "groupBy": "coluna_categoria" // opcional
          }
        ]
      }
    `
    
    // Chamar a API do Azure OpenAI
    const azureResponse = await fetch(
      `${azureEndpoint}/openai/deployments/${azureDeploymentName}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de dados e visualização que ajuda a extrair insights de conjuntos de dados.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      }
    )
    
    const azureResponseData = await azureResponse.json()
    const analysisContent = azureResponseData.choices[0].message.content
    
    let analysisResult
    try {
      analysisResult = JSON.parse(analysisContent)
    } catch (e) {
      throw new Error('Erro ao interpretar resposta da IA: ' + e.message)
    }
    
    // Criar visualizações sugeridas pela IA
    const aiVisualizations = []
    
    for (const vis of analysisResult.visualizations) {
      // Verificar se temos as colunas necessárias
      const hasRequiredColumns = vis.columns.every(col => 
        columnsData.some(c => c.original_name === col || c.display_name === col)
      )
      
      if (!hasRequiredColumns) continue
      
      // Para cada visualização sugerida, gerar dados agrupados conforme necessário
      let visualizationData = []
      
      try {
        if (vis.groupBy) {
          const { data: groupedData } = await supabase.rpc(
            'group_by_analysis',
            { 
              p_table_name: tableName,
              p_group_column: vis.groupBy,
              p_value_column: vis.columns[0],
              p_aggregation: vis.aggregation || 'sum',
              p_limit: 10
            }
          )
          
          visualizationData = groupedData || []
        } else {
          // Buscar dados já processados para colunas simples
          const { data: simpleData } = await supabase
            .from(tableName)
            .select(vis.columns.join(','))
            .limit(50)
          
          visualizationData = simpleData || []
        }
        
        // Criar visualização
        aiVisualizations.push({
          analysis_id: analysisId,
          type: vis.type,
          configuration: {
            type: vis.type,
            title: vis.title,
            description: vis.description,
            data: visualizationData,
            dataKey: vis.columns[0],
            nameKey: vis.groupBy || 'category',
            color: vis.type === 'bar' ? '#7c3aed' : 
                   vis.type === 'line' ? '#0ea5e9' : 
                   vis.type === 'pie' ? '#8b5cf6' : '#10b981'
          }
        })
      } catch (e) {
        console.error(`Erro ao gerar visualização: ${e.message}`)
      }
    }
    
    // Inserir visualizações geradas pela IA
    if (aiVisualizations.length > 0) {
      const { error: insertError } = await supabase
        .from('data_visualizations')
        .insert(aiVisualizations)
      
      if (insertError) {
        throw new Error(insertError.message)
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Visualizações geradas com sucesso',
        visualizationCount: visualizations.length + aiVisualizations.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
    
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
