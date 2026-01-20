-- Create enum for pricing profile types
CREATE TYPE public.pricing_profile_type AS ENUM ('empresa_isolada', 'consultor_revenda', 'consultor_proprio');

-- Create pricing profiles table
CREATE TABLE public.pricing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_type pricing_profile_type NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pricing questions table
CREATE TABLE public.pricing_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_type pricing_profile_type NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'text', -- text, number, select, multiselect, range
    options JSONB, -- for select/multiselect types
    placeholder TEXT,
    is_required BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB, -- for range min/max, validation rules, etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pricing questionnaire responses table
CREATE TABLE public.pricing_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_type pricing_profile_type NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    company_name TEXT,
    responses JSONB NOT NULL, -- {question_id: answer}
    status TEXT DEFAULT 'pending', -- pending, contacted, converted, rejected
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_responses ENABLE ROW LEVEL SECURITY;

-- Policies for pricing_profiles (public read, admin write)
CREATE POLICY "Anyone can view active pricing profiles"
ON public.pricing_profiles FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pricing profiles"
ON public.pricing_profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for pricing_questions (public read active, admin write)
CREATE POLICY "Anyone can view active pricing questions"
ON public.pricing_questions FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pricing questions"
ON public.pricing_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for pricing_responses (public insert, admin read/write)
CREATE POLICY "Anyone can submit pricing responses"
ON public.pricing_responses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view and manage pricing responses"
ON public.pricing_responses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default profiles
INSERT INTO public.pricing_profiles (profile_type, name, description, icon, display_order) VALUES
('empresa_isolada', 'Empresa com Ambiente Próprio', 'Implantação completa com ambiente isolado exclusivo. Precificação baseada no número de colaboradores.', 'Building2', 1),
('consultor_revenda', 'Consultor - Revenda', 'Consultores que sublocam o app para seus próprios clientes, oferecendo acesso direto à plataforma.', 'Users', 2),
('consultor_proprio', 'Consultor - Uso Próprio', 'Consultores que utilizam o app como ferramenta interna, entregando resultados sem acesso dos clientes.', 'Briefcase', 3);

-- Insert default questions for each profile
-- Questions for empresa_isolada
INSERT INTO public.pricing_questions (profile_type, question_text, question_type, options, placeholder, display_order, metadata) VALUES
('empresa_isolada', 'Quantos colaboradores sua empresa possui?', 'range', NULL, NULL, 1, '{"min": 1, "max": 10000, "step": 1, "ranges": [{"label": "1-50", "value": "1-50"}, {"label": "51-200", "value": "51-200"}, {"label": "201-500", "value": "201-500"}, {"label": "501-1000", "value": "501-1000"}, {"label": "1000+", "value": "1000+"}]}'),
('empresa_isolada', 'Qual o segmento da sua empresa?', 'text', NULL, 'Ex: Tecnologia, Varejo, Indústria...', 2, NULL),
('empresa_isolada', 'Quais módulos você tem interesse?', 'multiselect', '["Dashboard Analytics", "Gestão de Cargos", "Avaliação de Desempenho", "Plano de Carreira", "Recrutamento", "Treinamentos", "Testes e Certificações"]', NULL, 3, NULL),
('empresa_isolada', 'Você possui um sistema de RH integrado?', 'select', '["Sim, preciso de integração", "Não, será standalone", "Ainda estou avaliando"]', NULL, 4, NULL),
('empresa_isolada', 'Qual o prazo desejado para implantação?', 'select', '["Urgente (até 30 dias)", "Curto prazo (1-3 meses)", "Médio prazo (3-6 meses)", "Longo prazo (6+ meses)"]', NULL, 5, NULL);

-- Questions for consultor_revenda
INSERT INTO public.pricing_questions (profile_type, question_text, question_type, options, placeholder, display_order, metadata) VALUES
('consultor_revenda', 'Quantos clientes você pretende atender inicialmente?', 'select', '["1-5 clientes", "6-15 clientes", "16-30 clientes", "30+ clientes"]', NULL, 1, NULL),
('consultor_revenda', 'Qual o porte médio dos seus clientes?', 'select', '["Pequeno (até 50 colaboradores)", "Médio (51-200 colaboradores)", "Grande (201-500 colaboradores)", "Enterprise (500+ colaboradores)", "Variado"]', NULL, 2, NULL),
('consultor_revenda', 'Você já possui uma carteira de clientes ativa?', 'select', '["Sim, já tenho clientes interessados", "Estou construindo a carteira", "Ainda não tenho clientes"]', NULL, 3, NULL),
('consultor_revenda', 'Qual sua área de atuação como consultor?', 'text', NULL, 'Ex: RH, Gestão de Pessoas, Desenvolvimento Organizacional...', 4, NULL),
('consultor_revenda', 'Você oferece serviços de implantação e suporte?', 'select', '["Sim, ofereço suporte completo", "Apenas implantação", "Apenas consultoria estratégica", "Preciso de apoio do GFloow"]', NULL, 5, NULL);

-- Questions for consultor_proprio
INSERT INTO public.pricing_questions (profile_type, question_text, question_type, options, placeholder, display_order, metadata) VALUES
('consultor_proprio', 'Quantos projetos você conduz simultaneamente?', 'select', '["1-3 projetos", "4-8 projetos", "9-15 projetos", "15+ projetos"]', NULL, 1, NULL),
('consultor_proprio', 'Qual o tipo de entregável principal?', 'multiselect', '["Relatórios de assessment", "Planos de desenvolvimento", "Análise de clima", "Estruturação de cargos", "Avaliação de desempenho", "Mapeamento de competências"]', NULL, 2, NULL),
('consultor_proprio', 'Você trabalha sozinho ou em equipe?', 'select', '["Consultor individual", "Pequena equipe (2-5 pessoas)", "Consultoria estruturada (6+ pessoas)"]', NULL, 3, NULL),
('consultor_proprio', 'Com que frequência você gera relatórios para clientes?', 'select', '["Semanalmente", "Quinzenalmente", "Mensalmente", "Por projeto/demanda"]', NULL, 4, NULL),
('consultor_proprio', 'Você precisa de white-label (sua marca)?', 'select', '["Sim, quero minha marca nos relatórios", "Não, pode usar a marca GFloow", "Gostaria de entender melhor essa opção"]', NULL, 5, NULL);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pricing_profiles_updated_at
    BEFORE UPDATE ON public.pricing_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pricing_updated_at();

CREATE TRIGGER update_pricing_questions_updated_at
    BEFORE UPDATE ON public.pricing_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pricing_updated_at();

CREATE TRIGGER update_pricing_responses_updated_at
    BEFORE UPDATE ON public.pricing_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pricing_updated_at();