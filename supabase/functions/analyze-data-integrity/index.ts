
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("analyze-data-integrity function started")

Deno.serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileId, tableName, organizationId } = await req.json()

    if (!fileId || !organizationId) {
      throw new Error('fileId e organizationId são obrigatórios')
    }

    // Cria o cliente do Supabase usando as variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Analisando integridade para o arquivo ${fileId}, tabela ${tableName || 'não especificada'}`)

    // Buscar os dados importados
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()

    if (importError || !importData) {
      throw new Error(`Falha ao buscar dados do arquivo: ${importError?.message || "Arquivo não encontrado"}`)
    }

    const actualTableName = tableName || importData.table_name

    if (!actualTableName) {
      throw new Error('Nome da tabela não especificado e não encontrado nos dados importados')
    }

    console.log(`Usando tabela: ${actualTableName}`)

    // Buscar os dados da tabela
    const { data: tableData, error: tableError } = await supabase
      .from(actualTableName)
      .select('*')
      .limit(1000) // Limitar para não sobrecarregar a análise

    if (tableError) {
      throw new Error(`Falha ao buscar dados da tabela: ${tableError.message}`)
    }

    if (!tableData || tableData.length === 0) {
      throw new Error('Nenhum dado encontrado na tabela para análise')
    }

    console.log(`Analisando ${tableData.length} registros`)

    // Extrair colunas da tabela
    const columns = Object.keys(tableData[0])
    
    // Calcular métricas de integridade
    const metrics = analyzeDataIntegrity(tableData, columns)

    return new Response(
      JSON.stringify({
        status: 'success',
        metrics,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro:', error.message)
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function analyzeDataIntegrity(data: any[], columns: string[]) {
  const totalRows = data.length
  const metrics = {
    completeness: 0,
    uniqueness: 0,
    consistency: 0,
    overall: 0,
    recommendations: [] as Array<{
      type: string,
      description: string,
      impact: string,
      column?: string
    }>
  }

  // 1. Calcular Completude
  const completenessScores: Record<string, number> = {}
  let totalCompletenessScore = 0

  columns.forEach(column => {
    let nonNullCount = 0
    data.forEach(row => {
      if (row[column] !== null && row[column] !== undefined && row[column] !== '') {
        nonNullCount++
      }
    })
    
    const columnCompleteness = nonNullCount / totalRows
    completenessScores[column] = columnCompleteness
    totalCompletenessScore += columnCompleteness
  })

  metrics.completeness = totalCompletenessScore / columns.length

  // 2. Calcular Unicidade
  const uniquenessScores: Record<string, number> = {}
  let totalUniquenessScore = 0

  columns.forEach(column => {
    const valueSet = new Set()
    let uniqueCount = 0
    
    data.forEach(row => {
      const value = row[column]
      if (!valueSet.has(value)) {
        valueSet.add(value)
        uniqueCount++
      }
    })
    
    const columnUniqueness = uniqueCount / totalRows
    uniquenessScores[column] = columnUniqueness
    totalUniquenessScore += columnUniqueness
  })

  metrics.uniqueness = totalUniquenessScore / columns.length

  // 3. Analisar Consistência (formato, padrões)
  const consistencyScores: Record<string, number> = {}
  let totalConsistencyScore = 0

  columns.forEach(column => {
    // Inferir tipo de dado mais comum na coluna
    const typeStats = inferColumnType(data, column)
    const dominantType = typeStats.dominantType
    const typesCount = typeStats.typesCount
    
    // Calcular consistência como proporção do tipo dominante
    const consistencyScore = typesCount[dominantType] / totalRows
    consistencyScores[column] = consistencyScore
    totalConsistencyScore += consistencyScore
    
    // Adicionar recomendações para colunas com baixa consistência
    if (consistencyScore < 0.8) {
      metrics.recommendations.push({
        type: 'format_standardization',
        column,
        description: `Padronização de formato na coluna '${column}'`,
        impact: `Melhorar consistência de ${Math.round(consistencyScore * 100)}% para próximo de 100%`
      })
    }
  })

  metrics.consistency = totalConsistencyScore / columns.length

  // 4. Calcular pontuação geral
  metrics.overall = (metrics.completeness * 0.4 + metrics.uniqueness * 0.3 + metrics.consistency * 0.3)

  // 5. Adicionar recomendações para colunas com dados incompletos
  columns.forEach(column => {
    if (completenessScores[column] < 0.9) {
      const missingCount = Math.round((1 - completenessScores[column]) * totalRows)
      metrics.recommendations.push({
        type: 'fill_missing_values',
        column,
        description: `Preenchimento de dados ausentes na coluna '${column}'`,
        impact: `${missingCount} valor(es) ausente(s) detectado(s)`
      })
    }
  })

  // 6. Adicionar recomendações para duplicatas
  columns.forEach(column => {
    if (uniquenessScores[column] < 0.9 && uniquenessScores[column] > 0.5) {
      const duplicatesCount = Math.round((1 - uniquenessScores[column]) * totalRows)
      metrics.recommendations.push({
        type: 'remove_duplicates',
        column,
        description: `Remoção de valores duplicados na coluna '${column}'`,
        impact: `${duplicatesCount} valor(es) duplicado(s) detectado(s)`
      })
    }
  })

  // Limitar recomendações às mais relevantes
  metrics.recommendations.sort((a, b) => {
    const getImpactScore = (rec: any) => {
      if (rec.type === 'fill_missing_values') return 3
      if (rec.type === 'remove_duplicates') return 2
      return 1
    }
    return getImpactScore(b) - getImpactScore(a)
  })

  // Limitar a 5 recomendações mais importantes
  metrics.recommendations = metrics.recommendations.slice(0, 5)

  return metrics
}

function inferColumnType(data: any[], column: string) {
  const types = {
    'number': 0,
    'string': 0,
    'date': 0,
    'boolean': 0,
    'null': 0
  }
  
  const totalRows = data.length
  const typesCount: Record<string, number> = {}
  
  // Identificar tipos
  data.forEach(row => {
    const value = row[column]
    let type = 'string'
    
    if (value === null || value === undefined || value === '') {
      type = 'null'
    } else if (!isNaN(Number(value)) && value !== '') {
      type = 'number'
    } else if (isDate(value)) {
      type = 'date'
    } else if (value === 'true' || value === 'false' || value === true || value === false) {
      type = 'boolean'
    }
    
    types[type]++
  })
  
  // Determinar tipo dominante
  let dominantType = 'string'
  let maxCount = 0
  
  Object.keys(types).forEach(type => {
    if (types[type] > maxCount && type !== 'null') {
      maxCount = types[type]
      dominantType = type
    }
    typesCount[type] = types[type] / (totalRows - types['null'])
  })
  
  return { dominantType, typesCount }
}

function isDate(value: any) {
  if (typeof value !== 'string') return false
  
  // Tentar alguns formatos de data comuns
  const dateFormats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/ // DD-MM-YYYY
  ]
  
  return dateFormats.some(format => format.test(value))
}
