// Static demo data for users without access key
import { JobRole, Skill, Employee, CareerRoadmap } from '@/types';
import { CostCenterWithCount } from '@/hooks/useCostCenters';

export const demoEmployees: Employee[] = [
  {
    id: 'demo-1',
    name: 'Maria Silva',
    email: 'maria.silva@demo.com',
    roleId: 'cargo-1',
    admissionDate: '2022-03-15',
  },
  {
    id: 'demo-2',
    name: 'João Santos',
    email: 'joao.santos@demo.com',
    roleId: 'cargo-2',
    admissionDate: '2023-01-10',
  },
  {
    id: 'demo-3',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@demo.com',
    roleId: 'cargo-3',
    admissionDate: '2021-06-20',
  },
  {
    id: 'demo-4',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@demo.com',
    roleId: 'cargo-4',
    admissionDate: '2020-11-05',
  },
  {
    id: 'demo-5',
    name: 'Lucia Mendes',
    email: 'lucia.mendes@demo.com',
    roleId: 'cargo-5',
    admissionDate: '2019-08-12',
  },
];

export const demoCargos: JobRole[] = [
  {
    id: 'cargo-1',
    title: 'Desenvolvedor Sênior',
    level: 'Sênior',
    salaryRange: { min: 12000, max: 18000 },
    description: 'Responsável pelo desenvolvimento de aplicações complexas',
    department: 'Tecnologia',
    requiredSkillIds: ['skill-1', 'skill-2'],
    hardSkills: 'React, TypeScript, Node.js, PostgreSQL',
    softSkills: 'Liderança técnica, Mentoria, Comunicação',
  },
  {
    id: 'cargo-2',
    title: 'Desenvolvedor Pleno',
    level: 'Pleno',
    salaryRange: { min: 7000, max: 12000 },
    description: 'Desenvolvimento de features e manutenção de sistemas',
    department: 'Tecnologia',
    requiredSkillIds: ['skill-1'],
    hardSkills: 'React, JavaScript, APIs REST',
    softSkills: 'Trabalho em equipe, Proatividade',
  },
  {
    id: 'cargo-3',
    title: 'Product Manager Sênior',
    level: 'Sênior',
    salaryRange: { min: 15000, max: 22000 },
    description: 'Gestão de produtos digitais e roadmap estratégico',
    department: 'Produto',
    requiredSkillIds: ['skill-5'],
    hardSkills: 'Gestão de produto, Métricas, Roadmap',
    softSkills: 'Visão estratégica, Negociação, Liderança',
  },
  {
    id: 'cargo-4',
    title: 'Analista de RH Pleno',
    level: 'Pleno',
    salaryRange: { min: 5000, max: 8000 },
    description: 'Gestão de processos de RH e desenvolvimento humano',
    department: 'Recursos Humanos',
    requiredSkillIds: ['skill-4'],
    hardSkills: 'Recrutamento, Treinamento, Legislação trabalhista',
    softSkills: 'Empatia, Organização, Comunicação',
  },
  {
    id: 'cargo-5',
    title: 'Analista Financeiro Sênior',
    level: 'Sênior',
    salaryRange: { min: 10000, max: 15000 },
    description: 'Análise financeira e planejamento orçamentário',
    department: 'Financeiro',
    requiredSkillIds: ['skill-6'],
    hardSkills: 'Contabilidade, Excel avançado, FP&A',
    softSkills: 'Análise crítica, Atenção a detalhes',
  },
];

