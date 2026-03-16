
-- Fix SELECT policy for admins on empresas to work for sub-tenant admins
-- With the corrected get_owner_admin_id, sub-admins now return created_by_admin_id
-- The old policy checked: owner_admin_id = auth.uid() OR is_master_admin
-- This breaks for sub-admins because their owner_admin_id is their creator (not their own uid)
DROP POLICY IF EXISTS "Admins podem ver suas empresas" ON public.empresas;
CREATE POLICY "Admins podem ver suas empresas"
ON public.empresas FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND (
    owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND (codempresa LIKE 'DEMO%') AND NOT admin_has_own_employees(auth.uid()))
  )
);

-- Same fix for cargos SELECT policy for admins
DROP POLICY IF EXISTS "Admins podem ver seus cargos" ON public.cargos;
CREATE POLICY "Admins podem ver seus cargos"
ON public.cargos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND (
    owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND (codigocargo LIKE 'DEMO%') AND NOT admin_has_own_employees(auth.uid()))
  )
);

-- Same fix for centrodecustos SELECT policy for admins
DROP POLICY IF EXISTS "Admins podem ver seus centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem ver seus centros de custo"
ON public.centrodecustos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND (
    owner_admin_id = get_owner_admin_id(auth.uid())
    OR (owner_admin_id IS NULL AND (codcentrodecustos LIKE 'DEMO%') AND NOT admin_has_own_employees(auth.uid()))
  )
);

-- Also fix UPDATE/DELETE policies for admins that still use auth.uid() directly
DROP POLICY IF EXISTS "Admins podem atualizar seus cargos" ON public.cargos;
CREATE POLICY "Admins podem atualizar seus cargos"
ON public.cargos FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

DROP POLICY IF EXISTS "Admins podem deletar seus cargos" ON public.cargos;
CREATE POLICY "Admins podem deletar seus cargos"
ON public.cargos FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

DROP POLICY IF EXISTS "Admins podem atualizar seus centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem atualizar seus centros de custo"
ON public.centrodecustos FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

DROP POLICY IF EXISTS "Admins podem deletar seus centros de custo" ON public.centrodecustos;
CREATE POLICY "Admins podem deletar seus centros de custo"
ON public.centrodecustos FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);
