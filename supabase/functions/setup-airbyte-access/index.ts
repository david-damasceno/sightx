
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Lidar com requisições pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { organizationId, schemaName, airbyte_username, airbyte_password } = await req.json()
    
    if (!organizationId || !schemaName || !airbyte_username || !airbyte_password) {
      throw new Error('Parâmetros obrigatórios não fornecidos')
    }
    
    console.log(`Configurando acesso para Airbyte ao esquema: ${schemaName}`)
    
    // Primeiro verificar se o esquema existe
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .single()
    
    if (orgError) {
      throw new Error(`Erro ao buscar organização: ${orgError.message}`)
    }
    
    // Verificar se o schema_name corresponde ao fornecido 
    const orgSchema = orgData.settings?.schema_name
    
    if (!orgSchema || orgSchema !== schemaName) {
      throw new Error(`Esquema ${schemaName} não corresponde ao esquema da organização: ${orgSchema}`)
    }
    
    // Executar SQL para criar o usuário e conceder permissões
    const createUserSQL = `
      -- Verificar se o usuário já existe e removê-lo se existir
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${airbyte_username}') THEN
          EXECUTE 'DROP USER ${airbyte_username}';
        END IF;
      END
      $$;
      
      -- Criar o usuário com a senha
      CREATE USER ${airbyte_username} WITH PASSWORD '${airbyte_password}';
      
      -- Conceder permissões no esquema
      GRANT USAGE ON SCHEMA ${schemaName} TO ${airbyte_username};
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${schemaName} TO ${airbyte_username};
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ${schemaName} TO ${airbyte_username};
      ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaName} GRANT ALL PRIVILEGES ON TABLES TO ${airbyte_username};
      ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaName} GRANT ALL PRIVILEGES ON SEQUENCES TO ${airbyte_username};
      
      -- Conceder acesso ao schema public (necessário para alguns metadados)
      GRANT USAGE ON SCHEMA public TO ${airbyte_username};
      
      -- Garantir que o usuário possa criar tabelas temporárias
      GRANT TEMPORARY ON DATABASE postgres TO ${airbyte_username};
    `
    
    // Executar o SQL para criar usuário e permissões
    const { error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: createUserSQL 
    })
    
    if (sqlError) {
      throw new Error(`Erro ao executar SQL: ${sqlError.message}`)
    }
    
    // Retornar os dados de conexão para o Airbyte
    const connectionInfo = {
      success: true,
      message: `Acesso configurado com sucesso para o Airbyte no esquema ${schemaName}`,
      connection_details: {
        host: Deno.env.get('SUPABASE_DB_HOST') || supabaseUrl.replace('https://', '').replace('.supabase.co', '.supabase.co'),
        port: 5432,
        database: 'postgres',
        username: airbyte_username,
        password: airbyte_password,
        schema: schemaName,
        ssl_mode: 'require'
      }
    }
    
    return new Response(
      JSON.stringify(connectionInfo),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
    
  } catch (error) {
    console.error('Erro na configuração do Airbyte:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