export const demoSkills: Skill[] = [
  // Technical
  { id: 'skill-1', name: 'React', category: 'Technical', description: 'Biblioteca JavaScript para interfaces' },
  { id: 'skill-2', name: 'TypeScript', category: 'Technical', description: 'Superset tipado de JavaScript' },
  { id: 'skill-5', name: 'Gestão de Projetos', category: 'Technical', description: 'Planejamento e execução de projetos' },
  { id: 'skill-6', name: 'SQL', category: 'Technical', description: 'Linguagem de consulta a bancos de dados' },
  { id: 'skill-9', name: 'Python', category: 'Technical', description: 'Linguagem de programação versátil' },
  { id: 'skill-10', name: 'Node.js', category: 'Technical', description: 'Runtime JavaScript server-side' },
  { id: 'skill-11', name: 'Git', category: 'Technical', description: 'Controle de versão de código' },
  { id: 'skill-12', name: 'Docker', category: 'Technical', description: 'Containerização de aplicações' },
  // Soft Skills
  { id: 'skill-4', name: 'Comunicação', category: 'Soft Skill', description: 'Expressar ideias com clareza' },
  { id: 'skill-7', name: 'Trabalho em Equipe', category: 'Soft Skill', description: 'Colaboração efetiva com colegas' },
  { id: 'skill-8', name: 'Resolução de Problemas', category: 'Soft Skill', description: 'Análise e solução de desafios complexos' },
  { id: 'skill-13', name: 'Pensamento Crítico', category: 'Soft Skill', description: 'Avaliar informações de forma objetiva' },
  { id: 'skill-14', name: 'Adaptabilidade', category: 'Soft Skill', description: 'Flexibilidade para mudanças' },
  // Leadership
  { id: 'skill-3', name: 'Liderança', category: 'Leadership', description: 'Capacidade de guiar e inspirar equipes' },
  { id: 'skill-15', name: 'Gestão de Pessoas', category: 'Leadership', description: 'Desenvolver e motivar colaboradores' },
  { id: 'skill-16', name: 'Tomada de Decisão', category: 'Leadership', description: 'Escolher a melhor ação estratégica' },
  { id: 'skill-17', name: 'Delegação', category: 'Leadership', description: 'Distribuir tarefas eficientemente' },
  // Languages
  { id: 'skill-18', name: 'Inglês Avançado', category: 'Language', description: 'Fluência em comunicação profissional' },
  { id: 'skill-19', name: 'Espanhol Intermediário', category: 'Language', description: 'Comunicação básica em espanhol' },
  { id: 'skill-20', name: 'Inglês Técnico', category: 'Language', description: 'Leitura de documentação técnica' },
];

