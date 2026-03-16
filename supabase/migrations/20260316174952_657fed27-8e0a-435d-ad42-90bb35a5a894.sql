
-- Fix 1: Correct the INSERT policy for admins on empresas
-- sub-tenant admins: get_owner_admin_id returns created_by_admin_id, not their own uid
DROP POLICY IF EXISTS "Admins podem inserir empresas" ON public.empresas;
CREATE POLICY "Admins podem inserir empresas"
ON public.empresas FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Fix 2: UPDATE policy for admins on empresas
DROP POLICY IF EXISTS "Admins podem atualizar suas empresas" ON public.empresas;
CREATE POLICY "Admins podem atualizar suas empresas"
ON public.empresas FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Fix 3: DELETE policy for admins on empresas
DROP POLICY IF EXISTS "Admins podem deletar suas empresas" ON public.empresas;
CREATE POLICY "Admins podem deletar suas empresas"
ON public.empresas FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Fix 4: INSERT policy for admins on cargos
DROP POLICY IF EXISTS "Admins podem inserir cargos" ON public.cargos;
CREATE POLICY "Admins podem inserir cargos"
ON public.cargos FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Fix 5: INSERT policy for admins on centrodecustos
DROP POLICY IF EXISTS "Admins podem inserir centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem inserir centros de custo"
ON public.centrodecustos FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Fix 6: Update role of gpowerapps from analista to gestor
UPDATE public.user_roles
SET role = 'gestor'
WHERE user_id = 'b868e047-2b16-4929-89a8-c36ed3d254a3';
