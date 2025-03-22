
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com solicitações CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase usando as variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gerar nome de usuário e senha aleatórios e seguros
    const username = `airbyte_user_${Math.random().toString(36).substring(2, 10)}`;
    const password = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15) +
                     Math.random().toString(36).substring(2, 15) +
                     Math.random().toString(36).substring(2, 15);

    console.log(`Criando usuário para Airbyte: ${username}`);

    // Executar SQL para criar o usuário com permissões no banco de dados
    const { data, error } = await supabase.rpc('create_airbyte_user', {
      p_username: username,
      p_password: password
    });

    if (error) {
      console.error("Erro ao criar usuário Airbyte:", error);
      throw error;
    }

    console.log("Usuário para Airbyte criado com sucesso:", data);

    return new Response(
      JSON.stringify({
        username,
        password,
        host: 'db.zzmezxjwhtiwhnhqvnck.supabase.co',
        port: 5432,
        database: 'postgres',
        schema: 'org_rl_representacoes',
        sslMode: 'require'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