export const demoRoadmaps: CareerRoadmap[] = [
  {
    id: 'roadmap-demo-1',
    employeeId: 'demo-2',
    employeeName: 'João Santos',
    sourceRoleTitle: 'Desenvolvedor Pleno',
    targetRoleTitle: 'Desenvolvedor Sênior',
    createdAt: '2024-10-15T10:00:00Z',
    steps: [
      {
        title: 'Dominar arquitetura de software',
        description: 'Aprofundar conhecimentos em padrões de arquitetura como Clean Architecture, DDD e microsserviços.',
        estimatedDuration: '3 meses',
        requiredSkills: ['Clean Architecture', 'Design Patterns', 'Microsserviços'],
      },
      {
        title: 'Liderança técnica',
        description: 'Desenvolver habilidades de mentoria, code review e tomada de decisão técnica.',
        estimatedDuration: '4 meses',
        requiredSkills: ['Mentoria', 'Code Review', 'Comunicação'],
      },
      {
        title: 'Especialização em performance',
        description: 'Otimização de aplicações, monitoramento e resolução de gargalos.',
        estimatedDuration: '2 meses',
        requiredSkills: ['Performance', 'Profiling', 'Caching'],
      },
      {
        title: 'DevOps e infraestrutura',
        description: 'Compreender CI/CD, containers e cloud para autonomia completa.',
        estimatedDuration: '3 meses',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS/GCP'],
      },
    ],
    progress: {
      currentStepIndex: 1,
      progressPercentage: 35,
      completedSteps: [0],
      achievements: [
        { title: 'Arquitetura Dominada', description: 'Completou o estudo de Clean Architecture', type: 'milestone' },
        { title: 'Primeiro Mentoria', description: 'Realizou primeira sessão de mentoria com estagiário', type: 'skill' },
      ],
      gaps: [
        { skill: 'Kubernetes', priority: 'medium', recommendation: 'Fazer curso certificado de Kubernetes' },
        { skill: 'Comunicação executiva', priority: 'low', recommendation: 'Praticar apresentações para stakeholders' },
      ],
      nextActions: [
        'Liderar próximo code review da squad',
        'Apresentar proposta de arquitetura para novo módulo',
        'Iniciar estudo de Docker avançado',
      ],
      summary: 'João está progredindo bem na trilha para Sênior, com destaque em arquitetura. Próximo foco: liderança técnica.',
      lastUpdated: '2024-11-20T14:30:00Z',
      updateHistory: [
        {
          date: '2024-11-20T14:30:00Z',
          acquiredSkills: ['Clean Architecture', 'Design Patterns'],
          completedTrainings: [
            { name: 'Clean Architecture na Prática', date: '2024-11-10', institution: 'Udemy' },
          ],
        },
      ],
      history: [
        { date: '2024-10-20', percentage: 10, achievementsCount: 0 },
        { date: '2024-11-05', percentage: 20, achievementsCount: 1 },
        { date: '2024-11-20', percentage: 35, achievementsCount: 2 },
      ],
    },
  },
  {
    id: 'roadmap-demo-2',
    employeeId: 'demo-4',
    employeeName: 'Carlos Ferreira',
    sourceRoleTitle: 'Analista de RH Pleno',
    targetRoleTitle: 'Coordenador de RH',
    createdAt: '2024-09-01T09:00:00Z',
    steps: [
      {
        title: 'Gestão de equipes',
        description: 'Desenvolver competências de liderança e gestão de pessoas.',
        estimatedDuration: '4 meses',
        requiredSkills: ['Liderança', 'Feedback', 'Gestão de conflitos'],
      },
      {
        title: 'Indicadores e métricas de RH',
        description: 'Dominar KPIs de RH, turnover, clima organizacional e people analytics.',
        estimatedDuration: '3 meses',
        requiredSkills: ['People Analytics', 'Excel avançado', 'Power BI'],
      },
      {
        title: 'Legislação trabalhista avançada',
        description: 'Aprofundar conhecimento em legislação e compliance trabalhista.',
        estimatedDuration: '2 meses',
        requiredSkills: ['CLT', 'Compliance', 'Auditoria'],
      },
      {
        title: 'Planejamento estratégico de RH',
        description: 'Desenvolver visão estratégica e alinhamento com objetivos organizacionais.',
        estimatedDuration: '3 meses',
        requiredSkills: ['Planejamento estratégico', 'OKRs', 'Business Partner'],
      },
    ],
    progress: {
      currentStepIndex: 2,
      progressPercentage: 60,
      completedSteps: [0, 1],
      achievements: [
        { title: 'Líder de Projeto', description: 'Liderou projeto de clima organizacional', type: 'milestone' },
        { title: 'Dashboard de RH', description: 'Criou primeiro dashboard de indicadores', type: 'skill' },
        { title: 'Certificação People Analytics', description: 'Obteve certificação em People Analytics', type: 'training' },
      ],
      gaps: [
        { skill: 'Legislação internacional', priority: 'low', recommendation: 'Estudar legislação para expansão internacional' },
      ],
      nextActions: [
        'Participar de workshop de legislação trabalhista',
        'Apresentar análise de turnover para diretoria',
        'Acompanhar processo de auditoria trabalhista',
      ],
      summary: 'Carlos demonstra excelente evolução, especialmente em analytics. Foco atual: aprofundar legislação.',
      lastUpdated: '2024-12-01T11:00:00Z',
      updateHistory: [
        {
          date: '2024-10-15T10:00:00Z',
          acquiredSkills: ['Liderança', 'Gestão de conflitos'],
          completedTrainings: [
            { name: 'Liderança para RH', date: '2024-10-10', institution: 'FGV' },
          ],
        },
        {
          date: '2024-12-01T11:00:00Z',
          acquiredSkills: ['People Analytics', 'Power BI'],
          completedTrainings: [
            { name: 'People Analytics Fundamentals', date: '2024-11-25', institution: 'Coursera' },
          ],
        },
      ],
      history: [
        { date: '2024-09-15', percentage: 10, achievementsCount: 0 },
        { date: '2024-10-15', percentage: 30, achievementsCount: 1 },
        { date: '2024-11-15', percentage: 45, achievementsCount: 2 },
        { date: '2024-12-01', percentage: 60, achievementsCount: 3 },
      ],
    },
  },
  {
    id: 'roadmap-demo-3',
    employeeName: 'Ana Oliveira',
    sourceRoleTitle: 'Product Manager Sênior',
    targetRoleTitle: 'Head de Produto',
    createdAt: '2024-11-01T08:00:00Z',
    steps: [
      {
        title: 'Visão de portfólio de produtos',
        description: 'Desenvolver capacidade de gerenciar múltiplos produtos simultaneamente.',
        estimatedDuration: '4 meses',
        requiredSkills: ['Gestão de portfólio', 'Priorização estratégica', 'Roadmap'],
      },
      {
        title: 'Liderança de times de produto',
        description: 'Gerenciar e desenvolver outros PMs e times de produto.',
        estimatedDuration: '5 meses',
        requiredSkills: ['Gestão de PMs', 'Coaching', 'Desenvolvimento de carreira'],
      },
      {
        title: 'Estratégia de negócio',
        description: 'Alinhar produto com estratégia de negócio e resultados financeiros.',
        estimatedDuration: '3 meses',
        requiredSkills: ['Business Strategy', 'P&L', 'Unit Economics'],
      },
    ],
    progress: {
      currentStepIndex: 0,
      progressPercentage: 15,
      completedSteps: [],
      achievements: [
        { title: 'Mentora de PM Jr', description: 'Iniciou programa de mentoria', type: 'skill' },
      ],
      gaps: [
        { skill: 'Gestão financeira', priority: 'high', recommendation: 'Curso de finanças para não-financeiros' },
        { skill: 'Apresentação executiva', priority: 'medium', recommendation: 'Treinar apresentações para C-level' },
      ],
      nextActions: [
        'Participar de reunião de planejamento estratégico',
        'Fazer curso de Unit Economics',
        'Shadowing com atual Head de Produto',
      ],
      summary: 'Ana está no início da jornada para Head. Próximo foco: desenvolver visão de portfólio.',
      lastUpdated: '2024-11-15T16:00:00Z',
      updateHistory: [],
      history: [
        { date: '2024-11-05', percentage: 5, achievementsCount: 0 },
        { date: '2024-11-15', percentage: 15, achievementsCount: 1 },
      ],
    },
  },
];


