
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'
import { corsHeaders } from '../_shared/cors.ts'

interface ProcessFileUploadRequest {
  fileId: string
  organizationId: string
}

interface ColumnDefinition {
  name: string
  type: string
}

interface DataImport {
  id: string
  organization_id: string
  name: string
  original_filename: string
  storage_path: string
  file_type: string
  status: string
  table_name: string
}

Deno.serve(async (req: Request) => {
  // Gerenciar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Edge Function process-file-upload iniciada')
    
    const { fileId, organizationId } = await req.json() as ProcessFileUploadRequest
    
    console.log(`Processando arquivo: ${fileId} para organização: ${organizationId}`)
    
    // Buscar informações do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single() as { data: DataImport, error: any }
    
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
      throw new Error(downloadError?.message || 'Não foi possível baixar o arquivo')
    }
    
    console.log('Arquivo baixado com sucesso, tamanho:', fileContent.size, 'bytes')
    
    // Processar o arquivo de acordo com o tipo
    let jsonData: any[] = []
    const fileType = fileData.file_type || fileData.original_filename.split('.').pop()?.toLowerCase()
    
    if (fileType?.includes('csv') || fileData.original_filename.endsWith('.csv')) {
      const text = await fileContent.text()
      
      // Processar CSV para JSON
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      jsonData = lines.slice(1)
        .filter(line => line.trim().length > 0) // Remover linhas vazias
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const row: Record<string, any> = {}
          
          headers.forEach((header, idx) => {
            row[header] = values[idx] || ''
          })
          
          return row
        })
    } 
    else if (fileType?.includes('excel') || 
             fileData.original_filename.endsWith('.xlsx') || 
             fileData.original_filename.endsWith('.xls')) {
      // Aqui precisaríamos de uma biblioteca para processar Excel
      // Mas o Deno runtime não suporta isso facilmente
      // Retorne um erro amigável
      throw new Error('Processamento de arquivos Excel não está disponível neste momento. Por favor, converta para CSV e tente novamente.')
    }
    else {
      throw new Error(`Tipo de arquivo não suportado: ${fileType}`)
    }
    
    if (jsonData.length === 0) {
      throw new Error('Não foi possível extrair dados do arquivo ou o arquivo está vazio')
    }
    
    console.log(`Dados extraídos: ${jsonData.length} linhas`)
    
    // Identificar tipos de coluna com base na primeira linha de dados
    const columnDefinitions: ColumnDefinition[] = []
    
    if (jsonData.length > 0) {
      const sampleRow = jsonData[0]
      
      Object.keys(sampleRow).forEach(key => {
        let type = 'text'
        const value = sampleRow[key]
        
        // Inferir tipo básico
        if (!isNaN(Number(value)) && value !== '') {
          // Se tem ponto decimal, é numeric
          if (value.includes('.')) {
            type = 'numeric'
          } else {
            type = 'integer'
          }
        } 
        // Tentar detectar datas (simplificado)
        else if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(value) || 
                /^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/.test(value)) {
          type = 'date'
        }
        // Para booleanos
        else if (['true', 'false', 'yes', 'no', 'sim', 'não'].includes(value.toLowerCase())) {
          type = 'boolean'
        }
        
        columnDefinitions.push({
          name: key.toLowerCase().replace(/\s+/g, '_'),
          type: type
        })
      })
    }
    
    console.log('Definições de colunas geradas:', JSON.stringify(columnDefinitions))
    
    // Preparar a definição de tabela para o Supabase
    const columnDefinitionsJson = JSON.stringify(columnDefinitions)
    
    // Chamar a função SQL para criar a tabela
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
      throw new Error(`Erro ao criar tabela: ${tableError.message}`)
    }
    
    console.log('Tabela criada com sucesso:', tableResult)
    
    // Inserir os dados na tabela
    console.log(`Iniciando inserção de ${jsonData.length} registros na tabela ${fileData.table_name}`)
    
    // Processamos em lotes para evitar sobrecarga
    const batchSize = 100
    let insertedCount = 0
    let errorCount = 0
    
    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize)
      
      // Preparar os registros para inserção
      const records = batch.map(row => {
        const record: Record<string, any> = { organization_id: organizationId }
        
        // Mapear as colunas da definição
        columnDefinitions.forEach(col => {
          const originalKey = Object.keys(row).find(
            k => k.toLowerCase().replace(/\s+/g, '_') === col.name
          )
          
          if (originalKey) {
            let value = row[originalKey]
            
            // Conversão de tipos
            if (col.type === 'integer' && !isNaN(Number(value))) {
              value = parseInt(value)
            } else if (col.type === 'numeric' && !isNaN(Number(value))) {
              value = parseFloat(value)
            } else if (col.type === 'boolean') {
              value = ['true', 'yes', 'sim', '1'].includes(value.toLowerCase())
            }
            
            record[col.name] = value
          }
        })
        
        return record
      })
      
      // Inserir o lote
      const { data: insertData, error: insertError } = await supabase
        .from(fileData.table_name)
        .insert(records)
      
      if (insertError) {
        console.error(`Erro ao inserir lote ${i / batchSize + 1}:`, insertError)
        errorCount++
      } else {
        insertedCount += records.length
        console.log(`Lote ${i / batchSize + 1} inserido com sucesso, total: ${insertedCount}`)
      }
    }
    
    // Atualizar status
    await supabase
      .from('data_imports')
      .update({
        status: errorCount > 0 ? 'error' : 'completed',
        error_message: errorCount > 0 ? `${errorCount} lotes com erro na importação` : null,
        row_count: insertedCount
      })
      .eq('id', fileId)
    
    console.log(`Importação concluída: ${insertedCount} registros inseridos, ${errorCount} lotes com erro`)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Arquivo processado com sucesso: ${insertedCount} registros inseridos`,
        records: insertedCount,
        errors: errorCount,
        table: fileData.table_name
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  }
  catch (error) {
    console.error('Erro no processamento:', error.message)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro no processamento: ${error.message}`
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
