
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface ColumnStatistics {
  count: number
  distinctCount: number
  nullCount: number
  min?: number | string
  max?: number | string
  mean?: number
  median?: number
  mode?: string[]
  standardDeviation?: number
  quartiles?: number[]
  distribution?: Record<string, number>
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
    const numericValues = values.filter((v: any) => typeof v === 'number')
    const nonNullValues = values.filter((v: any) => v !== null && v !== undefined && v !== '')

    // Estatísticas básicas
    const stats: ColumnStatistics = {
      count: values.length,
      distinctCount: new Set(values).size,
      nullCount: values.length - nonNullValues.length,
    }

    // Se tivermos valores numéricos, calcular estatísticas numéricas
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b)
      stats.min = sorted[0]
      stats.max = sorted[sorted.length - 1]
      stats.mean = sorted.reduce((a, b) => a + b, 0) / sorted.length
      stats.median = sorted[Math.floor(sorted.length / 2)]
      
      // Calcular quartis
      stats.quartiles = [
        sorted[Math.floor(sorted.length * 0.25)],
        sorted[Math.floor(sorted.length * 0.5)],
        sorted[Math.floor(sorted.length * 0.75)]
      ]

      // Desvio padrão
      const mean = stats.mean
      stats.standardDeviation = Math.sqrt(
        sorted.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sorted.length
      )
    }

    // Calcular distribuição de valores
    const distribution: Record<string, number> = {}
    for (const value of values) {
      const key = String(value)
      distribution[key] = (distribution[key] || 0) + 1
    }
    stats.distribution = distribution

    // Encontrar moda (valores mais frequentes)
    const frequencies = Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    stats.mode = frequencies.map(([value]) => value)

    return new Response(
      JSON.stringify({ stats }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
