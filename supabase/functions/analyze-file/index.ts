
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateTableName(fileName: string): string {
  const baseName = fileName.toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")

  const timestamp = new Date().getTime()
  return `${baseName}_${timestamp}`.slice(0, 63)
}

interface ColumnAnalysis {
  type: string
  nullCount: number
  uniqueCount: number
  minLength?: number
  maxLength?: number
  patterns?: { [key: string]: number }
  commonValues?: { value: string; count: number }[]
  numericalStats?: {
    min?: number
    max?: number
    avg?: number
    median?: number
  }
  confidence_score?: number
  detected_type?: string
}

function analyzeColumn(data: any[], sample: any): ColumnAnalysis {
  const analysis: ColumnAnalysis = {
    type: 'text',
    nullCount: 0,
    uniqueCount: new Set(data).size,
    patterns: {},
    commonValues: []
  }

  // Análise básica de tipos
  if (typeof sample === 'number') {
    analysis.type = Number.isInteger(sample) ? 'integer' : 'numeric'
    analysis.numericalStats = {
      min: Math.min(...data.filter(v => v !== null && v !== undefined) as number[]),
      max: Math.max(...data.filter(v => v !== null && v !== undefined) as number[]),
      avg: data.reduce((sum, val) => sum + (val || 0), 0) / data.length
    }
  } else if (typeof sample === 'boolean') {
    analysis.type = 'boolean'
  } else if (sample && !isNaN(Date.parse(String(sample)))) {
    analysis.type = 'timestamp'
  }

  // Análise de padrões em strings
  if (typeof sample === 'string') {
    analysis.minLength = Math.min(...data.map(v => String(v || '').length))
    analysis.maxLength = Math.max(...data.map(v => String(v || '').length))

    // Detectar padrões comuns brasileiros
    const patterns = {
      cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      cep: /^\d{5}-\d{3}$/,
      telefone: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      data: /^\d{2}\/\d{2}\/\d{4}$/
    }

    for (const [name, regex] of Object.entries(patterns)) {
      const matchCount = data.filter(v => regex.test(String(v))).length
      if (matchCount > 0) {
        analysis.patterns![name] = matchCount
      }
    }
  }

  // Contagem de valores nulos
  analysis.nullCount = data.filter(v => v === null || v === undefined || v === '').length

  // Valores mais comuns
  const valueCounts = data.reduce((acc, val) => {
    acc[String(val)] = (acc[String(val)] || 0) + 1
    return acc
  }, {} as { [key: string]: number })

  analysis.commonValues = Object.entries(valueCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return analysis
}

function suggestIndexes(columns: ColumnAnalysis[]): string[] {
  const suggestions: string[] = []

  columns.forEach((col, index) => {
    // Sugerir índices para chaves estrangeiras potenciais
    if (col.type === 'uuid' || (col.type === 'integer' && col.commonValues?.length === col.uniqueCount)) {
      suggestions.push(`CREATE INDEX ON table_name (column_${index})`)
    }

    // Sugerir índices para colunas frequentemente pesquisadas
    if (['email', 'cpf', 'cnpj'].some(pattern => col.patterns?.[pattern])) {
      suggestions.push(`CREATE INDEX ON table_name (column_${index})`)
    }

    // Sugerir índices para timestamps
    if (col.type === 'timestamp') {
      suggestions.push(`CREATE INDEX ON table_name (column_${index})`)
    }
  })

  return suggestions
}

function validateData(data: any[][], columns: ColumnAnalysis[]): any {
  const validation = {
    totalRows: data.length,
    invalidRows: [] as any[],
    validationRules: {} as any
  }

  columns.forEach((col, index) => {
    const rules: string[] = []

    // Regras baseadas no tipo
    if (col.type === 'numeric' || col.type === 'integer') {
      rules.push('NOT NULL')
      if (col.numericalStats?.min !== undefined) {
        rules.push(`CHECK (value >= ${col.numericalStats.min})`)
      }
      if (col.numericalStats?.max !== undefined) {
        rules.push(`CHECK (value <= ${col.numericalStats.max})`)
      }
    }

    // Regras para padrões específicos
    if (col.patterns) {
      if (col.patterns.email) rules.push('CHECK (value ~* \'^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$\')')
      if (col.patterns.cpf) rules.push('CHECK (value ~* \'^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$\')')
      if (col.patterns.cnpj) rules.push('CHECK (value ~* \'^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$\')')
    }

    validation.validationRules[`column_${index}`] = rules
  })

  return validation
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Iniciando processamento do arquivo...')
    const formData = await req.formData()
    const file = formData.get('file') as File
    const organizationId = formData.get('organizationId')

    if (!file || !organizationId) {
      throw new Error('File and organizationId are required')
    }

    console.log('Processando arquivo:', file.name, 'type:', file.type)

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    let workbook
    try {
      workbook = XLSX.read(data, { type: 'array' })
    } catch (error) {
      console.error('Erro ao ler arquivo:', error)
      throw new Error('Invalid file format. Please upload a valid Excel or CSV file.')
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    
    if (!firstSheet) {
      throw new Error('No sheet found in the workbook')
    }

    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

    if (!Array.isArray(jsonData) || jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row')
    }

    const headers = jsonData[0] as string[]
    if (!Array.isArray(headers) || headers.length === 0) {
      throw new Error('Invalid file format: No headers found')
    }

    console.log('Headers encontrados:', headers)

    const dataRows = jsonData.slice(1)
    const previewData = dataRows.slice(0, 5).map(row => {
      const rowData: Record<string, any> = {}
      headers.forEach((header, index) => {
        rowData[header] = row[index]
      })
      return rowData
    })

    console.log('Dados de preview gerados:', previewData)

    // Análise detalhada de cada coluna
    const columnAnalysis = headers.map((header, index) => {
      const columnData = dataRows.map(row => row[index])
      const analysis = analyzeColumn(columnData, dataRows[0][index])
      return {
        name: header,
        type: analysis.type,
        sample: dataRows[0][index],
        analysis
      }
    })

    console.log('Análise de colunas concluída:', columnAnalysis)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Criar registro de metadados do arquivo
    const { data: fileMetadata, error: metadataError } = await supabase
      .from('data_files_metadata')
      .insert({
        organization_id: organizationId,
        file_name: file.name,
        original_filename: file.name,
        file_type: file.type,
        file_size: file.size,
        status: 'processing',
        columns_metadata: {
          columns: columnAnalysis.map(col => ({
            name: col.name,
            type: col.type,
            sample: col.sample
          }))
        },
        preview_data: previewData,
        data_context: {
          total_rows: dataRows.length,
          total_columns: headers.length,
          file_type: file.type,
          sheet_name: workbook.SheetNames[0],
          created_at: new Date().toISOString(),
          analysis_version: "1.0"
        }
      })
      .select()
      .single()

    if (metadataError) {
      console.error('Erro ao salvar metadados:', metadataError)
      throw metadataError
    }

    console.log('Metadados salvos com sucesso, iniciando importação dos dados...')

    // Importar dados para a tabela temporária
    const importPromises = dataRows.map(async (row, index) => {
      const rowData: Record<string, any> = {}
      headers.forEach((header, colIndex) => {
        rowData[header] = row[colIndex]
      })

      const { error: importError } = await supabase
        .from('temp_imported_data')
        .insert({
          organization_id: organizationId,
          import_id: fileMetadata.id,
          row_data: rowData,
          row_number: index + 1,
          status: 'pending'
        })

      if (importError) {
        console.error(`Erro ao importar linha ${index + 1}:`, importError)
        throw importError
      }
    })

    // Usar Promise.all para processar todas as linhas
    await Promise.all(importPromises)

    // Atualizar status do arquivo para 'ready'
    const { error: updateError } = await supabase
      .from('data_files_metadata')
      .update({ status: 'ready' })
      .eq('id', fileMetadata.id)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      throw updateError
    }

    console.log('Importação concluída com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        file_id: fileMetadata.id,
        total_rows: dataRows.length,
        total_columns: headers.length,
        preview_data: previewData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Erro processando arquivo:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
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
