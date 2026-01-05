-- Tabela de candidatos
CREATE TABLE public.candidatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_admin_id UUID,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  data_nascimento DATE,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  curriculo_url TEXT,
  foto_url TEXT,
  resumo_profissional TEXT,
  pretensao_salarial NUMERIC,
  disponibilidade TEXT,
  fonte TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de skills/competências do candidato
CREATE TABLE public.candidato_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  nivel TEXT,
  anos_experiencia NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de experiências profissionais
CREATE TABLE public.candidato_experiencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  empresa TEXT NOT NULL,
  cargo TEXT NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  atual BOOLEAN DEFAULT false,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de formação acadêmica
CREATE TABLE public.candidato_formacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  instituicao TEXT NOT NULL,
  curso TEXT NOT NULL,
  nivel TEXT,
  data_inicio DATE,
  data_conclusao DATE,
  em_andamento BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de vagas
CREATE TABLE public.vagas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_admin_id UUID,
  titulo TEXT NOT NULL,
  cargo_id UUID REFERENCES public.cargos(id),
  codcentrodecustos TEXT,
  codempresa TEXT,
  descricao TEXT,
  requisitos TEXT,
  beneficios TEXT,
  tipo_contrato TEXT,
  modalidade TEXT,
  local TEXT,
  salario_min NUMERIC,
  salario_max NUMERIC,
  quantidade_vagas INTEGER DEFAULT 1,
  data_abertura DATE DEFAULT CURRENT_DATE,
  data_limite DATE,
  status TEXT DEFAULT 'aberta',
  prioridade TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de skills requeridas pela vaga
CREATE TABLE public.vaga_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vaga_id UUID NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  nivel_minimo TEXT,
  obrigatoria BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de candidaturas (inscrições em vagas)
CREATE TABLE public.candidaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_admin_id UUID,
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
  etapa TEXT DEFAULT 'triagem',
  status TEXT DEFAULT 'em_analise',
  match_score NUMERIC,
  match_detalhes JSONB,
  data_candidatura TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidato_id, vaga_id)
);

-- Tabela de entrevistas
CREATE TABLE public.entrevistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_admin_id UUID,
  candidatura_id UUID NOT NULL REFERENCES public.candidaturas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  local TEXT,
  link_online TEXT,
  entrevistadores TEXT[],
  status TEXT DEFAULT 'agendada',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de feedbacks/avaliações
CREATE TABLE public.candidatura_feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_admin_id UUID,
  candidatura_id UUID NOT NULL REFERENCES public.candidaturas(id) ON DELETE CASCADE,
  entrevista_id UUID REFERENCES public.entrevistas(id),
  avaliador_id UUID,
  avaliador_nome TEXT,
  tipo TEXT NOT NULL,
  nota_geral INTEGER,
  criterios JSONB,
  pontos_fortes TEXT,
  pontos_melhoria TEXT,
  recomendacao TEXT,
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidato_formacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaga_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrevistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatura_feedbacks ENABLE ROW LEVEL SECURITY;

-- Políticas para candidatos (admins veem todos os seus candidatos)
CREATE POLICY "Admins podem ver candidatos" ON public.candidatos
  FOR SELECT USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

CREATE POLICY "Admins podem criar candidatos" ON public.candidatos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem atualizar candidatos" ON public.candidatos
  FOR UPDATE USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

CREATE POLICY "Admins podem deletar candidatos" ON public.candidatos
  FOR DELETE USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

-- Políticas para candidato_skills
CREATE POLICY "Acesso a skills de candidatos" ON public.candidato_skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.candidatos c WHERE c.id = candidato_id AND (c.owner_admin_id = get_owner_admin_id(auth.uid()) OR c.owner_admin_id IS NULL))
  );

-- Políticas para candidato_experiencias
CREATE POLICY "Acesso a experiencias de candidatos" ON public.candidato_experiencias
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.candidatos c WHERE c.id = candidato_id AND (c.owner_admin_id = get_owner_admin_id(auth.uid()) OR c.owner_admin_id IS NULL))
  );

-- Políticas para candidato_formacoes
CREATE POLICY "Acesso a formacoes de candidatos" ON public.candidato_formacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.candidatos c WHERE c.id = candidato_id AND (c.owner_admin_id = get_owner_admin_id(auth.uid()) OR c.owner_admin_id IS NULL))
  );

-- Políticas para vagas
CREATE POLICY "Admins podem ver vagas" ON public.vagas
  FOR SELECT USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

CREATE POLICY "Admins podem criar vagas" ON public.vagas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem atualizar vagas" ON public.vagas
  FOR UPDATE USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

CREATE POLICY "Admins podem deletar vagas" ON public.vagas
  FOR DELETE USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

-- Políticas para vaga_skills
CREATE POLICY "Acesso a skills de vagas" ON public.vaga_skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.vagas v WHERE v.id = vaga_id AND (v.owner_admin_id = get_owner_admin_id(auth.uid()) OR v.owner_admin_id IS NULL))
  );

-- Políticas para candidaturas
CREATE POLICY "Admins podem ver candidaturas" ON public.candidaturas
  FOR SELECT USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

CREATE POLICY "Admins podem criar candidaturas" ON public.candidaturas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem atualizar candidaturas" ON public.candidaturas
  FOR UPDATE USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

CREATE POLICY "Admins podem deletar candidaturas" ON public.candidaturas
  FOR DELETE USING (owner_admin_id = get_owner_admin_id(auth.uid()) OR owner_admin_id IS NULL);

-- Políticas para entrevistas
CREATE POLICY "Acesso a entrevistas" ON public.entrevistas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.candidaturas c WHERE c.id = candidatura_id AND (c.owner_admin_id = get_owner_admin_id(auth.uid()) OR c.owner_admin_id IS NULL))
  );

-- Políticas para feedbacks
CREATE POLICY "Acesso a feedbacks" ON public.candidatura_feedbacks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.candidaturas c WHERE c.id = candidatura_id AND (c.owner_admin_id = get_owner_admin_id(auth.uid()) OR c.owner_admin_id IS NULL))
  );

-- Triggers para updated_at
CREATE TRIGGER update_candidatos_updated_at BEFORE UPDATE ON public.candidatos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vagas_updated_at BEFORE UPDATE ON public.vagas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidaturas_updated_at BEFORE UPDATE ON public.candidaturas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entrevistas_updated_at BEFORE UPDATE ON public.entrevistas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_candidatos_owner ON public.candidatos(owner_admin_id);
CREATE INDEX idx_candidatos_status ON public.candidatos(status);
CREATE INDEX idx_vagas_owner ON public.vagas(owner_admin_id);
CREATE INDEX idx_vagas_status ON public.vagas(status);
CREATE INDEX idx_candidaturas_vaga ON public.candidaturas(vaga_id);
CREATE INDEX idx_candidaturas_candidato ON public.candidaturas(candidato_id);
CREATE INDEX idx_candidaturas_etapa ON public.candidaturas(etapa);

-- Bucket para currículos
INSERT INTO storage.buckets (id, name, public) VALUES ('curriculos', 'curriculos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para currículos
CREATE POLICY "Admins podem ver curriculos" ON storage.objects
  FOR SELECT USING (bucket_id = 'curriculos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins podem fazer upload curriculos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'curriculos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar curriculos" ON storage.objects
  FOR DELETE USING (bucket_id = 'curriculos' AND auth.role() = 'authenticated');