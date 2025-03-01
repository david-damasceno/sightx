
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0'
import { corsHeaders } from '../_shared/cors.ts'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

interface ProcessFileUploadRequest {
  fileId: string;
  organizationId: string;
}

interface ColumnDefinition {
  name: string;
  type: string;
  original_name: string;
  sample_value: any;
}

serve(async (req) => {
  // Lidar com opções de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { fileId, organizationId } = await req.json() as ProcessFileUploadRequest
    
    console.log(`Processando arquivo: ${fileId} para organização: ${organizationId}`)
    
    // Buscar informações do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()
    
    if (fileError || !fileData) {
      console.error('Erro ao buscar arquivo:', fileError)
      throw new Error(fileError?.message || 'Arquivo não encontrado')
    }
    
    // Baixar o arquivo do storage
    const { data: fileContent, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(fileData.storage_path)
    
    if (downloadError || !fileContent) {
      console.error('Erro ao baixar arquivo:', downloadError)
      throw new Error(downloadError?.message || 'Não foi possível baixar o arquivo')
    }
    
    console.log('Arquivo baixado com sucesso, processando...')
    
    // Processar o arquivo baseado no tipo
    const fileType = fileData.file_type
    const arrayBuffer = await fileContent.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length < 2) {
      throw new Error('Arquivo vazio ou sem dados suficientes')
    }

    console.log(`Processando ${jsonData.length} linhas de dados`)

    // Identificar cabeçalhos e tipos de dados
    const headers = jsonData[0] as string[]
    const firstDataRow = jsonData[1] as any[]
    const columnDefinitions: ColumnDefinition[] = []
    
    // Inferir tipos de dados
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      const sampleValue = firstDataRow[i]
      const columnName = header
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
      
      let dataType = 'text' // default
      
      if (typeof sampleValue === 'number') {
        if (Number.isInteger(sampleValue)) {
          dataType = 'integer'
        } else {
          dataType = 'numeric(15,2)'
        }
      } else if (
        typeof sampleValue === 'string' && 
        !isNaN(Date.parse(sampleValue))
      ) {
        dataType = 'timestamp with time zone'
      } else if (
        typeof sampleValue === 'string' && 
        (sampleValue.toLowerCase() === 'true' || 
         sampleValue.toLowerCase() === 'false')
      ) {
        dataType = 'boolean'
      }
      
      columnDefinitions.push({
        name: columnName,
        type: dataType,
        original_name: header,
        sample_value: sampleValue
      })
    }
    
    console.log('Definições de colunas geradas:', columnDefinitions)
    
    // Preparar a definição de tabela para o Supabase
    const columnDefinitionsJson = JSON.stringify(columnDefinitions)
    
    // Chamar a função SQL para criar a tabela
    const { data: tableResult, error: tableError } = await supabase.rpc(
      'create_dynamic_table',
      {
        p_table_name: fileData.table_name,
        p_columns: columnDefinitions,
        p_organization_id: organizationId
      }
    )
    
    if (tableError) {
      console.error('Erro ao criar tabela:', tableError)
      throw new Error(`Erro ao criar tabela: ${tableError.message}`)
    }
    
    console.log('Tabela criada com sucesso:', fileData.table_name)
    
    // Inserir os dados na nova tabela
    const dataInserts = []
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      const rowData: Record<string, any> = { organization_id: organizationId }
      
      for (let j = 0; j < columnDefinitions.length; j++) {
        if (j < row.length) {
          rowData[columnDefinitions[j].name] = row[j]
        }
      }
      
      dataInserts.push(rowData)
    }
    
    console.log(`Preparando para inserir ${dataInserts.length} registros`)
    
    // Inserir em lotes de 1000 registros
    const batchSize = 1000
    for (let i = 0; i < dataInserts.length; i += batchSize) {
      const batch = dataInserts.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from(fileData.table_name)
        .insert(batch)
      
      if (insertError) {
        console.error('Erro ao inserir dados:', insertError)
        throw new Error(`Erro ao inserir dados: ${insertError.message}`)
      }
      
      console.log(`Inseridos ${Math.min(i + batchSize, dataInserts.length)} de ${dataInserts.length} registros`)
    }
    
    // Criar metadados de colunas
    for (const column of columnDefinitions) {
      await supabase
        .from('column_metadata')
        .insert({
          import_id: fileId,
          original_name: column.original_name,
          data_type: column.type,
          sample_values: JSON.stringify([column.sample_value]),
          organization_id: organizationId
        })
    }
    
    console.log('Metadados de colunas criados')
    
    // Atualizar status do import
    await supabase
      .from('data_imports')
      .update({
        status: 'completed',
        row_count: jsonData.length - 1, // Excluir linha de cabeçalho
        metadata: {
          columns: columnDefinitions.map(c => ({
            name: c.name,
            original_name: c.original_name,
            type: c.type
          }))
        }
      })
      .eq('id', fileId)
    
    console.log('Processamento concluído com sucesso')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivo processado com sucesso',
        table_name: fileData.table_name,
        row_count: jsonData.length - 1
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Erro durante processamento:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
