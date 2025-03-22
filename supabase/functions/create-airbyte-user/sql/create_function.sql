
-- Função para criar um usuário Airbyte com permissões limitadas
CREATE OR REPLACE FUNCTION public.create_airbyte_user(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_schema_name text;
  v_result json;
BEGIN
  -- Determinar o esquema da organização atual
  -- Este exemplo usa um esquema fixo, mas pode ser adaptado para usar o esquema da organização do usuário autenticado
  v_schema_name := 'org_rl_representacoes';
  
  -- Criar o usuário (se não existir)
  EXECUTE format('CREATE USER %I WITH PASSWORD %L', p_username, p_password);
  
  -- Conceder permissões ao usuário
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO %I', v_schema_name, p_username);
  EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO %I', v_schema_name, p_username);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT ON TABLES TO %I', 
                v_schema_name, p_username);
  
  -- Permitir que o usuário leia os metadados das tabelas
  EXECUTE format('GRANT USAGE ON SCHEMA information_schema TO %I', p_username);
  EXECUTE format('GRANT SELECT ON information_schema.tables TO %I', p_username);
  EXECUTE format('GRANT SELECT ON information_schema.columns TO %I', p_username);
  
  RETURN json_build_object(
    'success', true,
    'message', format('Usuário %I criado com permissões para o esquema %I', p_username, v_schema_name)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$;

-- Permissões para a função
GRANT EXECUTE ON FUNCTION public.create_airbyte_user TO service_role;
REVOKE EXECUTE ON FUNCTION public.create_airbyte_user FROM anon, authenticated;
