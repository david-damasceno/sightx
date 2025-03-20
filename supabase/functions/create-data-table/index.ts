
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface Column {
  name: string
  type: string
  description?: string
}

serve(async (req) => {
  // Lidar com requisição OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tableName, columns, organizationId, previewData } = await req.json()

    console.log('Iniciando criação da tabela:', {
      tableName,
      columnsCount: Object.keys(columns).length,
      organization: organizationId,
      previewRowsCount: previewData?.length
    })

    // Obter o esquema da organização
    const { data: orgData, error: orgError } = await supabaseClient
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .single()

    if (orgError) throw orgError

    const schemaName = orgData.settings?.schema_name || 'public'
    console.log(`Usando esquema: ${schemaName} para organização: ${organizationId}`)

    // Criar string SQL para criar a tabela
    const columnDefinitions = Object.entries(columns).map(([name, details]) => {
      const { type, description } = details as Column
      return `"${name}" ${type}`
    }).join(',\n  ')

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "${schemaName}"."${tableName}" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL,
        ${columnDefinitions},
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );

      -- Adicionar comentários às colunas
      ${Object.entries(columns)
        .filter(([_, details]) => (details as Column).description)
        .map(([name, details]) => 
          `COMMENT ON COLUMN "${schemaName}"."${tableName}"."${name}" IS '${(details as Column).description}';`
        ).join('\n')}

      -- Configurar RLS
      ALTER TABLE "${schemaName}"."${tableName}" ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "${tableName}_select_policy" 
      ON "${schemaName}"."${tableName}"
      FOR SELECT 
      USING (organization_id = '${organizationId}' OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      ));
      
      CREATE POLICY "${tableName}_insert_policy" 
      ON "${schemaName}"."${tableName}"
      FOR INSERT 
      WITH CHECK (organization_id = '${organizationId}' OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      ));
      
      CREATE POLICY "${tableName}_update_policy" 
      ON "${schemaName}"."${tableName}"
      FOR UPDATE 
      USING (organization_id = '${organizationId}' OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      ));
      
      CREATE POLICY "${tableName}_delete_policy" 
      ON "${schemaName}"."${tableName}"
      FOR DELETE 
      USING (organization_id = '${organizationId}' OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      ));
    `

    console.log('SQL gerado:', createTableSQL)

    // Criar a tabela
    const { error: createTableError } = await supabaseClient.rpc(
      'exec_sql',
      { sql: createTableSQL }
    )

    if (createTableError) throw createTableError

    // Inserir dados de preview
    if (previewData && previewData.length > 0) {
      const columns = Object.keys(previewData[0])
      const values = previewData.map(row => {
        return `(
          '${crypto.randomUUID()}',
          '${organizationId}',
          ${columns.map(col => `'${row[col]}'`).join(', ')}
        )`
      }).join(',\n')

      const insertSQL = `
        INSERT INTO "${schemaName}"."${tableName}" (
          id,
          organization_id,
          ${columns.map(c => `"${c}"`).join(', ')}
        )
        VALUES ${values};
      `

      const { error: insertError } = await supabaseClient.rpc(
        'exec_sql',
        { sql: insertSQL }
      )

      if (insertError) throw insertError
    }

    // Atualizar status da importação
    const { error: updateError } = await supabaseClient
      .from('data_processing_results')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      })
      .eq('table_name', tableName)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Tabela criada com sucesso',
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
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