export const demoPerformanceReviews = [
  {
    id: 'review-demo-1',
    employeeId: 'demo-1',
    employeeName: 'Maria Silva',
    date: '2024-11-15',
    status: 'Completed' as const,
    questions: [
      { id: 'q1', question: 'Como você avalia o cumprimento de metas e objetivos?', type: 'rating' as const },
      { id: 'q2', question: 'Como você avalia a qualidade do trabalho entregue?', type: 'rating' as const },
      { id: 'q3', question: 'Como você avalia a colaboração e trabalho em equipe?', type: 'rating' as const },
      { id: 'q4', question: 'Como você avalia a comunicação e proatividade?', type: 'rating' as const },
      { id: 'q5', question: 'Quais foram os principais pontos fortes demonstrados?', type: 'text' as const },
      { id: 'q6', question: 'Quais áreas precisam de desenvolvimento?', type: 'text' as const },
    ],
    responses: [
      { questionId: 'q1', rating: 5 },
      { questionId: 'q2', rating: 5 },
      { questionId: 'q3', rating: 4 },
      { questionId: 'q4', rating: 4 },
      { questionId: 'q5', text: 'Excelente capacidade técnica, liderança natural, resolução de problemas complexos.' },
      { questionId: 'q6', text: 'Pode melhorar na delegação de tarefas e documentação.' },
    ],
    overallFeedback: 'Maria continua sendo uma referência técnica para a equipe. Recomendado para promoção.',
    createdAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'review-demo-2',
    employeeId: 'demo-2',
    employeeName: 'João Santos',
    date: '2024-11-20',
    status: 'Completed' as const,
    questions: [
      { id: 'q1', question: 'Como você avalia o cumprimento de metas e objetivos?', type: 'rating' as const },
      { id: 'q2', question: 'Como você avalia a qualidade do trabalho entregue?', type: 'rating' as const },
      { id: 'q3', question: 'Como você avalia a colaboração e trabalho em equipe?', type: 'rating' as const },
      { id: 'q4', question: 'Como você avalia a comunicação e proatividade?', type: 'rating' as const },
      { id: 'q5', question: 'Quais foram os principais pontos fortes demonstrados?', type: 'text' as const },
      { id: 'q6', question: 'Quais áreas precisam de desenvolvimento?', type: 'text' as const },
    ],
    responses: [
      { questionId: 'q1', rating: 4 },
      { questionId: 'q2', rating: 4 },
      { questionId: 'q3', rating: 5 },
      { questionId: 'q4', rating: 4 },
      { questionId: 'q5', text: 'Ótimo trabalho em equipe, rápida evolução técnica, comprometimento.' },
      { questionId: 'q6', text: 'Aprofundar conhecimentos em arquitetura de software.' },
    ],
    overallFeedback: 'João está evoluindo bem e demonstra potencial para assumir mais responsabilidades.',
    createdAt: '2024-11-20T14:00:00Z',
  },
  {
    id: 'review-demo-3',
    employeeId: 'demo-4',
    employeeName: 'Carlos Ferreira',
    date: '2024-12-01',
    status: 'PendingManager' as const,
    questions: [
      { id: 'q1', question: 'Como você avalia o cumprimento de metas e objetivos?', type: 'rating' as const },
      { id: 'q2', question: 'Como você avalia a qualidade do trabalho entregue?', type: 'rating' as const },
      { id: 'q3', question: 'Como você avalia a colaboração e trabalho em equipe?', type: 'rating' as const },
      { id: 'q4', question: 'Como você avalia a comunicação e proatividade?', type: 'rating' as const },
      { id: 'q5', question: 'Quais foram os principais pontos fortes demonstrados?', type: 'text' as const },
      { id: 'q6', question: 'Quais áreas precisam de desenvolvimento?', type: 'text' as const },
    ],
    responses: [
      { questionId: 'q1', rating: 4 },
      { questionId: 'q2', rating: 5 },
      { questionId: 'q3', rating: 4 },
      { questionId: 'q4', rating: 4 },
      { questionId: 'q5', text: 'Organização, conhecimento de processos, relacionamento interpessoal.' },
      { questionId: 'q6', text: 'Desenvolver visão estratégica e conhecimento de people analytics.' },
    ],
    overallFeedback: null,
    createdAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'review-demo-4',
    employeeId: 'demo-3',
    employeeName: 'Ana Oliveira',
    date: '2024-12-05',
    status: 'PendingSelf' as const,
    questions: [
      { id: 'q1', question: 'Como você avalia o cumprimento de metas e objetivos?', type: 'rating' as const },
      { id: 'q2', question: 'Como você avalia a qualidade do trabalho entregue?', type: 'rating' as const },
      { id: 'q3', question: 'Como você avalia a colaboração e trabalho em equipe?', type: 'rating' as const },
      { id: 'q4', question: 'Como você avalia a comunicação e proatividade?', type: 'rating' as const },
      { id: 'q5', question: 'Quais foram os principais pontos fortes demonstrados?', type: 'text' as const },
      { id: 'q6', question: 'Quais áreas precisam de desenvolvimento?', type: 'text' as const },
    ],
    responses: [],
    overallFeedback: null,
    createdAt: '2024-12-05T08:00:00Z',
  },
];

