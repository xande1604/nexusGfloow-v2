// Static demo data for users without access key
import { JobRole, Skill, Employee } from '@/types';

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
  { id: 'skill-1', name: 'React', category: 'Technical', description: 'Biblioteca JavaScript para interfaces' },
  { id: 'skill-2', name: 'TypeScript', category: 'Technical', description: 'Superset tipado de JavaScript' },
  { id: 'skill-3', name: 'Liderança', category: 'Leadership', description: 'Capacidade de guiar e inspirar equipes' },
  { id: 'skill-4', name: 'Comunicação', category: 'Soft Skill', description: 'Expressar ideias com clareza' },
  { id: 'skill-5', name: 'Gestão de Projetos', category: 'Technical', description: 'Planejamento e execução de projetos' },
  { id: 'skill-6', name: 'SQL', category: 'Technical', description: 'Linguagem de consulta a bancos de dados' },
  { id: 'skill-7', name: 'Trabalho em Equipe', category: 'Soft Skill', description: 'Colaboração efetiva com colegas' },
  { id: 'skill-8', name: 'Resolução de Problemas', category: 'Soft Skill', description: 'Análise e solução de desafios complexos' },
];

export const demoCostCenters = [
  { id: 'cc-1', codcentrodecustos: 'TI-001', nomecentrodecustos: 'Tecnologia da Informação', employeeCount: 2 },
  { id: 'cc-2', codcentrodecustos: 'PROJ-001', nomecentrodecustos: 'Gestão de Projetos', employeeCount: 1 },
  { id: 'cc-3', codcentrodecustos: 'RH-001', nomecentrodecustos: 'Recursos Humanos', employeeCount: 1 },
  { id: 'cc-4', codcentrodecustos: 'FIN-001', nomecentrodecustos: 'Financeiro', employeeCount: 1 },
];

export const demoStats = {
  totalEmployees: 5,
  totalRoles: 5,
  totalSkills: 8,
  totalCostCenters: 4,
  avgSalary: 11400,
  pendingReviews: 2,
};
