import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { RolesView } from '@/components/roles/RolesView';
import { SkillsView } from '@/components/skills/SkillsView';
import { RoadmapView } from '@/components/roadmap/RoadmapView';
import { SettingsView } from '@/components/settings/SettingsView';
import { PerformanceView } from '@/components/performance/PerformanceView';
import { AppView, Employee, CompanyContext, CareerRoadmap } from '@/types';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useSkills } from '@/hooks/useSkills';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Demo employees (will be connected to Supabase later)
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
  const [employees] = useState<Employee[]>(initialEmployees);
  const [companyContext, setCompanyContext] = useState<CompanyContext>(initialContext);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Supabase hooks
  const { roles, loading: rolesLoading, saveRole, deleteRole } = useJobRoles();
  const { skills, loading: skillsLoading, saveSkill, deleteSkill } = useSkills();

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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const isLoading = rolesLoading || skillsLoading;

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      );
    }

    switch (activeView) {
      case AppView.DASHBOARD:
        return <DashboardView roles={roles} skills={skills} employees={employees} />;
      case AppView.ROLES:
        return <RolesView roles={roles} skills={skills} onSaveRole={saveRole} onDeleteRole={deleteRole} />;
      case AppView.SKILLS:
        return <SkillsView skills={skills} onSaveSkill={saveSkill} onDeleteSkill={deleteSkill} />;
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
