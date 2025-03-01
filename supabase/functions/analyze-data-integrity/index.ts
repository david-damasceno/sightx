
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Define tipos para as métricas de integridade
interface IntegrityMetrics {
  overall: number;
  completeness: number; 
  uniqueness: number;
  consistency: number;
  recommendations?: {
    type: string;
    description: string;
    impact: string;
    column?: string;
  }[];
}

interface ColumnStatistics {
  nullCount: number;
  totalRows: number;
  duplicateCount: number;
  distinctValues: Set<string>;
  patterns: Record<string, number>;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { fileId, tableName, organizationId } = await req.json()
    
    if (!fileId || !organizationId) {
      throw new Error('fileId e organizationId são obrigatórios')
    }
    
    console.log(`Analisando integridade dos dados para arquivo: ${fileId}, organização: ${organizationId}`)
    
    // Buscar informações sobre o arquivo e tabela associada
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('table_name, row_count')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()
    
    if (fileError) {
      throw new Error(`Erro ao buscar dados do arquivo: ${fileError.message}`)
    }
    
    if (!fileData.table_name) {
      throw new Error('Tabela não encontrada para este arquivo')
    }
    
    // Buscar metadados das colunas
    const { data: columnsData, error: columnsError } = await supabase
      .from('data_file_columns')
      .select('original_name, data_type')
      .eq('file_id', fileId)
      .eq('organization_id', organizationId)
    
    if (columnsError) {
      throw new Error(`Erro ao buscar colunas: ${columnsError.message}`)
    }
    
    // Analisar cada coluna
    const columnStats: Record<string, ColumnStatistics> = {}
    const totalRows = fileData.row_count || 0
    
    // Para cada coluna, vamos analisar o conteúdo
    for (const column of columnsData) {
      // Contar valores nulos
      const { count: nullCount, error: nullError } = await supabase.rpc(
        'count_null_values',
        { 
          table_name: fileData.table_name, 
          column_name: column.original_name 
        }
      )
      
      if (nullError) {
        console.error(`Erro ao contar nulos em ${column.original_name}: ${nullError.message}`)
        continue
      }
      
      // Contar valores duplicados
      const { count: duplicateCount, error: duplicateError } = await supabase.rpc(
        'count_duplicate_values',
        { 
          table_name: fileData.table_name, 
          column_name: column.original_name 
        }
      )
      
      if (duplicateError) {
        console.error(`Erro ao contar duplicados em ${column.original_name}: ${duplicateError.message}`)
        continue
      }
      
      // Buscar amostra de dados para análise de padrões
      const { data: sampleData, error: sampleError } = await supabase
        .from(fileData.table_name)
        .select(column.original_name)
        .limit(100)
      
      if (sampleError) {
        console.error(`Erro ao buscar amostra para ${column.original_name}: ${sampleError.message}`)
        continue
      }
      
      // Analisar padrões nos dados
      const patterns: Record<string, number> = {}
      const distinctValues = new Set<string>()
      
      for (const row of sampleData) {
        const value = row[column.original_name]
        if (value !== null) {
          distinctValues.add(String(value))
          
          // Identificar padrão do valor
          const pattern = inferPattern(value, column.data_type)
          patterns[pattern] = (patterns[pattern] || 0) + 1
        }
      }
      
      // Salvar estatísticas da coluna
      columnStats[column.original_name] = {
        nullCount: nullCount || 0,
        totalRows,
        duplicateCount: duplicateCount || 0,
        distinctValues,
        patterns
      }
    }
    
    // Calcular métricas gerais
    const metrics = calculateMetrics(columnStats, totalRows)
    
    // Gerar recomendações
    const recommendations = generateRecommendations(columnStats, metrics)
    metrics.recommendations = recommendations
    
    // Salvar os resultados na tabela data_analysis_results
    const { error: saveError } = await supabase
      .from('data_analysis_results')
      .insert({
        file_id: fileId,
        organization_id: organizationId,
        analysis_type: 'integrity',
        column_name: 'all',
        results: metrics
      })
    
    if (saveError) {
      console.error(`Erro ao salvar resultados: ${saveError.message}`)
    }
    
