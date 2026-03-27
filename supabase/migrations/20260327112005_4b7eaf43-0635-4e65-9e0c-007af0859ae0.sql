
-- =============================================
-- 1. PERFORMANCE: Índices para acelerar queries RLS
-- =============================================

-- Índices em owner_admin_id para tabelas que não têm
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_owner ON public.career_roadmaps(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_employee ON public.career_roadmaps(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_owner ON public.performance_reviews(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_evaluations_owner ON public.employee_evaluations(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_employee_evaluations_employee ON public.employee_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_owner ON public.employee_skills(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_cargos_owner ON public.cargos(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_centrodecustos_owner ON public.centrodecustos(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_empresas_owner ON public.empresas(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_nexus_employees_email ON public.nexus_employees(email);

-- Índice no user_roles para acelerar get_owner_admin_id recursivo
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- =============================================
-- 2. VINCULAÇÃO COLABORADOR-USUÁRIO
-- =============================================

-- Adicionar role 'user' ao enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';

-- Adicionar coluna linked_user_id na tabela nexus_employees
ALTER TABLE public.nexus_employees 
  ADD COLUMN IF NOT EXISTS linked_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_nexus_employees_linked_user ON public.nexus_employees(linked_user_id) WHERE linked_user_id IS NOT NULL;

-- Função para vincular colaborador a usuário pelo email
CREATE OR REPLACE FUNCTION public.link_employee_to_user(_employee_id uuid, _email text, _owner_admin_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _found_user_id uuid;
BEGIN
  IF _email IS NULL OR _email = '' THEN
    RETURN;
  END IF;

  -- Buscar usuário auth com este email
  SELECT id INTO _found_user_id
  FROM auth.users
  WHERE email = lower(trim(_email));

  IF _found_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Verificar se este usuário já tem um role (admin/gestor/analista/visualizador)
  -- Se já tem, não sobrescrever - apenas vincular
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _found_user_id) THEN
    -- Criar role 'user' para o colaborador
    INSERT INTO public.user_roles (user_id, role, created_by_admin_id)
    VALUES (_found_user_id, 'user', _owner_admin_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Vincular o colaborador ao usuário
  UPDATE public.nexus_employees
  SET linked_user_id = _found_user_id
  WHERE id = _employee_id
    AND (linked_user_id IS NULL OR linked_user_id = _found_user_id);
END;
$$;

-- Trigger: ao inserir/atualizar colaborador com email, tentar vincular
CREATE OR REPLACE FUNCTION public.trigger_link_employee_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    PERFORM public.link_employee_to_user(NEW.id, NEW.email, NEW.owner_admin_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_employee_user ON public.nexus_employees;
CREATE TRIGGER trg_link_employee_user
  AFTER INSERT OR UPDATE OF email ON public.nexus_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_link_employee_user();

-- Função para vincular no login (chamada pela edge function)
CREATE OR REPLACE FUNCTION public.link_user_to_employee_on_login(_user_id uuid, _email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _emp record;
  _result json;
BEGIN
  -- Buscar colaborador com este email que ainda não está vinculado
  SELECT id, nome, owner_admin_id INTO _emp
  FROM public.nexus_employees
  WHERE email = lower(trim(_email))
    AND linked_user_id IS NULL
  LIMIT 1;

  IF _emp.id IS NULL THEN
    -- Verificar se já está vinculado
    SELECT json_build_object('linked', true, 'employee_id', ne.id, 'employee_name', ne.nome)
    INTO _result
    FROM public.nexus_employees ne
    WHERE ne.linked_user_id = _user_id
    LIMIT 1;
    
    IF _result IS NOT NULL THEN
      RETURN _result;
    END IF;
    
    RETURN json_build_object('linked', false);
  END IF;

  -- Vincular
  UPDATE public.nexus_employees
  SET linked_user_id = _user_id
  WHERE id = _emp.id;

  -- Adicionar role 'user' se não tem role ainda
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    INSERT INTO public.user_roles (user_id, role, created_by_admin_id)
    VALUES (_user_id, 'user', _emp.owner_admin_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN json_build_object('linked', true, 'employee_id', _emp.id, 'employee_name', _emp.nome);
END;
$$;

-- RLS: usuários com role 'user' podem ver seus próprios dados de roadmap
CREATE POLICY "Users can view own roadmaps"
ON public.career_roadmaps
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.nexus_employees WHERE linked_user_id = auth.uid()
  )
  OR owner_admin_id = public.get_owner_admin_id(auth.uid())
);

-- Dropar policy antiga de SELECT se existir para evitar conflito
DO $$
BEGIN
  -- Tentar dropar policies antigas de SELECT no career_roadmaps
  BEGIN
    DROP POLICY IF EXISTS "Users with roles can view roadmaps" ON public.career_roadmaps;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    DROP POLICY IF EXISTS "Authenticated users can read roadmaps" ON public.career_roadmaps;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
