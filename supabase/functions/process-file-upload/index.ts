
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { fileId, organizationId } = await req.json()

    if (!fileId || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processando arquivo ${fileId} para organização ${organizationId}`)

    // Buscar os dados do arquivo
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()

    if (importError || !importData) {
      console.error('Erro ao buscar dados do arquivo:', importError)
      return new Response(
        JSON.stringify({ error: 'Arquivo não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Buscar os dados do arquivo no Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('data_files')
      .download(importData.storage_path)

    if (fileError) {
      console.error('Erro ao baixar arquivo:', fileError)
      return new Response(
        JSON.stringify({ error: 'Não foi possível baixar o arquivo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Processar o arquivo conforme seu tipo
    const text = await fileData.text()
    let data = []
    let headers = []
    let columnTypes = []

    if (importData.file_type.includes('csv')) {
      const rows = text.split('\n')
      
      if (rows.length > 0) {
        // Processar cabeçalhos (primeira linha)
        headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        // Processar dados (demais linhas)
        data = rows.slice(1)
          .filter(row => row.trim() !== '')
          .map(row => {
            const values = row.split(',').map(v => v.trim())
            const rowData = {}
            headers.forEach((header, index) => {
              rowData[header] = values[index] || null
            })
            return rowData
          })
      }
    } else if (importData.file_type.includes('excel') || importData.file_type.includes('spreadsheet')) {
      // Para arquivos Excel, seria necessário uma biblioteca como xlsx
      // Este é um placeholder simplificado
      console.log('Processamento de Excel não implementado completamente')
      throw new Error('Formato não suportado completamente na função')
    }

    // Inferir tipos de coluna com base em amostra de dados
    columnTypes = headers.map(header => {
      const sampleValues = data.slice(0, 10).map(row => row[header])
      let type = inferDataType(sampleValues)
      
      return {
        name: header,
        type: type,
        sample: sampleValues
      }
    })

    // Criar definição de colunas para a tabela
    const columnsForTable = columnTypes.map(col => ({
      name: sanitizeColumnName(col.name),
      type: mapTypeToSql(col.type)
    }))

    // Criar tabela dinâmica no banco de dados
    const tableName = importData.table_name
    
    const { data: result, error: tableError } = await supabase.rpc(
      'create_dynamic_table',
      {
        p_table_name: tableName,
        p_columns: JSON.stringify(columnsForTable),
        p_organization_id: organizationId
      }
    )

    if (tableError) {
      console.error('Erro ao criar tabela:', tableError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar tabela', details: tableError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Inserir dados na tabela
    for (const item of data) {
      const row = {}
      
      // Mapear valores para colunas com nomes sanitizados
      headers.forEach(header => {
        const sanitizedName = sanitizeColumnName(header)
        row[sanitizedName] = item[header]
      })
      
      // Adicionar organization_id
      row['organization_id'] = organizationId
      
      // Inserir na tabela
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(row)
      
      if (insertError) {
        console.error('Erro ao inserir dados:', insertError)
      }
    }

    // Salvar metadados de coluna
    for (const col of columnTypes) {
      await supabase
        .from('column_metadata')
        .insert({
          import_id: fileId,
          original_name: col.name,
          display_name: col.name,
          data_type: col.type,
          sample_values: col.sample
        })
    }

    // Atualizar status do import
    await supabase
      .from('data_imports')
      .update({
        status: 'completed',
        row_count: data.length,
        columns_metadata: columnTypes
      })
      .eq('id', fileId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        tableName,
        rowCount: data.length,
        columns: columnTypes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Erro no processamento do arquivo:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Funções utilitárias
function inferDataType(values) {
  // Ignorar valores nulos para inferência
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
  
  if (nonNullValues.length === 0) return 'text'
  
  // Verificar se todos são numéricos
  const allNumeric = nonNullValues.every(v => !isNaN(Number(v)))
  if (allNumeric) {
    // Verificar se são inteiros ou decimais
    const hasDecimal = nonNullValues.some(v => v.toString().includes('.'))
    return hasDecimal ? 'numeric' : 'integer'
  }
  
  // Verificar se são datas
  const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/
  const allDates = nonNullValues.every(v => datePattern.test(v))
  if (allDates) return 'date'
  
  // Verificar se são booleanos
  const boolValues = ['true', 'false', 'yes', 'no', '1', '0']
  const allBools = nonNullValues.every(v => boolValues.includes(v.toString().toLowerCase()))
  if (allBools) return 'boolean'
  
  // Default para texto
  return 'text'
}

function sanitizeColumnName(name) {
  // Remover caracteres especiais e espaços
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^[0-9]/, 'col_$&') // Evitar colunas começando com números
}

function mapTypeToSql(type) {
  switch (type) {
    case 'integer': return 'INTEGER';
    case 'numeric': return 'NUMERIC';
    case 'date': return 'DATE';
    case 'boolean': return 'BOOLEAN';
    default: return 'TEXT';
  }
}