    return new Response(
      JSON.stringify({ metrics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } 
  catch (error) {
    console.error(`Erro na análise de integridade: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Função para inferir o padrão de um valor
function inferPattern(value: any, dataType: string): string {
  if (value === null || value === undefined) return 'null'
  
  const strValue = String(value)
  
  // Verificar tipo de dados
  if (dataType?.includes('int') || dataType?.includes('numeric') || dataType?.includes('float')) {
    return 'numeric'
  }
  
  if (dataType?.includes('date') || dataType?.includes('time')) {
    return 'date'
  }
  
  if (dataType?.includes('bool')) {
    return 'boolean'
  }
  
  // Para strings, verificar formatos comuns
  if (/^\d+$/.test(strValue)) return 'digits'
  if (/^[A-Za-z\s]+$/.test(strValue)) return 'text'
  if (/^[A-Za-z0-9\s]+$/.test(strValue)) return 'alphanumeric'
  if (/^\S+@\S+\.\S+$/.test(strValue)) return 'email'
  if (/^\+?[\d\s-()]+$/.test(strValue)) return 'phone'
  
  return 'mixed'
}

// Função para calcular métricas de integridade
function calculateMetrics(
  columnStats: Record<string, ColumnStatistics>, 
  totalRows: number
): IntegrityMetrics {
  const columns = Object.keys(columnStats)
  
  // Evitar divisão por zero
  if (columns.length === 0 || totalRows === 0) {
    return {
      overall: 0,
      completeness: 0,
      uniqueness: 0,
      consistency: 0
    }
  }
  
  // Calcular completude (porcentagem de valores não nulos)
  let totalCompleteness = 0
  for (const colName of columns) {
    const stats = columnStats[colName]
    const colCompleteness = (stats.totalRows - stats.nullCount) / stats.totalRows
    totalCompleteness += colCompleteness
  }
  const completeness = totalCompleteness / columns.length
  
  // Calcular unicidade (ausência de duplicações)
  let totalUniqueness = 0
  for (const colName of columns) {
    const stats = columnStats[colName]
    // Calcular unicidade considerando apenas valores não nulos
    const uniqueRatio = 1 - (stats.duplicateCount / (stats.totalRows - stats.nullCount || 1))
    totalUniqueness += uniqueRatio
  }
  const uniqueness = totalUniqueness / columns.length
  
  // Calcular consistência (uniformidade de padrões)
  let totalConsistency = 0
  for (const colName of columns) {
    const stats = columnStats[colName]
    
    // Se temos padrões, calcular consistência
    if (Object.keys(stats.patterns).length > 0) {
      // Encontrar o padrão dominante
      let dominantPattern = ''
      let dominantCount = 0
      
      for (const [pattern, count] of Object.entries(stats.patterns)) {
        if (count > dominantCount) {
          dominantPattern = pattern
          dominantCount = count
        }
      }
      
      // Calcular proporção do padrão dominante
      const totalPatternValues = Object.values(stats.patterns).reduce((sum, count) => sum + count, 0)
      const consistency = dominantCount / totalPatternValues
      totalConsistency += consistency
    } else {
      // Se não há padrões (todos nulos), considerar consistência baixa
      totalConsistency += 0.5
    }
  }
  const consistency = totalConsistency / columns.length
  
  // Calcular pontuação geral (média ponderada)
  const overall = (
    completeness * 0.4 + 
    uniqueness * 0.3 + 
    consistency * 0.3
  )
  
  return {
    overall,
    completeness,
    uniqueness,
    consistency
  }
}

// Função para gerar recomendações
function generateRecommendations(
  columnStats: Record<string, ColumnStatistics>,
  metrics: IntegrityMetrics
): { type: string; description: string; impact: string; column?: string }[] {
  const recommendations = []
  
  // Verificar completude e fazer recomendações para valores nulos
  for (const [colName, stats] of Object.entries(columnStats)) {
    if (stats.nullCount / stats.totalRows > 0.1) {
      recommendations.push({
        type: 'fill_nulls',
        description: `Preencher valores ausentes na coluna ${colName}`,
        impact: 'Melhorará a completude dos dados',
        column: colName
      })
    }
  }
  
  // Verificar duplicações
  for (const [colName, stats] of Object.entries(columnStats)) {
    if (stats.duplicateCount > stats.totalRows * 0.2) {
      recommendations.push({
        type: 'handle_duplicates',
        description: `Tratar valores duplicados na coluna ${colName}`,
        impact: 'Melhorará a unicidade dos dados',
        column: colName
      })
    }
  }
  
  // Verificar consistência
  for (const [colName, stats] of Object.entries(columnStats)) {
    // Se temos múltiplos padrões
    if (Object.keys(stats.patterns).length > 1) {
      // Verificar se há inconsistência significativa
      let mainPattern = ''
      let mainCount = 0
      
      for (const [pattern, count] of Object.entries(stats.patterns)) {
        if (count > mainCount) {
          mainPattern = pattern
          mainCount = count
        }
      }
      
      const totalValues = Object.values(stats.patterns).reduce((sum, count) => sum + count, 0)
      
      // Se o padrão principal não representa ao menos 80% dos valores
      if (mainCount / totalValues < 0.8) {
        recommendations.push({
          type: 'standardize_format',
          description: `Padronizar o formato na coluna ${colName}`,
          impact: 'Melhorará a consistência dos dados',
          column: colName
        })
      }
    }
  }
  
  return recommendations
}
