
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { fileId, fixType, column, organizationId } = await req.json()
    
    if (!fileId || !fixType || !organizationId) {
      throw new Error('fileId, fixType e organizationId são obrigatórios')
    }
    
    console.log(`Aplicando correção de dados: ${fixType} na coluna ${column || 'all'} do arquivo ${fileId}`)
    
    // Buscar informações da tabela
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('table_name')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()
    
    if (fileError) {
      throw new Error(`Erro ao buscar dados do arquivo: ${fileError.message}`)
    }
    
    if (!fileData.table_name) {
      throw new Error('Tabela não encontrada para este arquivo')
    }
    
    const tableName = fileData.table_name
    let result
    
    // Aplicar diferentes tipos de correções
    switch (fixType) {
      case 'fill_nulls':
        result = await fillNullValues(tableName, column)
        break
        
      case 'handle_duplicates':
        result = await handleDuplicates(tableName, column)
        break
        
      case 'standardize_format':
        result = await standardizeFormat(tableName, column)
        break
        
      default:
        throw new Error(`Tipo de correção desconhecido: ${fixType}`)
    }
    
    // Registrar a alteração feita
    const { error: logError } = await supabase
      .from('data_transformations')
      .insert({
        file_id: fileId,
        organization_id: organizationId,
        transformation_type: fixType,
        column_name: column || 'all',
        parameters: { },
        applied_at: new Date().toISOString()
      })
    
    if (logError) {
      console.error(`Erro ao registrar transformação: ${logError.message}`)
    }
    
    // Retornar resultado da operação
    return new Response(
      JSON.stringify({ success: true, ...result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } 
  catch (error) {
    console.error(`Erro ao aplicar correção: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Função para preencher valores nulos
async function fillNullValues(tableName: string, columnName: string) {
  // Verificar o tipo de dados da coluna
  const { data: columnTypeData } = await supabase.rpc(
    'get_column_type',
    { 
      table_name: tableName, 
      column_name: columnName 
    }
  )
  
  const columnType = columnTypeData || 'text'
  let defaultValue
  
  // Determinar valor padrão baseado no tipo
  if (columnType.includes('int') || columnType.includes('numeric')) {
    defaultValue = 0
  } else if (columnType.includes('timestamp') || columnType.includes('date')) {
    defaultValue = "now()"
  } else if (columnType.includes('bool')) {
    defaultValue = false
  } else {
    // Para texto, usar valor mais frequente
    const { data: mostCommonValue } = await supabase.rpc(
      'get_most_common_value',
      { 
        table_name: tableName, 
        column_name: columnName 
      }
    )
    
    defaultValue = mostCommonValue || '(não informado)'
  }
  
  // Atualizar os valores nulos
  const { data, error } = await supabase.rpc(
    'update_null_values',
    { 
      table_name: tableName, 
      column_name: columnName,
      replacement_value: defaultValue 
    }
  )
  
  if (error) {
    throw new Error(`Erro ao preencher nulos: ${error.message}`)
  }
  
  return { 
    rowsUpdated: data, 
    message: `Valores nulos em ${columnName} foram preenchidos com '${defaultValue}'` 
  }
}

// Função para tratar duplicatas
async function handleDuplicates(tableName: string, columnName: string) {
  // Identificar duplicatas
  const { data: duplicates, error: findError } = await supabase.rpc(
    'find_duplicate_rows',
    { 
      table_name: tableName, 
      column_name: columnName
    }
  )
  
  if (findError) {
    throw new Error(`Erro ao identificar duplicatas: ${findError.message}`)
  }
  
  // Remover duplicatas
  const { data, error } = await supabase.rpc(
    'remove_duplicate_rows',
    { 
      table_name: tableName, 
      column_name: columnName
    }
  )
  
  if (error) {
    throw new Error(`Erro ao remover duplicatas: ${error.message}`)
  }
  
  return { 
    rowsRemoved: data, 
    message: `Linhas duplicadas baseadas em ${columnName} foram removidas` 
  }
}

// Função para padronizar formatos
async function standardizeFormat(tableName: string, columnName: string) {
  // Verificar o tipo de dados da coluna
  const { data: columnTypeData } = await supabase.rpc(
    'get_column_type',
    { 
      table_name: tableName, 
      column_name: columnName 
    }
  )
  
  const columnType = columnTypeData || 'text'
  
  // Aplicar diferentes normalizações baseadas no tipo
  let transformationType
  let rowsUpdated = 0
  
  if (columnType.includes('text') || columnType.includes('varchar')) {
    // Padronizar texto: converter para lowercase e remover espaços extras
    const { data, error } = await supabase.rpc(
      'standardize_text',
      { 
        table_name: tableName, 
        column_name: columnName
      }
    )
    
    if (error) {
      throw new Error(`Erro ao padronizar texto: ${error.message}`)
    }
    
    rowsUpdated = data || 0
    transformationType = 'padronização de texto'
  }
  else if (columnType.includes('date') || columnType.includes('timestamp')) {
    // Padronizar datas para formato ISO
    const { data, error } = await supabase.rpc(
      'standardize_dates',
      { 
        table_name: tableName, 
        column_name: columnName
      }
    )
    
    if (error) {
      throw new Error(`Erro ao padronizar datas: ${error.message}`)
    }
    
    rowsUpdated = data || 0
    transformationType = 'padronização de datas'
  }
  else {
    throw new Error(`Padronização não suportada para o tipo ${columnType}`)
  }
  
  return { 
    rowsUpdated, 
    message: `Aplicada ${transformationType} na coluna ${columnName}` 
  }
}
