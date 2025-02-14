
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
    const { fileId, page = 1, pageSize = 50 } = await req.json()

    if (!fileId) {
      throw new Error('File ID is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar informações do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('storage_path, file_type')
      .eq('id', fileId)
      .single()

    if (fileError || !fileData) {
      throw new Error('File not found')
    }

    // Baixar o arquivo do storage
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(fileData.storage_path)

    if (downloadError) {
      throw downloadError
    }

    // Converter para array buffer
    const arrayBuffer = await fileBuffer.arrayBuffer()

    // Ler o arquivo usando xlsx
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // Calcular paginação
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const totalRows = jsonData.length
    const totalPages = Math.ceil(totalRows / pageSize)

    // Retornar dados paginados
    const paginatedData = jsonData.slice(startIndex, endIndex)

    return new Response(
      JSON.stringify({
        data: paginatedData,
        page,
        pageSize,
        totalPages,
        totalRows
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
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
