
-- Allow gestores to INSERT empresas (owner_admin_id must be set to the tenant's admin)
CREATE POLICY "Gestores podem inserir empresas do seu tenant"
ON public.empresas FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to UPDATE empresas of their tenant
CREATE POLICY "Gestores podem atualizar empresas do seu tenant"
ON public.empresas FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to DELETE empresas of their tenant
CREATE POLICY "Gestores podem deletar empresas do seu tenant"
ON public.empresas FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to INSERT cargos
CREATE POLICY "Gestores podem inserir cargos do seu tenant"
ON public.cargos FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to UPDATE cargos of their tenant
CREATE POLICY "Gestores podem atualizar cargos do seu tenant"
ON public.cargos FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to DELETE cargos of their tenant
CREATE POLICY "Gestores podem deletar cargos do seu tenant"
ON public.cargos FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to INSERT centrodecustos
CREATE POLICY "Gestores podem inserir centros de custo do seu tenant"
ON public.centrodecustos FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to UPDATE centrodecustos of their tenant
CREATE POLICY "Gestores podem atualizar centros de custo do seu tenant"
ON public.centrodecustos FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores to DELETE centrodecustos of their tenant
CREATE POLICY "Gestores podem deletar centros de custo do seu tenant"
ON public.centrodecustos FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);
