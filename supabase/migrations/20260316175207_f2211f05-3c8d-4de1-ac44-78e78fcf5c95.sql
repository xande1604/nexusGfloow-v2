
-- FIX: get_owner_admin_id must return the ROOT tenant admin for ALL members, including sub-admins
-- Current bug: for admin role users, it returns their own UID instead of their creator's UID
-- Correct logic: only the master admin (created_by_admin_id IS NULL) returns own UID;
-- everyone else (including sub-admins) returns their created_by_admin_id
CREATE OR REPLACE FUNCTION public.get_owner_admin_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN is_master_admin(_user_id) THEN _user_id
    ELSE (SELECT created_by_admin_id FROM public.user_roles WHERE user_id = _user_id)
  END;
$$;

-- Fix data: migrate empresas created by sub-admins to correct owner_admin_id (root tenant admin)
UPDATE public.empresas
SET owner_admin_id = 'a7fdff88-b39f-4e6d-8826-4070ec9d5ed5'
WHERE owner_admin_id IN (
  '75ae28ee-18d6-4cd4-a919-65b212179533', -- ana.claudia
  'a4e5721a-3b6a-442b-9387-0c63ecca1449', -- isis
  '41ffbe3a-7c9e-4bfc-ab05-71663a7e2a82'  -- abelardo
);

-- Also fix any cargos and centrodecustos created by sub-admins of alexandre's tenant
UPDATE public.cargos
SET owner_admin_id = 'a7fdff88-b39f-4e6d-8826-4070ec9d5ed5'
WHERE owner_admin_id IN (
  '75ae28ee-18d6-4cd4-a919-65b212179533',
  'a4e5721a-3b6a-442b-9387-0c63ecca1449',
  '41ffbe3a-7c9e-4bfc-ab05-71663a7e2a82'
);

UPDATE public.centrodecustos
SET owner_admin_id = 'a7fdff88-b39f-4e6d-8826-4070ec9d5ed5'
WHERE owner_admin_id IN (
  '75ae28ee-18d6-4cd4-a919-65b212179533',
  'a4e5721a-3b6a-442b-9387-0c63ecca1449',
  '41ffbe3a-7c9e-4bfc-ab05-71663a7e2a82'
);
