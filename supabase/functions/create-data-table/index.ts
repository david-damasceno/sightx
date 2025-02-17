
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

    // Criar string SQL para criar a tabela
    const columnDefinitions = Object.entries(columns).map(([name, details]) => {
      const { type, description } = details as Column
      return `"${name}" ${type}`
    }).join(',\n  ')

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "${tableName}" (
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
          `COMMENT ON COLUMN "${tableName}"."${name}" IS '${(details as Column).description}';`
        ).join('\n')}

      -- Configurar RLS
      SELECT setup_table_rls('public', '${tableName}');
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
        INSERT INTO "${tableName}" (
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
        message: 'Tabela criada com sucesso'
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
