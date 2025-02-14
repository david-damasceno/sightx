
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
    console.log('Processando arquivo:', fileId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar informações do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError || !fileData) {
      console.error('Erro ao buscar arquivo:', fileError)
      throw new Error('Arquivo não encontrado')
    }

    console.log('Dados do arquivo encontrados:', fileData)

    // Atualizar status para analyzing
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({ status: 'analyzing' })
      .eq('id', fileId)

    if (updateError) throw updateError

    // Baixar o arquivo do storage
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(fileData.storage_path)

    if (downloadError) {
      console.error('Erro ao baixar arquivo:', downloadError)
      throw downloadError
    }

    console.log('Arquivo baixado com sucesso')

    // Converter para array buffer
    const arrayBuffer = await fileBuffer.arrayBuffer()

    // Ler o arquivo usando xlsx
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    console.log('Arquivo convertido para JSON:', { totalRows: jsonData.length })

    // Analisar colunas
    const columns = Object.keys(jsonData[0] || {})
    const sampleData = jsonData.slice(0, 5)

    // Criar registros de colunas
    for (const column of columns) {
      const { error: columnError } = await supabase
        .from('data_file_columns')
        .insert({
          file_id: fileId,
          organization_id: fileData.organization_id,
          original_name: column,
          sample_data: JSON.stringify(sampleData.map(row => row[column])),
        })

      if (columnError) {
        console.error('Erro ao criar coluna:', columnError)
        throw columnError
      }
    }

    // Atualizar status para editing
    const { error: finalUpdateError } = await supabase
      .from('data_imports')
      .update({
        status: 'editing',
        row_count: jsonData.length,
      })
      .eq('id', fileId)

    if (finalUpdateError) throw finalUpdateError

    return new Response(
      JSON.stringify({ success: true, message: 'Arquivo processado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
