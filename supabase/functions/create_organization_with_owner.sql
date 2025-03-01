
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_user_id UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id UUID;
BEGIN
  -- Criar a organização
  INSERT INTO organizations (name, slug, status)
  VALUES (p_name, p_slug, 'active')
  RETURNING id INTO v_organization_id;

  -- Criar o membro owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_organization_id, p_user_id, 'owner');

  RETURN json_build_object(
    'organization_id', v_organization_id
  );
END;
$$;
