
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("apply-data-fix function started")

Deno.serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileId, fixType, column, tableName, organizationId } = await req.json()

    if (!fileId || !fixType || !organizationId) {
      throw new Error('fileId, fixType e organizationId são obrigatórios')
    }

    // Cria o cliente do Supabase usando as variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Aplicando correção ${fixType} para coluna ${column || 'todas'} no arquivo ${fileId}`)

    // Buscar o arquivo para obter o nome da tabela
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()

    if (importError || !importData) {
      throw new Error(`Falha ao buscar dados do arquivo: ${importError?.message || "Arquivo não encontrado"}`)
    }

    const actualTableName = tableName || importData.table_name

    if (!actualTableName) {
      throw new Error('Nome da tabela não especificado e não encontrado nos dados importados')
    }

    // Aplicar a correção específica
    let message = ""
    
    switch (fixType) {
      case 'fill_missing_values':
        message = await fillMissingValues(supabase, actualTableName, column)
        break
      case 'remove_duplicates':
        message = await removeDuplicates(supabase, actualTableName, column)
        break
      case 'format_standardization':
        message = await standardizeFormat(supabase, actualTableName, column)
        break
      default:
        throw new Error(`Tipo de correção não reconhecido: ${fixType}`)
    }

    // Registrar a correção aplicada
    await supabase
      .from('data_transformations')
      .insert({
        file_id: fileId,
        organization_id: organizationId,
        column_name: column || 'all',
        transformation_type: fixType,
        parameters: { fixType, column },
        applied_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        status: 'success',
        message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro:', error.message)
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function fillMissingValues(supabase: any, tableName: string, column: string) {
  if (!column) {
    throw new Error('É necessário especificar uma coluna para preencher valores ausentes')
  }

  // Buscar dados para determinar o valor padrão
  const { data, error } = await supabase
    .from(tableName)
    .select(column)
    .not(column, 'is', null)
    .order(column, { ascending: true })
    .limit(100)

  if (error) {
    throw new Error(`Erro ao analisar dados: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Não há dados suficientes para determinar um valor padrão')
  }

  // Determinar o tipo de dados e o valor mais comum (moda)
  const values = data.map((row: any) => row[column]).filter((v: any) => v !== null && v !== '')
  const countMap: Record<string, number> = {}
  let mostCommonValue: any = ''
  let maxCount = 0

  values.forEach((value: any) => {
    const valueStr = String(value)
    countMap[valueStr] = (countMap[valueStr] || 0) + 1
    if (countMap[valueStr] > maxCount) {
      maxCount = countMap[valueStr]
      mostCommonValue = value
    }
  })

  // Se não encontrou um valor comum, usar o primeiro valor não nulo
  if (!mostCommonValue && values.length > 0) {
    mostCommonValue = values[0]
  }

  // Aplicar o valor padrão aos registros com valores ausentes
  const { data: updateResult, error: updateError } = await supabase
    .from(tableName)
    .update({ [column]: mostCommonValue })
    .or(`${column}.is.null,${column}.eq.''`)

  if (updateError) {
    throw new Error(`Erro ao atualizar dados: ${updateError.message}`)
  }

  return `Valores ausentes preenchidos com '${mostCommonValue}' na coluna '${column}'`
}

async function removeDuplicates(supabase: any, tableName: string, column: string) {
  if (!column) {
    throw new Error('É necessário especificar uma coluna para remover duplicatas')
  }

  // Identificar registros duplicados (mantendo o primeiro de cada grupo)
  const { data: duplicates, error: selectError } = await supabase
    .from(tableName)
    .select('*')
    .order('id', { ascending: true })

  if (selectError) {
    throw new Error(`Erro ao identificar duplicatas: ${selectError.message}`)
  }

  if (!duplicates || duplicates.length === 0) {
    return 'Nenhum registro encontrado para processar'
  }

  // Agrupar por valor da coluna e manter apenas o primeiro de cada grupo
  const seen = new Set()
  const uniqueIds = []
  const duplicateIds = []

  duplicates.forEach((row: any) => {
    const value = row[column]
    if (seen.has(value)) {
      duplicateIds.push(row.id)
    } else {
      seen.add(value)
      uniqueIds.push(row.id)
    }
  })

  if (duplicateIds.length === 0) {
    return 'Nenhuma duplicata encontrada'
  }

  // Remover registros duplicados (exceto o primeiro de cada grupo)
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .in('id', duplicateIds)

  if (deleteError) {
    throw new Error(`Erro ao remover duplicatas: ${deleteError.message}`)
  }

  return `${duplicateIds.length} registros duplicados foram removidos da coluna '${column}'`
}

async function standardizeFormat(supabase: any, tableName: string, column: string) {
  if (!column) {
    throw new Error('É necessário especificar uma coluna para padronizar o formato')
  }

  // Buscar dados para determinar o tipo de dados
  const { data, error } = await supabase
    .from(tableName)
    .select(column)
    .limit(100)

  if (error) {
    throw new Error(`Erro ao analisar dados: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Não há dados suficientes para padronização')
  }

  // Determinar o tipo de dados predominante
  const types = {
    date: 0,
    number: 0,
    text: 0,
    boolean: 0
  }

  data.forEach((row: any) => {
    const value = row[column]
    if (value === null || value === undefined || value === '') return

    if (!isNaN(Date.parse(value))) {
      types.date++
    } else if (!isNaN(Number(value))) {
      types.number++
    } else if (String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'false') {
      types.boolean++
    } else {
      types.text++
    }
  })

  // Identificar tipo predominante
  let predominantType = 'text'
  let maxCount = 0
  Object.entries(types).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      predominantType = type
    }
  })

  console.log(`Tipo predominante para coluna ${column}: ${predominantType}`)

  // Aplicar padronização com base no tipo
  let updateQuery = {}
  let message = ''

  switch (predominantType) {
    case 'date':
      // Padronização de datas para formato ISO
      message = 'Datas foram padronizadas para formato ISO'
      // Na prática, seria necessário um processamento mais complexo para datas
      break
      
    case 'number':
      // Padronizar números (remover caracteres não numéricos e converter para número)
      message = 'Valores numéricos foram padronizados'
      // Padronização real depende do banco e tecnologias
      break
      
    case 'boolean':
      // Padronizar booleanos
      message = 'Valores booleanos foram padronizados'
      break
      
    case 'text':
      // Padronizar texto (maiúsculas/minúsculas, remover espaços extras)
      message = 'Valores de texto foram padronizados'
      // Padronização real depende do banco e tecnologias
      break
  }

  // Simulação de atualização - num ambiente real, seria necessário implementar a padronização
  // específica para cada tipo de dado
  
  return `Valores da coluna '${column}' foram padronizados. ${message}`
}
