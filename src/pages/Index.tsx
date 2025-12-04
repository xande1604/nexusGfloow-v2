import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { RolesView } from '@/components/roles/RolesView';
import { SkillsView } from '@/components/skills/SkillsView';
import { RoadmapView } from '@/components/roadmap/RoadmapView';
import { SettingsView } from '@/components/settings/SettingsView';
import { PerformanceView } from '@/components/performance/PerformanceView';
import { AppView, JobRole, Skill, Employee, CompanyContext, CareerRoadmap } from '@/types';

// Initial demo data
const initialRoles: JobRole[] = [
  { id: '1', title: 'Desenvolvedor Full Stack', level: 'Pleno', department: 'Tecnologia', salaryRange: { min: 8000, max: 12000 }, description: 'Desenvolvimento de aplicações web modernas', requiredSkillIds: ['1', '2', '3'] },
  { id: '2', title: 'Product Designer', level: 'Sênior', department: 'Design', salaryRange: { min: 10000, max: 15000 }, description: 'Design de produtos digitais e experiência do usuário', requiredSkillIds: ['4', '5'] },
  { id: '3', title: 'Tech Lead', level: 'Tech Lead', department: 'Tecnologia', salaryRange: { min: 15000, max: 22000 }, description: 'Liderança técnica de squads de desenvolvimento', requiredSkillIds: ['1', '2', '6', '7'] },
  { id: '4', title: 'Product Manager', level: 'Pleno', department: 'Produto', salaryRange: { min: 12000, max: 18000 }, description: 'Gestão de roadmap e estratégia de produto', requiredSkillIds: ['8', '9'] },
  { id: '5', title: 'Analista de Dados', level: 'Júnior', department: 'Tecnologia', salaryRange: { min: 5000, max: 8000 }, description: 'Análise e visualização de dados de negócio', requiredSkillIds: ['10', '11'] },
];

const initialSkills: Skill[] = [
  { id: '1', name: 'React', category: 'Technical' },
  { id: '2', name: 'TypeScript', category: 'Technical' },
  { id: '3', name: 'Node.js', category: 'Technical' },
  { id: '4', name: 'Figma', category: 'Technical' },
  { id: '5', name: 'Design Thinking', category: 'Technical' },
  { id: '6', name: 'Liderança de Equipes', category: 'Leadership' },
  { id: '7', name: 'Mentoring', category: 'Leadership' },
  { id: '8', name: 'Comunicação', category: 'Soft Skill' },
  { id: '9', name: 'Gestão de Stakeholders', category: 'Soft Skill' },
  { id: '10', name: 'SQL', category: 'Technical' },
  { id: '11', name: 'Python', category: 'Technical' },
  { id: '12', name: 'Inglês Fluente', category: 'Language' },
  { id: '13', name: 'Espanhol Intermediário', category: 'Language' },
  { id: '14', name: 'Resolução de Problemas', category: 'Soft Skill' },
  { id: '15', name: 'Trabalho em Equipe', category: 'Soft Skill' },
];

const initialEmployees: Employee[] = [
  { id: '1', name: 'Maria Silva', roleId: '2', email: 'maria@gfloow.com', admissionDate: '2023-03-15' },
  { id: '2', name: 'João Santos', roleId: '1', email: 'joao@gfloow.com', admissionDate: '2022-08-01' },
  { id: '3', name: 'Ana Costa', roleId: '4', email: 'ana@gfloow.com', admissionDate: '2023-06-20' },
];

const initialContext: CompanyContext = {
  mission: 'Transformar a gestão de talentos através de tecnologia e inteligência artificial.',
  vision: 'Ser a plataforma líder em desenvolvimento de carreira na América Latina.',
  values: ['Inovação', 'Transparência', 'Desenvolvimento Contínuo', 'Colaboração'],
};

const Index = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [roles, setRoles] = useState<JobRole[]>(initialRoles);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [employees] = useState<Employee[]>(initialEmployees);
  const [companyContext, setCompanyContext] = useState<CompanyContext>(initialContext);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);

  const handleSaveRole = (role: JobRole) => {
    setRoles(prev => {
      const exists = prev.find(r => r.id === role.id);
      if (exists) {
        return prev.map(r => r.id === role.id ? role : r);
      }
      return [...prev, role];
    });
  };

  const handleDeleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveSkill = (skill: Skill) => {
    setSkills(prev => {
      const exists = prev.find(s => s.id === skill.id);
      if (exists) {
        return prev.map(s => s.id === skill.id ? skill : s);
      }
      return [...prev, skill];
    });
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  const handleGenerateRoadmap = (sourceRole: string, targetRole: string, employeeName?: string) => {
    const newRoadmap: CareerRoadmap = {
      id: crypto.randomUUID(),
      sourceRoleTitle: sourceRole,
      targetRoleTitle: targetRole,
      employeeName,
      steps: [
        { title: 'Fase 1', description: 'Desenvolvimento inicial', estimatedDuration: '6 meses', requiredSkills: ['React', 'TypeScript'] },
        { title: 'Fase 2', description: 'Aprofundamento técnico', estimatedDuration: '12 meses', requiredSkills: ['Arquitetura', 'DevOps'] },
      ],
      createdAt: new Date().toISOString(),
    };
    setRoadmaps(prev => [...prev, newRoadmap]);
  };

  const renderView = () => {
    switch (activeView) {
      case AppView.DASHBOARD:
        return <DashboardView roles={roles} skills={skills} employees={employees} />;
      case AppView.ROLES:
        return <RolesView roles={roles} skills={skills} onSaveRole={handleSaveRole} onDeleteRole={handleDeleteRole} />;
      case AppView.SKILLS:
        return <SkillsView skills={skills} onSaveSkill={handleSaveSkill} onDeleteSkill={handleDeleteSkill} />;
      case AppView.ROADMAP:
        return <RoadmapView roles={roles} employees={employees} roadmaps={roadmaps} onGenerateRoadmap={handleGenerateRoadmap} />;
      case AppView.PERFORMANCE:
        return <PerformanceView employees={employees} roles={roles} />;
      case AppView.SETTINGS:
        return <SettingsView companyContext={companyContext} onSaveContext={setCompanyContext} />;
      default:
        return <DashboardView roles={roles} skills={skills} employees={employees} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="pl-64 transition-all duration-300">
        <Header activeView={activeView} />
        
        <main className="p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