export const demoEvaluationCycles = [
  {
    id: 'cycle-demo-1',
    title: 'Avaliação Anual 2024',
    description: 'Ciclo de avaliação de desempenho do ano de 2024',
    start_date: '2024-11-01',
    end_date: '2024-12-15',
    status: 'active' as const,
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: 'cycle-demo-2',
    title: 'Avaliação Semestral 2024/1',
    description: 'Primeira avaliação semestral de 2024',
    start_date: '2024-06-01',
    end_date: '2024-06-30',
    status: 'closed' as const,
    created_at: '2024-06-01T00:00:00Z',
  },
];

export const demoEvaluations = [
  {
    id: 'eval-demo-1',
    cycle_id: 'cycle-demo-1',
    employee_id: 'demo-1',
    status: 'completed' as const,
    questions: [
      { id: 'eq1', question: 'Quais foram suas maiores realizações neste período?', category: 'Resultados', type: 'text' },
      { id: 'eq2', question: 'Quais desafios você enfrentou?', category: 'Desafios', type: 'text' },
      { id: 'eq3', question: 'Como você avalia sua colaboração com a equipe?', category: 'Trabalho em Equipe', type: 'rating' },
    ],
    self_assessment_responses: [
      { questionId: 'eq1', response: 'Liderei a migração do sistema legado e reduzi bugs em 40%.' },
      { questionId: 'eq2', response: 'Integração com sistemas externos e gestão de prazos apertados.' },
      { questionId: 'eq3', rating: 5 },
    ],
    manager_evaluation_responses: [
      { questionId: 'eq1', response: 'Excelente liderança técnica na migração.' },
      { questionId: 'eq2', response: 'Superou desafios com maturidade.' },
      { questionId: 'eq3', rating: 5 },
    ],
    manager_feedback: 'Maria é uma profissional excepcional, pronta para novos desafios.',
    self_assessment_completed_at: '2024-11-10T14:00:00Z',
    manager_evaluation_completed_at: '2024-11-15T16:00:00Z',
    employee: {
      id: 'demo-1',
      nome: 'Maria Silva',
      name: 'Maria Silva',
      email: 'maria.silva@demo.com',
    },
  },
  {
    id: 'eval-demo-2',
    cycle_id: 'cycle-demo-1',
    employee_id: 'demo-2',
    status: 'self_assessment_done' as const,
    questions: [
      { id: 'eq1', question: 'Quais foram suas maiores realizações neste período?', category: 'Resultados', type: 'text' },
      { id: 'eq2', question: 'Quais desafios você enfrentou?', category: 'Desafios', type: 'text' },
      { id: 'eq3', question: 'Como você avalia sua colaboração com a equipe?', category: 'Trabalho em Equipe', type: 'rating' },
    ],
    self_assessment_responses: [
      { questionId: 'eq1', response: 'Implementei 3 features principais e melhorei cobertura de testes.' },
      { questionId: 'eq2', response: 'Adaptação a novas tecnologias e gestão de múltiplas demandas.' },
      { questionId: 'eq3', rating: 4 },
    ],
    manager_evaluation_responses: null,
    manager_feedback: null,
    self_assessment_completed_at: '2024-11-18T11:00:00Z',
    manager_evaluation_completed_at: null,
    employee: {
      id: 'demo-2',
      nome: 'João Santos',
      name: 'João Santos',
      email: 'joao.santos@demo.com',
    },
  },
  {
    id: 'eval-demo-3',
    cycle_id: 'cycle-demo-1',
    employee_id: 'demo-4',
    status: 'pending' as const,
    questions: [
      { id: 'eq1', question: 'Quais foram suas maiores realizações neste período?', category: 'Resultados', type: 'text' },
      { id: 'eq2', question: 'Quais desafios você enfrentou?', category: 'Desafios', type: 'text' },
      { id: 'eq3', question: 'Como você avalia sua colaboração com a equipe?', category: 'Trabalho em Equipe', type: 'rating' },
    ],
    self_assessment_responses: null,
    manager_evaluation_responses: null,
    manager_feedback: null,
    self_assessment_completed_at: null,
    manager_evaluation_completed_at: null,
    employee: {
      id: 'demo-4',
      nome: 'Carlos Ferreira',
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@demo.com',
    },
  },
];

