
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Papa from 'https://esm.sh/papaparse@5.4.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileId, page = 1, pageSize = 100 } = await req.json()
    console.log('Recebido pedido para ler arquivo:', { fileId, page, pageSize })

    // Buscar informações do arquivo
    const { data: fileInfo, error: fileError } = await supabase
      .from('data_imports')
      .select('storage_path, file_type')
      .eq('id', fileId)
      .single()

    if (fileError) {
      console.error('Erro ao buscar informações do arquivo:', fileError)
      throw fileError
    }

    if (!fileInfo?.storage_path) {
      throw new Error('Caminho do arquivo não encontrado')
    }

    console.log('Informações do arquivo encontradas:', fileInfo)

    // Download do arquivo
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('data_files')
      .download(fileInfo.storage_path)

    if (downloadError) {
      console.error('Erro ao fazer download do arquivo:', downloadError)
      throw downloadError
    }

    // Converter o arquivo para texto
    const text = await fileData.text()

    // Parsear o CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    })

    if (parseResult.errors.length > 0) {
      console.error('Erros ao parsear CSV:', parseResult.errors)
      throw new Error('Erro ao parsear arquivo CSV')
    }

    // Calcular paginação
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = parseResult.data.slice(startIndex, endIndex)

    console.log('Dados paginados preparados:', {
      total: parseResult.data.length,
      page,
      pageSize,
      returnedRows: paginatedData.length
    })

    return new Response(
      JSON.stringify({
        data: paginatedData,
        totalRows: parseResult.data.length,
        page,
        pageSize
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    return new Response(
      JSON.stringify({
        error: 'Erro ao processar arquivo',
        details: error.message
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
