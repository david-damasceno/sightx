
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
    const { fileId, page = 1, pageSize = 50, organizationId } = await req.json()
    console.log('Processando arquivo:', { fileId, page, pageSize, organizationId })

    if (!fileId || !organizationId) {
      throw new Error('File ID e Organization ID são obrigatórios')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar informações do arquivo e da organização
    const [fileResult, orgResult] = await Promise.all([
      supabase
        .from('data_imports')
        .select('storage_path, file_type')
        .eq('id', fileId)
        .eq('organization_id', organizationId)
        .single(),
      
      supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single()
    ])

    if (fileResult.error || !fileResult.data) {
      console.error('Erro ao buscar arquivo:', fileResult.error)
      throw new Error('Arquivo não encontrado')
    }

    if (orgResult.error) {
      console.error('Erro ao buscar organização:', orgResult.error)
      throw new Error('Organização não encontrada')
    }

    const fileData = fileResult.data
    const schemaName = orgResult.data.settings?.schema_name || 'public'
    
    console.log('Dados recuperados:', {
      arquivo: fileData.storage_path,
      esquema: schemaName
    })

    // Baixar o arquivo do bucket específico da organização
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from(organizationId)
      .download(fileData.storage_path)

    // Se não encontrar no bucket da organização, tenta no bucket padrão 'data_files'
    let buffer = fileBuffer
    if (downloadError) {
      console.log('Arquivo não encontrado no bucket da organização, tentando bucket padrão')
      const { data: defaultBuffer, error: defaultError } = await supabase
        .storage
        .from('data_files')
        .download(fileData.storage_path)
        
      if (defaultError) {
        console.error('Erro ao baixar arquivo:', defaultError)
        throw defaultError
      }
      
      buffer = defaultBuffer
    }

    console.log('Arquivo baixado com sucesso')

    // Converter para array buffer
    const arrayBuffer = await buffer.arrayBuffer()

    // Ler o arquivo usando xlsx
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false 
    })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd',
      defval: null
    })
    console.log('Arquivo convertido para JSON:', { totalRows: jsonData.length })

    // Calcular paginação
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const totalRows = jsonData.length
    const totalPages = Math.ceil(totalRows / pageSize)

    // Retornar dados paginados
    const paginatedData = jsonData.slice(startIndex, endIndex)
    console.log('Dados paginados:', { 
      page, 
      pageSize, 
      totalPages, 
      returnedRows: paginatedData.length,
      schema: schemaName
    })

    return new Response(
      JSON.stringify({
        data: paginatedData,
        page,
        pageSize,
        totalPages,
        totalRows,
        schema: schemaName
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
