
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0"
import * as csv from "https://deno.land/std@0.177.0/encoding/csv.ts"

interface ProcessFileUploadRequest {
  fileId: string;
  organizationId: string;
}

interface ImportFile {
  id: string;
  name: string;
  original_filename: string;
  storage_path: string;
  file_type: string;
  table_name: string;
}

interface ColumnDefinition {
  name: string;
  type: string;
}

// Função para processar arquivos CSV
async function processCSV(csvContent: string): Promise<{ headers: string[], data: any[] }> {
  try {
    console.log('Processando arquivo CSV')
    const parsedData = await csv.parse(csvContent, {
      skipFirstRow: false,
    })
    
    if (parsedData.length === 0) {
      throw new Error('Arquivo CSV vazio')
    }
    
    const headers = parsedData[0] as string[]
    const rows = parsedData.slice(1)
    
    console.log(`CSV processado: ${headers.length} colunas, ${rows.length} linhas`)
    
    return {
      headers,
      data: rows.map(row => {
        const obj: any = {}
        headers.forEach((header, index) => {
          // Garantir que os nomes das colunas sejam válidos para SQL
          const cleanHeader = header
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
          obj[cleanHeader] = row[index]
        })
        return obj
      }),
    }
  } catch (error) {
    console.error('Erro ao processar CSV:', error)
    throw new Error(`Falha ao processar arquivo CSV: ${error.message}`)
  }
}

serve(async (req) => {
  try {
    // Inicializar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Edge Function process-file-upload iniciada')
    
    const { fileId, organizationId } = await req.json() as ProcessFileUploadRequest
    
    console.log(`Processando arquivo: ${fileId} para organização: ${organizationId}`)
    
    // Buscar informações do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('id, name, original_filename, storage_path, file_type, table_name')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()
    
    if (fileError || !fileData) {
      console.error('Erro ao buscar arquivo:', fileError)
      throw new Error(fileError?.message || 'Arquivo não encontrado')
    }
    
    console.log('Dados do arquivo recuperados:', JSON.stringify({
      id: fileData.id,
      name: fileData.name,
      storage_path: fileData.storage_path,
      table_name: fileData.table_name
    }))
    
    // Baixar o arquivo do storage
    const { data: fileContent, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(fileData.storage_path)
    
    if (downloadError || !fileContent) {
      console.error('Erro ao baixar arquivo:', downloadError)
      
      // Atualizar status do import para erro
      await supabase
        .from('data_imports')
        .update({
          status: 'error',
          error_message: downloadError?.message || 'Erro ao baixar arquivo do storage'
        })
        .eq('id', fileId)
      
      throw new Error(downloadError?.message || 'Não foi possível baixar o arquivo')
    }
    
    console.log('Arquivo baixado com sucesso, tamanho:', fileContent.size, 'bytes')
    
    // Converter o arquivo para texto
    const fileText = await fileContent.text()
    
    // Processar o arquivo com base no tipo
    let parsedData: { headers: string[], data: any[] }
    
    if (fileData.file_type === 'text/csv' || fileData.original_filename.endsWith('.csv')) {
      parsedData = await processCSV(fileText)
    } else if (
      fileData.file_type === 'application/vnd.ms-excel' ||
      fileData.file_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileData.original_filename.endsWith('.xls') ||
      fileData.original_filename.endsWith('.xlsx')
    ) {
      // Para arquivos Excel, precisaríamos de uma biblioteca específica
      // que não está prontamente disponível no Deno
      throw new Error('Processamento de arquivos Excel ainda não implementado')
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${fileData.file_type}`)
    }
    
    console.log(`Dados processados: ${parsedData.headers.length} colunas, ${parsedData.data.length} linhas`)
    
    // Criar registro de processamento
    const { data: processingData, error: processingError } = await supabase
      .from('data_processing_results')
      .insert({
        file_id: fileId,
        organization_id: organizationId,
        status: 'processing',
        processing_started_at: new Date().toISOString(),
        total_rows: parsedData.data.length,
        progress: 0,
        table_name: fileData.table_name
      })
      .select()
      .single()
    
    if (processingError) {
      console.error('Erro ao criar registro de processamento:', processingError)
      throw new Error(`Erro ao iniciar processamento: ${processingError.message}`)
    }
    
    console.log('Registro de processamento criado:', processingData.id)
    
    // Inferir tipos das colunas
    const columnDefinitions: ColumnDefinition[] = []
    const sampleRow = parsedData.data[0] || {}
    
    for (const [header, value] of Object.entries(sampleRow)) {
      let type = 'text'
      
      // Inferência básica de tipo
      if (typeof value === 'number') {
        type = 'numeric'
      } else if (
        !isNaN(Date.parse(String(value))) && 
        /^\d{4}-\d{2}-\d{2}/.test(String(value))
      ) {
        type = 'timestamp with time zone'
      } else if (
        String(value).toLowerCase() === 'true' || 
        String(value).toLowerCase() === 'false'
      ) {
        type = 'boolean'
      } else if (!isNaN(Number(value))) {
        if (String(value).includes('.')) {
          type = 'numeric'
        } else {
          type = 'integer'
        }
      }
      
      columnDefinitions.push({
        name: header,
        type
      })
    }
    
    console.log('Definições de colunas geradas:', JSON.stringify(columnDefinitions))
    
    // Preparar a definição de tabela para o Supabase
    const columnDefinitionsJson = JSON.stringify(columnDefinitions)
    
    // Chamar a função para criar a tabela dinâmica
    const { data: tableResult, error: tableError } = await supabase.rpc(
      'create_dynamic_table',
      {
        p_table_name: fileData.table_name,
        p_columns: columnDefinitionsJson,
        p_organization_id: organizationId
      }
    )
    
    if (tableError) {
      console.error('Erro ao criar tabela:', tableError)
      
      // Atualizar status de processamento para erro
      await supabase
        .from('data_processing_results')
        .update({
          status: 'error',
          error_message: tableError.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', processingData.id)
      
      throw new Error(`Erro ao criar tabela: ${tableError.message}`)
    }
    
    console.log('Tabela criada com sucesso:', tableResult)
    
    // Atualizar status do processamento para completo
    // (Na prática, seria necessário um processo assíncrono para inserir os dados em lotes)
    const { error: updateError } = await supabase
      .from('data_processing_results')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_rows: parsedData.data.length,
        progress: 100,
        processing_metadata: {
          columns: columnDefinitions.map(c => c.name),
          rows_processed: parsedData.data.length
        }
      })
      .eq('id', processingData.id)
    
    if (updateError) {
      console.error('Erro ao atualizar status de processamento:', updateError)
    }
    
    // Atualizar status do import para completed
    await supabase
      .from('data_imports')
      .update({
        status: 'completed',
        row_count: parsedData.data.length
      })
      .eq('id', fileId)
    
    // Retornar resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivo processado com sucesso',
        table: fileData.table_name,
        rows: parsedData.data.length,
        columns: columnDefinitions.length
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Erro na função edge:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro no processamento: ${error.message}`
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
