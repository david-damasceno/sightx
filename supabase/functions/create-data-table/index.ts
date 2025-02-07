
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tableName, columns, organizationId, previewData } = await req.json()

    if (!tableName || !columns || !organizationId || !previewData) {
      throw new Error('Missing required parameters')
    }

    const pool = new Pool(Deno.env.get('SUPABASE_DB_URL'), 3)
    const connection = await pool.connect()

    try {
      // Validar nome da tabela
      const sanitizedTableName = tableName.toLowerCase().replace(/[^a-z0-9_]/g, '_')
      
      // Preparar definições das colunas com tipos adequados
      const columnDefinitions = Object.entries(columns)
        .map(([name, info]: [string, any]) => {
          const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
          let columnDef = `${sanitizedName} ${info.type}`
          
          // Adicionar comentário se houver descrição
          if (info.description) {
            columnDef += ` -- ${info.description}`
          }
          
          return columnDef
        })
        .join(', ')

      // Criar a tabela com as políticas de RLS
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id),
          ${columnDefinitions},
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
        );

        -- Configurar RLS
        SELECT setup_table_rls('public', '${sanitizedTableName}');

        -- Criar índices úteis
        CREATE INDEX IF NOT EXISTS idx_${sanitizedTableName}_organization_id 
          ON ${sanitizedTableName}(organization_id);
        
        -- Criar trigger para updated_at
        CREATE TRIGGER update_${sanitizedTableName}_updated_at
          BEFORE UPDATE ON ${sanitizedTableName}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `

      await connection.queryObject(createTableSQL)

      // Preparar e validar dados para inserção
      const columnNames = Object.keys(columns).map(name => 
        name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
      )

      const placeholders = previewData.map((_, rowIndex) =>
        `($1, ${columnNames.map((_, colIndex) => 
          `$${2 + rowIndex * columnNames.length + colIndex}`
        ).join(', ')})`
      ).join(', ')

      const values = [organizationId]
      
      // Validar e converter valores conforme o tipo da coluna
      previewData.forEach(row => {
        columnNames.forEach(col => {
          const value = row[col]
          const columnType = columns[col].type
          
          // Converter valor conforme o tipo
          let processedValue
          if (value === null || value === undefined) {
            processedValue = null
          } else if (columnType.includes('timestamp')) {
            processedValue = new Date(value).toISOString()
          } else if (columnType === 'boolean') {
            processedValue = ['true', 't', 'yes', 'sim', '1'].includes(String(value).toLowerCase())
          } else if (columnType.includes('int')) {
            processedValue = parseInt(value)
          } else if (columnType.includes('numeric') || columnType.includes('decimal')) {
            processedValue = parseFloat(value)
          } else {
            processedValue = String(value)
          }
          
          values.push(processedValue)
        })
      })

      const insertSQL = `
        INSERT INTO ${sanitizedTableName} (organization_id, ${columnNames.join(', ')})
        VALUES ${placeholders}
      `

      await connection.queryObject(insertSQL, values)

      // Atualizar status da importação
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: updateError } = await supabase
        .from('data_imports')
        .update({ 
          status: 'completed',
          table_name: sanitizedTableName
        })
        .eq('organization_id', organizationId)
        .eq('status', 'analyzing')

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ 
          message: 'Table created and data imported successfully',
          tableName: sanitizedTableName
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } finally {
      connection.release()
      await pool.end()
    }
  } catch (error) {
    console.error('Error creating table:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
