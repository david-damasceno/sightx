
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface QualityMetrics {
  completeness: number
  uniqueness: number
  consistency: number
  accuracy: number
  validity: number
  issues: Array<{
    type: string
    description: string
    rowCount: number
  }>
}

serve(async (req) => {
  try {
    const { fileId, columnName } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar dados do arquivo
    const { data: fileData, error: fileError } = await supabase.functions.invoke('read-file-data', {
      body: { fileId, page: 1, pageSize: 1000 }
    })

    if (fileError) throw fileError

    const values = fileData.data.map((row: any) => row[columnName])
    const totalRows = values.length
    const nonNullValues = values.filter((v: any) => v !== null && v !== undefined && v !== '')
    const uniqueValues = new Set(values)

    // Calcular métricas
    const completeness = nonNullValues.length / totalRows
    const uniqueness = uniqueValues.size / totalRows

    // Análise de consistência
    let consistency = 1
    const issues: Array<{type: string, description: string, rowCount: number}> = []
    const patternMismatches = values.filter((v: any) => {
      if (typeof v === 'string') {
        // Verificar padrões inconsistentes
        const hasNumbers = /\d/.test(v)
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(v)
        return hasNumbers && hasSpecialChars
      }
      return false
    }).length

    if (patternMismatches > 0) {
      consistency = 1 - (patternMismatches / totalRows)
      issues.push({
        type: 'pattern_mismatch',
        description: 'Valores com formatos inconsistentes encontrados',
        rowCount: patternMismatches
      })
    }

    // Verificar valores nulos ou vazios
    const nullCount = values.filter((v: any) => v === null || v === undefined || v === '').length
    if (nullCount > 0) {
      issues.push({
        type: 'null_values',
        description: 'Valores nulos ou vazios encontrados',
        rowCount: nullCount
      })
    }

    const metrics: QualityMetrics = {
      completeness,
      uniqueness,
      consistency,
      accuracy: 1, // Placeholder
      validity: 1, // Placeholder
      issues
    }

    return new Response(
      JSON.stringify({ quality: metrics }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
