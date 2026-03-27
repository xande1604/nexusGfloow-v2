import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { demoEmployees, demoCargos, demoSkills, demoRoadmaps } from '@/components/demo/demoData';
import { AppView, CompanyContext } from '@/types';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useSkills } from '@/hooks/useSkills';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useDemo } from '@/contexts/DemoContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
const DashboardView = lazy(() => import('@/components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const RolesView = lazy(() => import('@/components/roles/RolesView').then(m => ({ default: m.RolesView })));
const SkillsView = lazy(() => import('@/components/skills/SkillsView').then(m => ({ default: m.SkillsView })));
const RoadmapView = lazy(() => import('@/components/roadmap/RoadmapView').then(m => ({ default: m.RoadmapView })));
const SettingsView = lazy(() => import('@/components/settings/SettingsView').then(m => ({ default: m.SettingsView })));
const PerformanceView = lazy(() => import('@/components/performance/PerformanceView').then(m => ({ default: m.PerformanceView })));
const CostCentersView = lazy(() => import('@/components/cost-centers/CostCentersView').then(m => ({ default: m.CostCentersView })));
const EmpresasView = lazy(() => import('@/components/empresas/EmpresasView').then(m => ({ default: m.EmpresasView })));
const EmployeesView = lazy(() => import('@/components/employees/EmployeesView').then(m => ({ default: m.EmployeesView })));
const TutorialsView = lazy(() => import('@/components/tutorials/TutorialsView').then(m => ({ default: m.TutorialsView })));
const TreinamentosView = lazy(() => import('@/components/treinamentos/TreinamentosView').then(m => ({ default: m.TreinamentosView })));
const TestsView = lazy(() => import('@/components/tests/TestsView').then(m => ({ default: m.TestsView })));
const RecruitmentView = lazy(() => import('@/components/recruitment/RecruitmentView').then(m => ({ default: m.RecruitmentView })));
const DemoLeadForm = lazy(() => import('@/components/demo/DemoLeadForm').then(m => ({ default: m.DemoLeadForm })));
const ApiDocsView = lazy(() => import('@/components/settings/ApiDocsView').then(m => ({ default: m.ApiDocsView })));
const MyDashboardView = lazy(() => import('@/components/dashboard/MyDashboardView').then(m => ({ default: m.MyDashboardView })));

const ViewLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
  </div>
);

const initialContext: CompanyContext = {
  mission: 'Transformar a gestão de talentos através de tecnologia e inteligência artificial.',
  vision: 'Ser a plataforma líder em desenvolvimento de carreira na América Latina.',
  values: ['Inovação', 'Transparência', 'Desenvolvimento Contínuo', 'Colaboração'],
};

const Index = () => {
  const { hasAccess, loading: roleLoading, isUserRole, linkedEmployee } = useUserRole();
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [companyContext, setCompanyContext] = useState<CompanyContext>(initialContext);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [showAccessRequest, setShowAccessRequest] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [employeeCostCenterFilter, setEmployeeCostCenterFilter] = useState<string>('');
  const [prefilledRoadmapData, setPrefilledRoadmapData] = useState<{
    employeeId: string;
    skills: string[];
    training: { name: string; date: string; institution?: string };
  } | undefined>(undefined);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasCompletedLeadForm, setHasCompletedLeadForm, isDemoMode } = useDemo();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Set initial view based on role
  useEffect(() => {
    if (!roleLoading && isUserRole) {
      setActiveView(AppView.MY_DASHBOARD);
    }
  }, [roleLoading, isUserRole]);

  // Demo mode is managed by DemoContext based on user roles

  // Supabase hooks
  const { roles, loading: rolesLoading, saveRole, deleteRole } = useJobRoles();
  const { skills, loading: skillsLoading, saveSkill, deleteSkill } = useSkills();
  const { roadmaps, loading: roadmapsLoading, saveRoadmap, updateRoadmapProgress, updateRoadmapEmployee } = useRoadmaps();
  const { employees, loading: employeesLoading, updateEmployeeEmail, updateEmployeeGestor, createEmployee, updateEmployee, deleteEmployee } = useEmployees();

  const handleGenerateRoadmap = async (sourceRole: string, targetRole: string, employeeName?: string) => {
    if (isDemoMode) {
      toast({
        title: 'Modo demonstração',
        description: 'Esta funcionalidade está disponível apenas para usuários com acesso completo.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGeneratingRoadmap(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { sourceRole, targetRole, employeeName }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Find the employee ID from the name
      let employeeId: string | undefined = undefined;
      if (employeeName && employees.length > 0) {
        const matchedEmployee = employees.find(emp => 
          emp.name?.toLowerCase().trim() === employeeName.toLowerCase().trim()
        );
        employeeId = matchedEmployee?.id;
      }

      await saveRoadmap({
        sourceRoleTitle: sourceRole,
        targetRoleTitle: targetRole,
        employeeName,
        employeeId,
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
    data: { acquiredSkills: string[]; completedTrainings: { name: string; date: string; institution?: string }[]; additionalNotes?: string; selectedEvaluationIds?: string[] },
    roadmap: { steps: any[]; sourceRoleTitle: string; targetRoleTitle: string }
  ) => {
    if (isDemoMode) {
      toast({
        title: 'Modo demonstração',
        description: 'Esta funcionalidade está disponível apenas para usuários com acesso completo.',
        variant: 'destructive',
      });
      return;
    }
    
    await updateRoadmapProgress(
      roadmapId,
      employeeId,
      data.acquiredSkills,
      data.completedTrainings,
      data.additionalNotes,
      roadmap.steps,
      roadmap.sourceRoleTitle,
      roadmap.targetRoleTitle,
      data.selectedEvaluationIds
    );
  };

  const handleNavigateToRoadmapFromTraining = (data: {
    skills: { name: string }[];
    training: { name: string; date: string; institution?: string };
    employeeId: string;
  }) => {
    setPrefilledRoadmapData({
      employeeId: data.employeeId,
      skills: data.skills.map(s => s.name),
      training: data.training
    });
    setActiveView(AppView.ROADMAP);
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

  // Show lead capture form if user doesn't have access and hasn't completed the form
  if (!hasAccess && !hasCompletedLeadForm) {
    return (
      <Suspense fallback={<ViewLoader />}>
        <DemoLeadForm onSuccess={() => setHasCompletedLeadForm(true)} />
      </Suspense>
    );
  }

  // Get data - use demo data if in demo mode, otherwise use real data
  const displayRoles = isDemoMode ? demoCargos : roles;
  const displaySkills = isDemoMode ? demoSkills : skills;
  const displayEmployees = isDemoMode ? demoEmployees : employees;

  const isLoading = !isDemoMode && (rolesLoading || skillsLoading || roadmapsLoading || employeesLoading);

  // Dummy handlers for demo mode
  const demoNoOp = async () => {
    toast({ title: 'Modo demonstração', description: 'Edição não disponível.', variant: 'destructive' });
    return { success: false };
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      );
    }

    switch (activeView) {
      case AppView.MY_DASHBOARD:
        return <MyDashboardView linkedEmployee={linkedEmployee} onNavigate={(view) => setActiveView(view)} />;
      case AppView.DASHBOARD:
        return <DashboardView roles={displayRoles} skills={displaySkills} employees={displayEmployees} onNavigate={(view) => setActiveView(view as AppView)} />;
      case AppView.ROLES:
        return <RolesView roles={displayRoles} skills={displaySkills} employees={displayEmployees} onSaveRole={isDemoMode ? () => toast({ title: 'Modo demonstração', description: 'Edição não disponível.', variant: 'destructive' }) : saveRole} onDeleteRole={isDemoMode ? () => toast({ title: 'Modo demonstração', description: 'Exclusão não disponível.', variant: 'destructive' }) : deleteRole} />;
      case AppView.SKILLS:
        return <SkillsView skills={displaySkills} roles={displayRoles} onSaveSkill={isDemoMode ? () => toast({ title: 'Modo demonstração', description: 'Edição não disponível.', variant: 'destructive' }) : saveSkill} onDeleteSkill={isDemoMode ? () => toast({ title: 'Modo demonstração', description: 'Exclusão não disponível.', variant: 'destructive' }) : deleteSkill} />;
      case AppView.EMPLOYEES:
        return <EmployeesView employees={displayEmployees} roles={displayRoles} onUpdateEmail={isDemoMode ? demoNoOp : updateEmployeeEmail} onUpdateGestor={isDemoMode ? demoNoOp : updateEmployeeGestor} onCreateEmployee={isDemoMode ? undefined : createEmployee} onUpdateEmployee={isDemoMode ? undefined : updateEmployee} onDeleteEmployee={isDemoMode ? undefined : deleteEmployee} isDemoMode={isDemoMode} initialCostCenterFilter={employeeCostCenterFilter} />;
      case AppView.ROADMAP:
        return (
          <RoadmapView 
            roles={displayRoles} 
            employees={displayEmployees} 
            roadmaps={isDemoMode ? demoRoadmaps : roadmaps} 
            skills={displaySkills} 
            onGenerateRoadmap={handleGenerateRoadmap} 
            onUpdateProgress={handleUpdateRoadmapProgress}
            onUpdateEmployee={isDemoMode ? undefined : updateRoadmapEmployee}
            prefilledUpdateData={prefilledRoadmapData}
            onClearPrefilledData={() => setPrefilledRoadmapData(undefined)}
          />
        );
      case AppView.PERFORMANCE:
        return <PerformanceView employees={displayEmployees} roles={displayRoles} />;
      case AppView.TRAININGS:
        return (
          <TreinamentosView 
            isDemoMode={isDemoMode} 
            onNavigateToRoadmap={handleNavigateToRoadmapFromTraining}
          />
        );
      case AppView.TESTS:
        return <TestsView isDemoMode={isDemoMode} />;
      case AppView.RECRUITMENT:
        return <RecruitmentView isDemoMode={isDemoMode} />;
      case AppView.EMPRESAS:
        return <EmpresasView />;
      case AppView.COST_CENTERS:
        return <CostCentersView />;
      case AppView.TUTORIALS:
        return <TutorialsView />;
      case AppView.API_DOCS:
        return <ApiDocsView />;
      case AppView.SETTINGS:
        return <SettingsView companyContext={companyContext} onSaveContext={setCompanyContext} />;
      default:
        return <DashboardView roles={displayRoles} skills={displaySkills} employees={displayEmployees} onNavigate={(view) => setActiveView(view as AppView)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isDemoMode && <DemoBanner onRequestAccess={() => setShowAccessRequest(true)} />}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      
      <div className={`md:pl-64 transition-all duration-300 ${isDemoMode ? 'pt-0' : ''}`}>
        <Header 
          activeView={activeView} 
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        
        <main className="p-4 md:p-6">
          <Suspense fallback={<ViewLoader />}>
            {renderView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Index;
