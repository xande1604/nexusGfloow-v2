
-- 1. Create nexus_employees table
CREATE TABLE public.nexus_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  nome text NOT NULL,
  email text,
  codigocargo text,
  matricula text,
  dataadmissao date,
  codempresa text,
  codcentrodecustos text,
  gestor_id uuid,
  owner_admin_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for tenant isolation
CREATE INDEX idx_nexus_employees_owner ON public.nexus_employees(owner_admin_id);
CREATE INDEX idx_nexus_employees_source ON public.nexus_employees(source_employee_id);

-- 2. Migrate existing data from employees to nexus_employees (keeping same IDs for FK compatibility)
INSERT INTO public.nexus_employees (id, source_employee_id, nome, email, codigocargo, matricula, dataadmissao, codempresa, codcentrodecustos, gestor_id, owner_admin_id, created_at, updated_at)
SELECT id, id, nome, email, codigocargo, matricula, dataadmissao, codempresa, codcentrodecustos, gestor_id, owner_admin_id, created_at, updated_at
FROM public.employees
WHERE nome IS NOT NULL;

-- 3. Self-reference for gestor
ALTER TABLE public.nexus_employees
  ADD CONSTRAINT nexus_employees_gestor_id_fkey FOREIGN KEY (gestor_id) REFERENCES public.nexus_employees(id) ON DELETE SET NULL;

-- 4. Drop old FKs and create new ones pointing to nexus_employees
ALTER TABLE public.career_roadmaps DROP CONSTRAINT IF EXISTS career_roadmaps_employee_id_fkey;
ALTER TABLE public.career_roadmaps
  ADD CONSTRAINT career_roadmaps_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.nexus_employees(id) ON DELETE SET NULL;

ALTER TABLE public.employee_skills DROP CONSTRAINT IF EXISTS employee_skills_employee_id_fkey;
ALTER TABLE public.employee_skills
  ADD CONSTRAINT employee_skills_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.nexus_employees(id) ON DELETE CASCADE;

ALTER TABLE public.employee_evaluations DROP CONSTRAINT IF EXISTS employee_evaluations_employee_id_fkey;
ALTER TABLE public.employee_evaluations
  ADD CONSTRAINT employee_evaluations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.nexus_employees(id) ON DELETE CASCADE;

ALTER TABLE public.performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_employee_id_fkey;
ALTER TABLE public.performance_reviews
  ADD CONSTRAINT performance_reviews_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.nexus_employees(id) ON DELETE SET NULL;

ALTER TABLE public.certifications DROP CONSTRAINT IF EXISTS certifications_employee_id_fkey;
ALTER TABLE public.certifications
  ADD CONSTRAINT certifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.nexus_employees(id) ON DELETE CASCADE;

ALTER TABLE public.employee_credentials DROP CONSTRAINT IF EXISTS employee_credentials_employee_id_fkey;
ALTER TABLE public.employee_credentials
  ADD CONSTRAINT employee_credentials_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.nexus_employees(id) ON DELETE CASCADE;

-- 5. Enable RLS
ALTER TABLE public.nexus_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver nexus_employees"
  ON public.nexus_employees FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND (
      owner_admin_id = get_owner_admin_id(auth.uid())
      OR (owner_admin_id IS NULL AND NOT admin_has_own_employees(auth.uid()))
    )
  );

CREATE POLICY "Admins podem inserir nexus_employees"
  ON public.nexus_employees FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Admins podem atualizar nexus_employees"
  ON public.nexus_employees FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Admins podem deletar nexus_employees"
  ON public.nexus_employees FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Gestores podem ver nexus_employees"
  ON public.nexus_employees FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'gestor') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Gestores podem inserir nexus_employees"
  ON public.nexus_employees FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'gestor') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Gestores podem atualizar nexus_employees"
  ON public.nexus_employees FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'gestor') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Analistas podem ver nexus_employees"
  ON public.nexus_employees FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'analista') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

CREATE POLICY "Visualizadores podem ver nexus_employees"
  ON public.nexus_employees FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'visualizador') AND owner_admin_id = get_owner_admin_id(auth.uid())
  );

-- 6. Updated_at trigger
CREATE TRIGGER update_nexus_employees_updated_at
  BEFORE UPDATE ON public.nexus_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
