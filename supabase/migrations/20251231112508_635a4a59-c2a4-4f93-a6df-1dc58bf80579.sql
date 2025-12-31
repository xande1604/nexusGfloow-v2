-- Create a security definer function to check if admin has own employees
CREATE OR REPLACE FUNCTION public.admin_has_own_employees(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees
    WHERE owner_admin_id = _user_id
  )
$$;

-- Drop and recreate policies for employees table
DROP POLICY IF EXISTS "Admins podem ver seus próprios dados" ON public.employees;

CREATE POLICY "Admins podem ver seus próprios dados" 
ON public.employees 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND get_owner_admin_id(auth.uid()) IS NULL)
    OR (owner_admin_id IS NULL AND chave_empresa LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

-- Drop and recreate policies for empresas table
DROP POLICY IF EXISTS "Admins podem ver suas empresas" ON public.empresas;

CREATE POLICY "Admins podem ver suas empresas" 
ON public.empresas 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND get_owner_admin_id(auth.uid()) IS NULL)
    OR (owner_admin_id IS NULL AND codempresa LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

-- Drop and recreate policies for cargos table
DROP POLICY IF EXISTS "Admins podem ver seus cargos" ON public.cargos;

CREATE POLICY "Admins podem ver seus cargos" 
ON public.cargos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND get_owner_admin_id(auth.uid()) IS NULL)
    OR (owner_admin_id IS NULL AND codigocargo LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

-- Drop and recreate policies for centrodecustos table
DROP POLICY IF EXISTS "Admins podem ver seus centros de custo" ON public.centrodecustos;

CREATE POLICY "Admins podem ver seus centros de custo" 
ON public.centrodecustos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND get_owner_admin_id(auth.uid()) IS NULL)
    OR (owner_admin_id IS NULL AND codcentrodecustos LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);