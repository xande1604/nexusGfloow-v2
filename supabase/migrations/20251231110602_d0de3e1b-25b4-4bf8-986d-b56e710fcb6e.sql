-- Dados de demonstração com owner_admin_id NULL
-- Esses dados serão visíveis para admins que não têm dados próprios

-- Inserir empresa demo com códigos únicos
INSERT INTO public.empresas (id, codempresa, nomeempresa, owner_admin_id, cnae, grau_risco, percentual_encargos)
VALUES 
  ('00000000-0000-0000-0000-000000000101', 'DEMO001', 'Empresa Demonstração Ltda', NULL, '6201-5/00', 2, 80.0),
  ('00000000-0000-0000-0000-000000000102', 'DEMO002', 'Tech Solutions Demo S.A.', NULL, '6202-3/00', 1, 75.0)
ON CONFLICT (id) DO NOTHING;

-- Inserir centros de custo demo
INSERT INTO public.centrodecustos (id, codcentrodecustos, nomecentrodecustos, codempresa, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000201', 'DEMO-CC001', 'Tecnologia', 'DEMO001', NULL),
  ('00000000-0000-0000-0000-000000000202', 'DEMO-CC002', 'Recursos Humanos', 'DEMO001', NULL),
  ('00000000-0000-0000-0000-000000000203', 'DEMO-CC003', 'Financeiro', 'DEMO001', NULL),
  ('00000000-0000-0000-0000-000000000204', 'DEMO-CC004', 'Comercial', 'DEMO002', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir cargos demo
INSERT INTO public.cargos (id, codigocargo, tituloreduzido, salary_min, salary_max, hard_skills, soft_skills, technical_knowledge, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000301', 'DEMO-DEV-SR', 'Desenvolvedor Sênior', 12000, 18000, 'React, TypeScript, Node.js, PostgreSQL', 'Liderança técnica, Mentoria, Comunicação', 'Arquitetura de software, APIs REST, Cloud', NULL),
  ('00000000-0000-0000-0000-000000000302', 'DEMO-DEV-PL', 'Desenvolvedor Pleno', 7000, 12000, 'React, JavaScript, APIs REST', 'Trabalho em equipe, Proatividade', 'Desenvolvimento web, Git', NULL),
  ('00000000-0000-0000-0000-000000000303', 'DEMO-PM-SR', 'Product Manager Sênior', 15000, 22000, 'Gestão de produto, Métricas, Roadmap', 'Visão estratégica, Negociação, Liderança', 'Metodologias ágeis, Discovery', NULL),
  ('00000000-0000-0000-0000-000000000304', 'DEMO-RH-PL', 'Analista de RH Pleno', 5000, 8000, 'Recrutamento, Treinamento, Legislação trabalhista', 'Empatia, Organização, Comunicação', 'Processos de RH, People Analytics', NULL),
  ('00000000-0000-0000-0000-000000000305', 'DEMO-FIN-SR', 'Analista Financeiro Sênior', 10000, 15000, 'Contabilidade, Excel avançado, FP&A', 'Análise crítica, Atenção a detalhes', 'Planejamento orçamentário', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir colaboradores demo
INSERT INTO public.employees (id, nome, email, matricula, codigocargo, codcentrodecustos, chave_empresa, codempresa, dataadmissao, valorsalario, codsituacao, sexo, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000401', 'Maria Silva (Demo)', 'maria.silva@demo.com', 'DEMO-M001', 'DEMO-DEV-SR', 'DEMO-CC001', 'DEMO001', 'DEMO001', '2022-03-15', 15000, 'A', 'F', NULL),
  ('00000000-0000-0000-0000-000000000402', 'João Santos (Demo)', 'joao.santos@demo.com', 'DEMO-M002', 'DEMO-DEV-PL', 'DEMO-CC001', 'DEMO001', 'DEMO001', '2023-01-10', 9000, 'A', 'M', NULL),
  ('00000000-0000-0000-0000-000000000403', 'Ana Oliveira (Demo)', 'ana.oliveira@demo.com', 'DEMO-M003', 'DEMO-PM-SR', 'DEMO-CC001', 'DEMO001', 'DEMO001', '2021-06-20', 18000, 'A', 'F', NULL),
  ('00000000-0000-0000-0000-000000000404', 'Carlos Ferreira (Demo)', 'carlos.ferreira@demo.com', 'DEMO-M004', 'DEMO-RH-PL', 'DEMO-CC002', 'DEMO001', 'DEMO001', '2020-11-05', 6500, 'A', 'M', NULL),
  ('00000000-0000-0000-0000-000000000405', 'Lucia Mendes (Demo)', 'lucia.mendes@demo.com', 'DEMO-M005', 'DEMO-FIN-SR', 'DEMO-CC003', 'DEMO001', 'DEMO001', '2019-08-12', 12000, 'A', 'F', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir skills demo
INSERT INTO public.skills (id, name, category, description, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000501', 'React (Demo)', 'Technical', 'Biblioteca JavaScript para interfaces', NULL),
  ('00000000-0000-0000-0000-000000000502', 'TypeScript (Demo)', 'Technical', 'Superset tipado de JavaScript', NULL),
  ('00000000-0000-0000-0000-000000000503', 'Node.js (Demo)', 'Technical', 'Runtime JavaScript server-side', NULL),
  ('00000000-0000-0000-0000-000000000504', 'Python (Demo)', 'Technical', 'Linguagem de programação versátil', NULL),
  ('00000000-0000-0000-0000-000000000505', 'SQL (Demo)', 'Technical', 'Linguagem de consulta a bancos de dados', NULL),
  ('00000000-0000-0000-0000-000000000506', 'Comunicação (Demo)', 'Soft Skill', 'Expressar ideias com clareza', NULL),
  ('00000000-0000-0000-0000-000000000507', 'Liderança (Demo)', 'Leadership', 'Capacidade de guiar e inspirar equipes', NULL),
  ('00000000-0000-0000-0000-000000000508', 'Inglês Avançado (Demo)', 'Language', 'Fluência em comunicação profissional', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir employee_skills demo
INSERT INTO public.employee_skills (id, employee_id, skill_name, skill_category, source_type, source_name, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000401', 'React', 'Technical', 'training', 'Curso React Avançado', NULL),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000401', 'TypeScript', 'Technical', 'training', 'Certificação TypeScript', NULL),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000402', 'React', 'Technical', 'training', 'Bootcamp Frontend', NULL),
  ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000403', 'Liderança', 'Leadership', 'training', 'MBA Gestão de Produtos', NULL),
  ('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000404', 'Comunicação', 'Soft Skill', 'training', 'Workshop RH Estratégico', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir career_roadmaps demo
INSERT INTO public.career_roadmaps (id, employee_id, source_role_title, target_role_title, owner_admin_id, steps, progress)
VALUES 
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000402', 'Desenvolvedor Pleno', 'Desenvolvedor Sênior', NULL,
   '[{"title": "Dominar arquitetura de software", "description": "Aprofundar conhecimentos em padrões de arquitetura", "estimatedDuration": "3 meses", "requiredSkills": ["Clean Architecture", "Design Patterns"]}, {"title": "Liderança técnica", "description": "Desenvolver habilidades de mentoria e code review", "estimatedDuration": "4 meses", "requiredSkills": ["Mentoria", "Code Review"]}]',
   '{"currentStepIndex": 1, "progressPercentage": 35, "completedSteps": [0], "summary": "João está progredindo bem na trilha para Sênior"}'
  ),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000404', 'Analista de RH Pleno', 'Coordenador de RH', NULL,
   '[{"title": "Gestão de equipes", "description": "Desenvolver competências de liderança", "estimatedDuration": "4 meses", "requiredSkills": ["Liderança", "Feedback"]}, {"title": "Indicadores de RH", "description": "Dominar KPIs de RH e people analytics", "estimatedDuration": "3 meses", "requiredSkills": ["People Analytics", "Power BI"]}]',
   '{"currentStepIndex": 2, "progressPercentage": 60, "completedSteps": [0, 1], "summary": "Carlos demonstra excelente evolução"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir ciclo de avaliação demo
INSERT INTO public.evaluation_cycles (id, title, description, status, start_date, end_date, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000801', 'Ciclo Anual 2024 (Demo)', 'Avaliação de desempenho anual de demonstração', 'active', '2024-01-01', '2024-12-31', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir avaliações demo (status válidos: pending, self_assessment_done, completed)
INSERT INTO public.employee_evaluations (id, cycle_id, employee_id, status, questions, self_assessment_responses, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000401', 'completed',
   '[{"id": "q1", "question": "Como você avalia o cumprimento de metas?", "type": "rating"}, {"id": "q2", "question": "Como você avalia a qualidade do trabalho?", "type": "rating"}]',
   '[{"questionId": "q1", "rating": 5}, {"questionId": "q2", "rating": 5}]',
   NULL),
  ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000402', 'self_assessment_done',
   '[{"id": "q1", "question": "Como você avalia o cumprimento de metas?", "type": "rating"}, {"id": "q2", "question": "Como você avalia a qualidade do trabalho?", "type": "rating"}]',
   '[{"questionId": "q1", "rating": 4}, {"questionId": "q2", "rating": 4}]',
   NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir treinamentos demo
INSERT INTO public.treinamentos (id, nome_treinamento, employee_id, instituicao, carga_horaria, data_inicio, data_conclusao, status, owner_admin_id)
VALUES 
  ('00000000-0000-0000-0000-000000000a01', 'React Avançado (Demo)', '00000000-0000-0000-0000-000000000401', 'Udemy', 40, '2024-06-01', '2024-07-15', 'concluido', NULL),
  ('00000000-0000-0000-0000-000000000a02', 'TypeScript Masterclass (Demo)', '00000000-0000-0000-0000-000000000401', 'Alura', 20, '2024-08-01', '2024-08-20', 'concluido', NULL),
  ('00000000-0000-0000-0000-000000000a03', 'Clean Architecture (Demo)', '00000000-0000-0000-0000-000000000402', 'Coursera', 30, '2024-09-01', null, 'em_andamento', NULL),
  ('00000000-0000-0000-0000-000000000a04', 'People Analytics (Demo)', '00000000-0000-0000-0000-000000000404', 'FGV', 60, '2024-10-01', '2024-11-30', 'concluido', NULL)
ON CONFLICT (id) DO NOTHING;

-- Atualizar RLS para permitir que admins sem dados próprios vejam dados demo (owner_admin_id IS NULL)
-- Modificar a política de employees para incluir dados demo quando o admin não tem dados próprios
DROP POLICY IF EXISTS "Admins podem ver seus próprios dados" ON public.employees;

CREATE POLICY "Admins podem ver seus próprios dados"
ON public.employees
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    -- Pode ver seus próprios dados
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    -- OU pode ver dados demo (owner_admin_id IS NULL e chave_empresa DEMO) se não tiver dados próprios
    OR (
      owner_admin_id IS NULL
      AND chave_empresa LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar política para empresas
DROP POLICY IF EXISTS "Admins podem ver suas empresas" ON public.empresas;

CREATE POLICY "Admins podem ver suas empresas"
ON public.empresas
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND codempresa LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar política para cargos
DROP POLICY IF EXISTS "Admins podem ver seus cargos" ON public.cargos;

CREATE POLICY "Admins podem ver seus cargos"
ON public.cargos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND codigocargo LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);

-- Atualizar política para centros de custo
DROP POLICY IF EXISTS "Admins podem ver seus centros de custo" ON public.centrodecustos;

CREATE POLICY "Admins podem ver seus centros de custo"
ON public.centrodecustos
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    owner_admin_id = auth.uid() 
    OR owner_admin_id = get_owner_admin_id(auth.uid())
    OR (
      owner_admin_id IS NULL
      AND codcentrodecustos LIKE 'DEMO%'
      AND NOT EXISTS (
        SELECT 1 FROM public.employees e2 
        WHERE e2.owner_admin_id = auth.uid()
        LIMIT 1
      )
    )
  )
);