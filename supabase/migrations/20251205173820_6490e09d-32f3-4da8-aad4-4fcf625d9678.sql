-- Tabela de ciclos de avaliação
CREATE TABLE public.evaluation_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  owner_admin_id uuid DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de avaliações individuais (por colaborador)
CREATE TABLE public.employee_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES public.evaluation_cycles(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]',
  self_assessment_responses jsonb,
  self_assessment_completed_at timestamp with time zone,
  manager_evaluation_responses jsonb,
  manager_feedback text,
  manager_evaluation_completed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'self_assessment_done', 'completed')),
  owner_admin_id uuid DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(cycle_id, employee_id)
);

-- Enable RLS
ALTER TABLE public.evaluation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies para ciclos (gestores autenticados)
CREATE POLICY "Admins podem gerenciar ciclos"
ON public.evaluation_cycles FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policies para avaliações (gestores autenticados)
CREATE POLICY "Admins podem gerenciar avaliações"
ON public.employee_evaluations FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabela de credenciais de colaboradores para autoavaliação
CREATE TABLE public.employee_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.employee_credentials ENABLE ROW LEVEL SECURITY;

-- Service role pode gerenciar credenciais (via edge function)
CREATE POLICY "Service role gerencia credenciais"
ON public.employee_credentials FOR ALL
USING (true)
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_evaluation_cycles_status ON public.evaluation_cycles(status);
CREATE INDEX idx_employee_evaluations_cycle ON public.employee_evaluations(cycle_id);
CREATE INDEX idx_employee_evaluations_employee ON public.employee_evaluations(employee_id);
CREATE INDEX idx_employee_evaluations_status ON public.employee_evaluations(status);