-- Drop existing overly permissive policies for employees
DROP POLICY IF EXISTS "Admins podem ver seus próprios dados" ON public.employees;
DROP POLICY IF EXISTS "Admins podem atualizar colaboradores" ON public.employees;
DROP POLICY IF EXISTS "Admins podem deletar colaboradores" ON public.employees;

-- Create stricter policy: Admin can only see their OWN data (owner_admin_id = auth.uid())
-- OR data from users they created (get_owner_admin_id returns their id)
CREATE POLICY "Admins podem ver seus próprios dados"
ON public.employees
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Update policy - admin can only update their own data
CREATE POLICY "Admins podem atualizar colaboradores"
ON public.employees
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Delete policy - admin can only delete their own data
CREATE POLICY "Admins podem deletar colaboradores"
ON public.employees
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Also fix cargos table
DROP POLICY IF EXISTS "Admins podem ver seus cargos" ON public.cargos;

CREATE POLICY "Admins podem ver seus cargos"
ON public.cargos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);

-- Fix empresas table
DROP POLICY IF EXISTS "Admins podem ver suas empresas" ON public.empresas;

CREATE POLICY "Admins podem ver suas empresas"
ON public.empresas
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
  )
);