export const demoStats = {
  totalEmployees: 5,
  totalRoles: 5,
  totalSkills: 8,
  totalCostCenters: 4,
  avgSalary: 11400,
  pendingReviews: 2,
};

export const demoEmpresas = [
  {
    id: 'empresa-1',
    codempresa: 'EMP001',
    nomeempresa: 'Tech Solutions Ltda',
    cnae: '6201-5/00',
    grau_risco: 1,
    percentual_encargos: 80,
  },
  {
    id: 'empresa-2',
    codempresa: 'EMP002',
    nomeempresa: 'Consultoria ABC',
    cnae: '7020-4/00',
    grau_risco: 1,
    percentual_encargos: 75,
  },
];

export const demoCostCenters: CostCenterWithCount[] = [
  {
    id: 'cc-1',
    codcentrodecustos: 'CC001',
    nomecentrodecustos: 'Desenvolvimento de Software',
    codempresa: 'EMP001',
    employeeCount: 3,
  },
  {
    id: 'cc-2',
    codcentrodecustos: 'CC002',
    nomecentrodecustos: 'Recursos Humanos',
    codempresa: 'EMP001',
    employeeCount: 1,
  },
  {
    id: 'cc-3',
    codcentrodecustos: 'CC003',
    nomecentrodecustos: 'Comercial e Vendas',
    codempresa: 'EMP002',
    employeeCount: 1,
  },
  {
    id: 'cc-4',
    codcentrodecustos: 'CC004',
    nomecentrodecustos: 'Administrativo',
    codempresa: 'EMP002',
    employeeCount: 0,
  },
];
