
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalyzeDataQualityRequest {
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
    
    const { fileId, tableName, organizationId } = await req.json() as AnalyzeDataQualityRequest
    
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
    
    // Total de registros na tabela
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      throw new Error(countError.message)
    }
    
    const totalRows = count || 0
    
    // Analisar qualidade de cada coluna
    const columnQualities = []
    const issues = []
    
    for (const column of columnsData) {
      // Verificar valores nulos/vazios
      const { count: nullCount, error: nullError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .or(`${column.original_name}.is.null,${column.original_name}.eq.''`)
      
      if (nullError) {
        console.error(`Erro ao verificar nulos em ${column.original_name}:`, nullError)
        continue
      }
      
      // Verificar valores únicos
      const { data: uniqueData, error: uniqueError } = await supabase
        .rpc('count_distinct_values', { 
          table_name: tableName,
          column_name: column.original_name
        })
      
      const uniqueCount = uniqueData || 0
      
      if (uniqueError) {
        console.error(`Erro ao verificar valores únicos em ${column.original_name}:`, uniqueError)
      }
      
      // Calcular métricas
      const nullRatio = totalRows > 0 ? (nullCount || 0) / totalRows : 0
      const completeness = 1 - nullRatio
      const uniqueness = totalRows > 0 ? uniqueCount / totalRows : 0
      
      // Atualizar estatísticas da coluna
      await supabase
        .from('column_metadata')
        .update({
          statistics: {
            completeness,
            uniqueness,
            nullCount: nullCount || 0,
            uniqueCount
          }
        })
        .eq('id', column.id)
      
      // Registrar problemas de qualidade
      if (completeness < 0.95) {
        issues.push({
          columnName: column.original_name,
          displayName: column.display_name,
          issueType: 'completeness',
          severity: completeness < 0.8 ? 'high' : 'medium',
          description: `A coluna tem ${Math.round((1-completeness) * 100)}% de valores vazios ou nulos.`
        })
      }
      
      columnQualities.push({
        columnId: column.id,
        originalName: column.original_name,
        displayName: column.display_name,
        dataType: column.data_type,
        completeness,
        uniqueness,
        issues: completeness < 0.95 ? 1 : 0
      })
    }
    
    // Calcular métricas gerais
    const overallCompleteness = columnQualities.reduce((sum, col) => sum + col.completeness, 0) / columnQualities.length
    const overallQuality = columnQualities.reduce((sum, col) => sum + (col.completeness * 0.7 + col.uniqueness * 0.3), 0) / columnQualities.length
    
    // Registrar análise
    const { data: analysisData, error: analysisError } = await supabase
      .from('data_analyses')
      .insert({
        import_id: fileId,
        analysis_type: 'quality',
        configuration: {},
        results: {
          columnQualities,
          overallCompleteness,
          overallQuality,
          issues,
          issuesCount: issues.length,
          totalRows
        }
      })
      .select()
      .single()
    
    if (analysisError) {
      throw new Error(analysisError.message)
    }
    
    // Atualizar metadata do arquivo
    await supabase
      .from('data_imports')
      .update({
        data_quality: {
          lastAnalysisId: analysisData.id,
          overallQuality,
          issuesCount: issues.length
        }
      })
      .eq('id', fileId)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Análise de qualidade concluída com sucesso',
        analysis: analysisData
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
