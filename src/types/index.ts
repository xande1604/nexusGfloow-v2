export interface ProgressHistoryEntry {
  date: string;
  percentage: number;
  achievementsCount: number;
  note?: string;
}

export interface JobRole {
  id: string;
  title: string;
  level: 'Estagiário' | 'Trainee' | 'Júnior' | 'Pleno' | 'Sênior' | 'Master' | 'Especialista' | 'Tech Lead' | 'Coordenador' | 'Gerente' | 'Diretor' | 'C-Level';
  salaryRange: { min: number; max: number };
  description: string;
  department: string;
  requiredSkillIds: string[];
  technicalKnowledge?: string;
  hardSkills?: string;
  softSkills?: string;
  keyDeliverables?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft Skill' | 'Language' | 'Leadership';
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  roleId: string;
  email: string;
  admissionDate: string;
  customNotes?: string;
  gestorId?: string;
}

export interface CompanyContext {
  mission: string;
  vision: string;
  values: string[];
}

export interface RoadmapStep {
  title: string;
  description: string;
  estimatedDuration: string;
  requiredSkills: string[];
}

export interface RoadmapAchievement {
  title: string;
  description: string;
  type: 'skill' | 'training' | 'milestone';
}

export interface RoadmapGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface RoadmapProgress {
  currentStepIndex: number;
  progressPercentage: number;
  completedSteps: number[];
  achievements: RoadmapAchievement[];
  gaps: RoadmapGap[];
  nextActions: string[];
  summary: string;
  lastUpdated: string;
  updateHistory: {
    date: string;
    acquiredSkills: string[];
    completedTrainings: { name: string; date: string; institution?: string }[];
    additionalNotes?: string;
  }[];
  history?: ProgressHistoryEntry[];
}

export interface CareerRoadmap {
  id: string;
  employeeId?: string;
  employeeName?: string;
  sourceRoleTitle: string;
  targetRoleTitle: string;
  steps: RoadmapStep[];
  createdAt: string;
  progress?: RoadmapProgress;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ROLES = 'ROLES',
  SKILLS = 'SKILLS',
  EMPLOYEES = 'EMPLOYEES',
  COST_CENTERS = 'COST_CENTERS',
  ROADMAP = 'ROADMAP',
  PERFORMANCE = 'PERFORMANCE',
  TUTORIALS = 'TUTORIALS',
  SETTINGS = 'SETTINGS'
}

export interface CostCenter {
  id: string;
  codcentrodecustos: string;
  nomecentrodecustos: string;
  codempresa: string;
}
