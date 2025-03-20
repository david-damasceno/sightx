
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_user_id UUID,
  p_sector TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id UUID;
  v_org RECORD;
  v_schema_name TEXT;
  v_storage_path TEXT;
BEGIN
  -- Criar a organização com os novos campos
  INSERT INTO organizations (name, slug, status, settings)
  VALUES (
    p_name, 
    p_slug, 
    'active',
    jsonb_build_object(
      'sector', p_sector,
      'city', p_city,
      'state', p_state,
      'description', p_description
    )
  )
  RETURNING * INTO v_org;

  -- Adicionar o usuário como owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org.id, p_user_id, 'owner');
  
  -- Criar nome do esquema baseado no slug da organização (para evitar caracteres inválidos)
  v_schema_name := 'org_' || p_slug;
  v_schema_name := regexp_replace(v_schema_name, '[^a-zA-Z0-9_]', '_', 'g');
  
  -- Armazenar o nome do esquema nas configurações da organização
  UPDATE organizations 
  SET settings = settings || jsonb_build_object('schema_name', v_schema_name)
  WHERE id = v_org.id;
  
  -- Criar o esquema para a organização
  EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || quote_ident(v_schema_name);
  
  -- Conceder permissões ao esquema para o usuário atual
  -- Além de conceder à função anon e service_role
  EXECUTE 'GRANT USAGE ON SCHEMA ' || quote_ident(v_schema_name) || ' TO authenticated';
  EXECUTE 'GRANT USAGE ON SCHEMA ' || quote_ident(v_schema_name) || ' TO anon';
  EXECUTE 'GRANT USAGE ON SCHEMA ' || quote_ident(v_schema_name) || ' TO service_role';
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA ' || quote_ident(v_schema_name) || 
          ' GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated';
  
  -- Criar um bucket no storage para a organização (se não existir)
  BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (v_org.id::text, v_org.slug, false);
  EXCEPTION WHEN unique_violation THEN
    -- Ignora se o bucket já existir
  END;
  
  -- Configurar RLS para o bucket - CORREÇÃO: Modificado para evitar o erro "op ANY/ALL (array) requires array on right side"
  EXECUTE 'CREATE POLICY "' || v_org.slug || '_bucket_policy" ON storage.objects 
           FOR ALL 
           TO authenticated
           USING (bucket_id = ''' || v_org.id::text || ''' AND (
              auth.uid()::text = ANY(owner) OR
              auth.uid() IN (
                SELECT user_id FROM organization_members 
                WHERE organization_id = ''' || v_org.id || '''
              )
           ))';
  
  -- Retornar um JSON com os dados da organização
  RETURN row_to_json(v_org);
END;
$$;
