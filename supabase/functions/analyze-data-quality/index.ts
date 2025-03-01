
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
    const { fileId, tableName } = await req.json()
    
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
    
    // Obter contagem total de linhas
    const { data: countData, error: countError } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Erro ao contar linhas:', countError)
      return new Response(
        JSON.stringify({ error: 'Erro ao contar linhas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const totalRows = countData.count || 0
    
    // Analisar qualidade de cada coluna
    const qualityResults = []
    
    for (const column of columns) {
      const columnName = column.original_name
      
      // Analisar valores nulos
      const { data: nullCount, error: nullError } = await supabase.rpc(
        'count_null_values',
        { table_name: tableName, column_name: columnName }
      )
      
      if (nullError) {
        console.error(`Erro ao contar valores nulos para ${columnName}:`, nullError)
        continue
      }
      
      // Analisar valores duplicados
      const { data: duplicateCount, error: dupError } = await supabase.rpc(
        'count_duplicate_values',
        { table_name: tableName, column_name: columnName }
      )
      
      if (dupError) {
        console.error(`Erro ao contar valores duplicados para ${columnName}:`, dupError)
        continue
      }
      
      // Analisar estatísticas básicas para colunas numéricas
      let statistics = {}
      
      if (column.data_type === 'integer' || column.data_type === 'numeric') {
        const { data: stats, error: statsError } = await supabase.rpc(
          'calculate_numeric_statistics',
          { table_name: tableName, column_name: columnName }
        )
        
        if (!statsError && stats) {
          statistics = stats
        }
      }
      
      // Calcular completude e unicidade
      const completeness = totalRows > 0 ? ((totalRows - nullCount) / totalRows) * 100 : 0
      const uniqueness = totalRows > 0 ? ((totalRows - duplicateCount) / totalRows) * 100 : 0
      
      // Adicionar resultado de qualidade
      qualityResults.push({
        column_name: columnName,
        display_name: column.display_name || columnName,
        data_type: column.data_type,
        quality_metrics: {
          completeness,
          uniqueness,
          null_count: nullCount,
          duplicate_count: duplicateCount
        },
        statistics
      })
      
      // Atualizar estatísticas na tabela de metadados
      await supabase
        .from('column_metadata')
        .update({
          statistics: {
            completeness,
            uniqueness,
            null_count: nullCount,
            duplicate_count: duplicateCount,
            ...statistics
          }
        })
        .eq('id', column.id)
    }
    
    // Salvar resultados completos da análise
    await supabase
      .from('data_analyses')
      .insert({
        import_id: fileId,
        analysis_type: 'quality',
        results: { columns: qualityResults, total_rows: totalRows }
      })
    
    // Atualizar qualidade geral na tabela de imports
    const overallCompleteness = qualityResults.reduce((sum, col) => sum + col.quality_metrics.completeness, 0) / qualityResults.length
    const overallUniqueness = qualityResults.reduce((sum, col) => sum + col.quality_metrics.uniqueness, 0) / qualityResults.length
    
    await supabase
      .from('data_imports')
      .update({
        data_quality: {
          completeness: overallCompleteness,
          uniqueness: overallUniqueness,
          analyzed_at: new Date().toISOString()
        }
      })
      .eq('id', fileId)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        quality: {
          columns: qualityResults,
          overall: {
            completeness: overallCompleteness,
            uniqueness: overallUniqueness
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Erro na análise de qualidade:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
