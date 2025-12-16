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
import { CostCentersView } from '@/components/cost-centers/CostCentersView';
import { EmployeesView } from '@/components/employees/EmployeesView';
import { TutorialsView } from '@/components/tutorials/TutorialsView';
import { NoAccessMessage } from '@/components/NoAccessMessage';
import { AppView, CompanyContext } from '@/types';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useSkills } from '@/hooks/useSkills';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
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
  const { hasAccess, loading: roleLoading } = useUserRole();
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
  const { roadmaps, loading: roadmapsLoading, saveRoadmap, updateRoadmapProgress } = useRoadmaps();
  const { employees, loading: employeesLoading, updateEmployeeEmail, updateEmployeeGestor } = useEmployees();

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

  const handleUpdateRoadmapProgress = async (
    roadmapId: string, 
    employeeId: string | undefined, 
    data: { acquiredSkills: string[]; completedTrainings: { name: string; date: string; institution?: string }[]; additionalNotes?: string },
    roadmap: { steps: any[]; sourceRoleTitle: string; targetRoleTitle: string }
  ) => {
    await updateRoadmapProgress(
      roadmapId,
      employeeId,
      data.acquiredSkills,
      data.completedTrainings,
      data.additionalNotes,
      roadmap.steps,
      roadmap.sourceRoleTitle,
      roadmap.targetRoleTitle
    );
  };

  // Show loading while checking auth or role
  if (authLoading || roleLoading) {
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

  // Show no access message if user doesn't have a role
  if (!hasAccess) {
    return <NoAccessMessage />;
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
        return <SkillsView skills={skills} roles={roles} onSaveSkill={saveSkill} onDeleteSkill={deleteSkill} />;
      case AppView.EMPLOYEES:
        return <EmployeesView employees={employees} roles={roles} onUpdateEmail={updateEmployeeEmail} onUpdateGestor={updateEmployeeGestor} />;
      case AppView.ROADMAP:
        return <RoadmapView roles={roles} employees={employees} roadmaps={roadmaps} skills={skills} onGenerateRoadmap={handleGenerateRoadmap} onUpdateProgress={handleUpdateRoadmapProgress} />;
      case AppView.PERFORMANCE:
        return <PerformanceView employees={employees} roles={roles} />;
      case AppView.COST_CENTERS:
        return <CostCentersView />;
      case AppView.TUTORIALS:
        return <TutorialsView />;
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
