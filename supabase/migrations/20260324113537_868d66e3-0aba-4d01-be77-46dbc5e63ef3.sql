-- Fix employees RLS: UPDATE and DELETE should use get_owner_admin_id(), not auth.uid() directly
DROP POLICY IF EXISTS "Admins podem atualizar colaboradores" ON public.employees;
DROP POLICY IF EXISTS "Admins podem deletar colaboradores" ON public.employees;
DROP POLICY IF EXISTS "Admins podem ver seus próprios dados" ON public.employees;
DROP POLICY IF EXISTS "Admins podem inserir colaboradores" ON public.employees;

CREATE POLICY "Admins podem atualizar colaboradores"
ON public.employees FOR UPDATE TO public
USING (has_role(auth.uid(), 'admin'::app_role) AND owner_admin_id = get_owner_admin_id(auth.uid()));

CREATE POLICY "Admins podem deletar colaboradores"
ON public.employees FOR DELETE TO public
USING (has_role(auth.uid(), 'admin'::app_role) AND owner_admin_id = get_owner_admin_id(auth.uid()));

CREATE POLICY "Admins podem ver seus próprios dados"
ON public.employees FOR SELECT TO public
USING (has_role(auth.uid(), 'admin'::app_role) AND (owner_admin_id = get_owner_admin_id(auth.uid()) OR (owner_admin_id IS NULL AND chave_empresa LIKE 'DEMO%' AND NOT admin_has_own_employees(auth.uid()))));

CREATE POLICY "Admins podem inserir colaboradores"
ON public.employees FOR INSERT TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND owner_admin_id = get_owner_admin_id(auth.uid()));

-- Migrate employees previously inserted with wrong sub-admin owner_admin_id
UPDATE public.employees e
SET owner_admin_id = ur.created_by_admin_id
FROM public.user_roles ur
WHERE e.owner_admin_id = ur.user_id
  AND ur.created_by_admin_id IS NOT NULL
  AND ur.role = 'admin';