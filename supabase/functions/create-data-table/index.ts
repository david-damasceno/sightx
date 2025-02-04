
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
      // Create dynamic table
      const columnDefinitions = Object.entries(columns)
        .map(([name, info]: [string, any]) => {
          const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
          return `${sanitizedName} ${info.type}`
        })
        .join(', ')

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id),
          ${columnDefinitions},
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
        );

        -- Add security policies
        ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their organization data" ON ${tableName}
          FOR SELECT USING (organization_id = auth.uid());

        CREATE POLICY "Users can insert their organization data" ON ${tableName}
          FOR INSERT WITH CHECK (organization_id = auth.uid());
      `

      await connection.queryObject(createTableSQL)

      // Insert preview data
      const columnNames = Object.keys(columns).map(name => 
        name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
      )

      const placeholders = previewData.map((_, rowIndex) =>
        `($1, ${columnNames.map((_, colIndex) => 
          `$${2 + rowIndex * columnNames.length + colIndex}`
        ).join(', ')})`
      ).join(', ')

      const values = [organizationId]
      previewData.forEach(row => {
        columnNames.forEach(col => values.push(row[col] ?? null))
      })

      const insertSQL = `
        INSERT INTO ${tableName} (organization_id, ${columnNames.join(', ')})
        VALUES ${placeholders}
      `

      await connection.queryObject(insertSQL, values)

      // Update import status
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: updateError } = await supabase
        .from('data_imports')
        .update({ 
          status: 'completed',
          table_name: tableName
        })
        .eq('organization_id', organizationId)
        .eq('status', 'analyzing')

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ message: 'Table created and data imported successfully' }),
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
