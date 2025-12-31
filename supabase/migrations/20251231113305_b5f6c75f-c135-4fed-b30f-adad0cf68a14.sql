-- Create function to check if user is master admin (created_by_admin_id IS NULL)
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND created_by_admin_id IS NULL
  )
$$;

-- Update policies for cargos
DROP POLICY IF EXISTS "Admins podem ver seus cargos" ON public.cargos;
CREATE POLICY "Admins podem ver seus cargos" 
ON public.cargos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
    OR (owner_admin_id IS NULL AND codigocargo LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem atualizar seus cargos" ON public.cargos;
CREATE POLICY "Admins podem atualizar seus cargos" 
ON public.cargos 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem deletar seus cargos" ON public.cargos;
CREATE POLICY "Admins podem deletar seus cargos" 
ON public.cargos 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

-- Update policies for empresas
DROP POLICY IF EXISTS "Admins podem ver suas empresas" ON public.empresas;
CREATE POLICY "Admins podem ver suas empresas" 
ON public.empresas 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
    OR (owner_admin_id IS NULL AND codempresa LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem atualizar suas empresas" ON public.empresas;
CREATE POLICY "Admins podem atualizar suas empresas" 
ON public.empresas 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem deletar suas empresas" ON public.empresas;
CREATE POLICY "Admins podem deletar suas empresas" 
ON public.empresas 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

-- Update policies for centrodecustos
DROP POLICY IF EXISTS "Admins podem ver seus centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem ver seus centros de custo" 
ON public.centrodecustos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
    OR (owner_admin_id IS NULL AND codcentrodecustos LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem atualizar seus centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem atualizar seus centros de custo" 
ON public.centrodecustos 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem deletar seus centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem deletar seus centros de custo" 
ON public.centrodecustos 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

-- Update policies for employees
DROP POLICY IF EXISTS "Admins podem ver seus próprios dados" ON public.employees;
CREATE POLICY "Admins podem ver seus próprios dados" 
ON public.employees 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
    OR (owner_admin_id IS NULL AND chave_empresa LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem atualizar colaboradores" ON public.employees;
CREATE POLICY "Admins podem atualizar colaboradores" 
ON public.employees 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Admins podem deletar colaboradores" ON public.employees;
CREATE POLICY "Admins podem deletar colaboradores" 
ON public.employees 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    owner_admin_id = auth.uid() 
    OR (owner_admin_id IS NULL AND is_master_admin(auth.uid()))
  )
);