-- Analista: INSERT, UPDATE, DELETE em nexus_employees
CREATE POLICY "Analistas podem inserir nexus_employees"
ON public.nexus_employees FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'analista'::app_role) 
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

CREATE POLICY "Analistas podem atualizar nexus_employees"
ON public.nexus_employees FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'analista'::app_role) 
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

CREATE POLICY "Analistas podem deletar nexus_employees"
ON public.nexus_employees FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'analista'::app_role) 
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);

-- Gestores: DELETE (já tinham INSERT e UPDATE)
CREATE POLICY "Gestores podem deletar nexus_employees"
ON public.nexus_employees FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role) 
  AND owner_admin_id = get_owner_admin_id(auth.uid())
);