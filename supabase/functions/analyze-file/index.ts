
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import * as XLSX from "https://esm.sh/xlsx@0.18.5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 50; // Processar 50 colunas por vez

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

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      throw updateError
    }

    // Baixar o arquivo do storage
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(fileData.storage_path)

    if (downloadError) {
      console.error('Erro ao baixar arquivo:', downloadError)
      await handleError(supabase, fileId, 'Erro ao baixar arquivo: ' + downloadError.message)
      throw downloadError
    }

    console.log('Arquivo baixado com sucesso')

    // Converter para array buffer com tratamento de erro
    let arrayBuffer;
    try {
      arrayBuffer = await fileBuffer.arrayBuffer()
    } catch (error) {
      console.error('Erro ao converter arquivo:', error)
      await handleError(supabase, fileId, 'Erro ao converter arquivo')
      throw error
    }

    // Ler o arquivo usando xlsx com tratamento de erro
    let workbook;
    try {
      workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      })
    } catch (error) {
      console.error('Erro ao ler arquivo Excel:', error)
      await handleError(supabase, fileId, 'Erro ao ler arquivo Excel')
      throw error
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Converter para JSON com tratamento de memória
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd',
      defval: null
    })

    console.log('Arquivo convertido para JSON:', { totalRows: jsonData.length })

    if (jsonData.length === 0) {
      await handleError(supabase, fileId, 'Arquivo está vazio')
      throw new Error('Arquivo está vazio')
    }

    // Analisar colunas
    const columns = Object.keys(jsonData[0] || {})
    const sampleData = jsonData.slice(0, 5)

    // Processar colunas em lotes
    for (let i = 0; i < columns.length; i += BATCH_SIZE) {
      const columnBatch = columns.slice(i, i + BATCH_SIZE)
      
      const columnsData = columnBatch.map(column => ({
        file_id: fileId,
        organization_id: fileData.organization_id,
        original_name: column,
        sample_data: JSON.stringify(sampleData.map(row => row[column])),
      }))

      const { error: batchError } = await supabase
        .from('data_file_columns')
        .insert(columnsData)

      if (batchError) {
        console.error('Erro ao criar lote de colunas:', batchError)
        await handleError(supabase, fileId, 'Erro ao processar colunas: ' + batchError.message)
        throw batchError
      }

      console.log(`Processado lote de colunas ${i + 1} até ${i + columnBatch.length}`)
    }

    // Atualizar status para editing
    const { error: finalUpdateError } = await supabase
      .from('data_imports')
      .update({
        status: 'editing',
        row_count: jsonData.length,
      })
      .eq('id', fileId)

    if (finalUpdateError) {
      console.error('Erro ao atualizar status final:', finalUpdateError)
      throw finalUpdateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Arquivo processado com sucesso',
        totalRows: jsonData.length,
        totalColumns: columns.length
      }),
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

// Função auxiliar para tratamento de erros
async function handleError(supabase: any, fileId: string, errorMessage: string) {
  await supabase
    .from('data_imports')
    .update({ 
      status: 'error',
      error_message: errorMessage
    })
    .eq('id', fileId)
}

