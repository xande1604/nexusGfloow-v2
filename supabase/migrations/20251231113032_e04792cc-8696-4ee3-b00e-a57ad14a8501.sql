CREATE OR REPLACE FUNCTION public.admin_has_own_employees(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees
    WHERE owner_admin_id = _user_id
  )
$$;