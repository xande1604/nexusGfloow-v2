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

export interface CareerRoadmap {
  id: string;
  employeeId?: string;
  employeeName?: string;
  sourceRoleTitle: string;
  targetRoleTitle: string;
  steps: RoadmapStep[];
  createdAt: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ROLES = 'ROLES',
  SKILLS = 'SKILLS',
  ROADMAP = 'ROADMAP',
  PERFORMANCE = 'PERFORMANCE',
  SETTINGS = 'SETTINGS'
}
