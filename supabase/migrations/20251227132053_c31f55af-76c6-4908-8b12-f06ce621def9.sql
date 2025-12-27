-- Base de Conhecimento
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_admin_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.centrodecustos(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testes/Provas
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_admin_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.centrodecustos(id) ON DELETE SET NULL,
  participation_mode TEXT NOT NULL DEFAULT 'cargo' CHECK (participation_mode IN ('cargo', 'selected', 'self_enrollment')),
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questões do Teste (para histórico e reutilização)
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_admin_id UUID,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'essay')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participantes selecionados (quando participation_mode = 'selected')
CREATE TABLE public.test_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by UUID,
  UNIQUE(test_id, employee_id)
);

-- Autoinscrições (quando participation_mode = 'self_enrollment')
CREATE TABLE public.test_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(test_id, employee_id)
);

-- Tentativas de Teste
CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_admin_id UUID,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  responses JSONB NOT NULL DEFAULT '[]',
  auto_score DECIMAL(5,2),
  manual_score DECIMAL(5,2),
  final_score DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'pending_review', 'graded')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  feedback TEXT
);

-- Certificações
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_admin_id UUID,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  certificate_code TEXT UNIQUE NOT NULL,
  UNIQUE(test_id, employee_id, attempt_id)
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_base
CREATE POLICY "Users can view knowledge base" ON public.knowledge_base
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tests
CREATE POLICY "Users can view active tests" ON public.tests
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tests" ON public.tests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for test_questions
CREATE POLICY "Users can view test questions" ON public.test_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage test questions" ON public.test_questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for test_participants
CREATE POLICY "Users can view their participations" ON public.test_participants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage participants" ON public.test_participants
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for test_enrollments
CREATE POLICY "Users can view enrollments" ON public.test_enrollments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can self-enroll" ON public.test_enrollments
  FOR INSERT WITH CHECK (true);

-- RLS Policies for test_attempts
CREATE POLICY "Users can view attempts" ON public.test_attempts
  FOR SELECT USING (true);

CREATE POLICY "Users can create attempts" ON public.test_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own attempts" ON public.test_attempts
  FOR UPDATE USING (true);

-- RLS Policies for certifications
CREATE POLICY "Users can view certifications" ON public.certifications
  FOR SELECT USING (true);

CREATE POLICY "System can issue certifications" ON public.certifications
  FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for knowledge base files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-base', 'knowledge-base', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view knowledge base files" ON storage.objects
  FOR SELECT USING (bucket_id = 'knowledge-base');

CREATE POLICY "Authenticated can upload knowledge base files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'knowledge-base');

CREATE POLICY "Authenticated can update knowledge base files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'knowledge-base');

CREATE POLICY "Authenticated can delete knowledge base files" ON storage.objects
  FOR DELETE USING (bucket_id = 'knowledge-base');