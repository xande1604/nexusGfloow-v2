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
import { AppView, CompanyContext } from '@/types';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useSkills } from '@/hooks/useSkills';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const initialContext: CompanyContext = {
  mission: 'Transformar a gestão de talentos através de tecnologia e inteligência artificial.',
  vision: 'Ser a plataforma líder em desenvolvimento de carreira na América Latina.',
  values: ['Inovação', 'Transparência', 'Desenvolvimento Contínuo', 'Colaboração'],
};

const Index = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [companyContext, setCompanyContext] = useState<CompanyContext>(initialContext);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Supabase hooks
  const { roles, loading: rolesLoading, saveRole, deleteRole } = useJobRoles();
  const { skills, loading: skillsLoading, saveSkill, deleteSkill } = useSkills();
  const { roadmaps, loading: roadmapsLoading, saveRoadmap } = useRoadmaps();
  const { employees, loading: employeesLoading } = useEmployees();

  const handleGenerateRoadmap = async (sourceRole: string, targetRole: string, employeeName?: string) => {
    setIsGeneratingRoadmap(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { sourceRole, targetRole, employeeName }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      await saveRoadmap({
        sourceRoleTitle: sourceRole,
        targetRoleTitle: targetRole,
        employeeName,
        steps: data.steps,
      });

      toast({
        title: 'Roadmap gerado com sucesso!',
        description: `${data.steps?.length || 0} etapas criadas para a trajetória de carreira.`,
      });
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast({
        title: 'Erro ao gerar roadmap',
        description: error.message || 'Não foi possível gerar o roadmap com IA.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingRoadmap(false);
    }
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

  const isLoading = rolesLoading || skillsLoading || roadmapsLoading || employeesLoading;

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
