
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import * as XLSX from "https://esm.sh/xlsx@0.18.5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileId } = await req.json()

    if (!fileId) {
      throw new Error('FileId is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar dados do arquivo
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .single()

    if (importError) throw importError
    if (!importData) throw new Error('Import not found')

    // Baixar arquivo do storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(importData.storage_path)

    if (downloadError) throw downloadError

    // Ler o arquivo
    const arrayBuffer = await fileData.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    let workbook
    try {
      workbook = XLSX.read(data, { type: 'array' })
    } catch (error) {
      throw new Error('Invalid file format')
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

    if (!Array.isArray(jsonData) || jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row')
    }

    const headers = jsonData[0] as string[]
    const dataRows = jsonData.slice(1)

    // Criar registros para cada coluna
    const columnPromises = headers.map(async (header, index) => {
      const columnData = dataRows.map(row => row[index])
      const sample = columnData[0]
      
      // Inferir tipo de dado
      let type = 'text'
      if (typeof sample === 'number') {
        type = Number.isInteger(sample) ? 'integer' : 'numeric'
      } else if (typeof sample === 'boolean') {
        type = 'boolean'
      } else if (sample instanceof Date) {
        type = 'timestamp'
      }

      const { error: insertError } = await supabase
        .from('data_file_columns')
        .insert({
          file_id: fileId,
          organization_id: importData.organization_id,
          original_name: header,
          data_type: type,
          sample_data: String(sample),
          status: 'active'
        })

      if (insertError) throw insertError
    })

    await Promise.all(columnPromises)

    // Atualizar status do import
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({ status: 'analyzed' })
      .eq('id', fileId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        columns: headers.length,
        rows: dataRows.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
