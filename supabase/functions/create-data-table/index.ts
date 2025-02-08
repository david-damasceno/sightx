
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ColumnInfo {
  type: string
  description?: string
}

interface TableCreationParams {
  tableName: string
  columns: Record<string, ColumnInfo>
  organizationId: string
  previewData: Record<string, any>[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request
    const params = await req.json() as TableCreationParams
    const { tableName, columns, organizationId, previewData } = params

    if (!tableName || !columns || !organizationId || !previewData) {
      throw new Error('Missing required parameters')
    }

    console.log('Creating table with params:', {
      tableName,
      columnCount: Object.keys(columns).length,
      organizationId,
      previewDataCount: previewData.length
    })

    const pool = new Pool(Deno.env.get('SUPABASE_DB_URL'), 3)
    const connection = await pool.connect()

    try {
      // Iniciar transação
      await connection.queryObject('BEGIN')

      try {
        // Sanitizar nome da tabela
        const sanitizedTableName = tableName.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        
        // Preparar definições das colunas (sem comentários)
        const columnDefinitions = Object.entries(columns)
          .map(([name, info]: [string, ColumnInfo]) => {
            const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
            return `${sanitizedName} ${info.type}`
          })
          .join(', ')

        // 1. Criar a tabela base
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id),
            ${columnDefinitions},
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
          )
        `

        console.log('Creating table with SQL:', createTableSQL)
        await connection.queryObject(createTableSQL)

        // 2. Adicionar comentários às colunas
        for (const [name, info] of Object.entries(columns)) {
          if (info.description) {
            const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
            const commentSQL = `
              COMMENT ON COLUMN ${sanitizedTableName}.${sanitizedName} IS $1
            `
            console.log('Adding comment:', commentSQL, info.description)
            await connection.queryObject(commentSQL, [info.description])
          }
        }

        // 3. Configurar RLS
        console.log('Setting up RLS...')
        await connection.queryObject(`SELECT setup_table_rls('public', '${sanitizedTableName}')`)

        // 4. Criar índices úteis
        console.log('Creating indices...')
        const createIndexSQL = `
          CREATE INDEX IF NOT EXISTS idx_${sanitizedTableName}_organization_id 
          ON ${sanitizedTableName}(organization_id)
        `
        await connection.queryObject(createIndexSQL)
        
        // 5. Criar trigger para updated_at
        const createTriggerSQL = `
          CREATE TRIGGER update_${sanitizedTableName}_updated_at
            BEFORE UPDATE ON ${sanitizedTableName}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        `
        console.log('Creating trigger...')
        await connection.queryObject(createTriggerSQL)

        // 6. Inserir dados de preview
        if (previewData.length > 0) {
          // Preparar nomes das colunas sanitizados
          const columnNames = Object.keys(columns).map(name => 
            name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
          )

          // Criar placeholders para a query de inserção
          const placeholders = previewData.map((_, rowIndex) =>
            `($1, ${columnNames.map((_, colIndex) => 
              `$${2 + rowIndex * columnNames.length + colIndex}`
            ).join(', ')})`
          ).join(', ')

          // Preparar valores com validação de tipo
          const values = [organizationId]
          
          for (const row of previewData) {
            for (const col of columnNames) {
              const value = row[col]
              const columnType = columns[col].type
              
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
            }
          }

          const insertSQL = `
            INSERT INTO ${sanitizedTableName} (organization_id, ${columnNames.join(', ')})
            VALUES ${placeholders}
          `

          console.log('Inserting preview data...')
          await connection.queryObject(insertSQL, values)
        }

        // 7. Atualizar status da importação
        console.log('Updating import status...')
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

        // Commit da transação
        await connection.queryObject('COMMIT')

        return new Response(
          JSON.stringify({ 
            message: 'Table created and data imported successfully',
            tableName: sanitizedTableName
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        // Rollback em caso de erro
        console.error('Error during table creation:', error)
        await connection.queryObject('ROLLBACK')
        throw error
      }
    } finally {
      connection.release()
      await pool.end()
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
