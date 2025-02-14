
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      console.error('Parâmetros faltando:', { file: !!file, organizationId })
      throw new Error('File and organizationId are required')
    }

    console.log('Dados recebidos:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      organizationId
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Criar entrada no banco de dados
    const { data: fileMetadata, error: dbError } = await supabase
      .from('data_files_metadata')
      .insert({
        organization_id: organizationId,
        file_name: file.name,
        original_filename: file.name,
        file_type: file.type,
        file_size: file.size,
        status: 'processing'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erro ao criar registro:', dbError)
      throw dbError
    }

    console.log('Registro criado:', fileMetadata)

    // Processar arquivo
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

    // Análise de colunas
    const columnAnalysis = headers.map((header, index) => {
      const columnData = dataRows.map(row => row[index])
      const sample = dataRows[0][index]
      let type = 'text'

      if (typeof sample === 'number') {
        type = Number.isInteger(sample) ? 'integer' : 'numeric'
      } else if (typeof sample === 'boolean') {
        type = 'boolean'
      } else if (sample instanceof Date) {
        type = 'timestamp'
      }

      return {
        name: header,
        type,
        sample
      }
    })

    // Atualizar metadados
    const { error: updateError } = await supabase
      .from('data_files_metadata')
      .update({
        columns_metadata: { columns: columnAnalysis },
        preview_data: previewData,
        status: 'ready'
      })
      .eq('id', fileMetadata.id)

    if (updateError) {
      console.error('Erro ao atualizar metadados:', updateError)
      throw updateError
    }

    // Importar dados para tabela temporária
    console.log('Iniciando importação dos dados...')

    const importPromises = dataRows.map(async (row, index) => {
      const rowData: Record<string, any> = {}
      headers.forEach((header, colIndex) => {
        rowData[header] = row[colIndex]
      })

      try {
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
      } catch (e) {
        console.error(`Erro ao processar linha ${index + 1}:`, e)
        throw e
      }
    })

    await Promise.all(importPromises)
    console.log('Importação concluída com sucesso')

    return new Response(
      JSON.stringify({
        success: true,
        file_id: fileMetadata.id,
        total_rows: dataRows.length,
        preview_data: previewData,
        columns: columnAnalysis
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Erro no processamento:', error)
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
        status: 500
      }
    )
  }
})
