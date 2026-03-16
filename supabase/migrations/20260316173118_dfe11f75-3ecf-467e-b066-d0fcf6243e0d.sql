
-- Allow gestores, analistas and visualizadores to read empresas from their tenant
CREATE POLICY "Membros podem ver empresas do seu tenant"
ON public.empresas FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'analista'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role))
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores, analistas and visualizadores to read cargos from their tenant
CREATE POLICY "Membros podem ver cargos do seu tenant"
ON public.cargos FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'analista'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role))
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow gestores, analistas and visualizadores to read centrodecustos from their tenant
CREATE POLICY "Membros podem ver centros de custo do seu tenant"
ON public.centrodecustos FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'gestor'::app_role) OR has_role(auth.uid(), 'analista'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role))
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Allow analistas to read employees from their tenant
CREATE POLICY "Analistas podem ver colaboradores do seu tenant"
ON public.employees FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'analista'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);
