-- Allow gestores to insert and update employees in their tenant
CREATE POLICY "Gestores podem inserir colaboradores"
ON public.employees FOR INSERT TO public
WITH CHECK (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

CREATE POLICY "Gestores podem atualizar colaboradores"
ON public.employees FOR UPDATE TO public
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);