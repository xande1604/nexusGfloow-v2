import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, GitMerge, BarChart3 } from 'lucide-react';
import { useRecruitment } from '@/hooks/useRecruitment';
import { CandidatosTab } from './CandidatosTab';
import { VagasTab } from './VagasTab';
import { PipelineTab } from './PipelineTab';
import { RecruitmentDashboard } from './RecruitmentDashboard';
import { Loader2 } from 'lucide-react';

interface RecruitmentViewProps {
  isDemoMode?: boolean;
}

export const RecruitmentView = ({ isDemoMode = false }: RecruitmentViewProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    candidatos, 
    vagas, 
    candidaturas, 
    loading,
    saveCandidato,
    deleteCandidato,
    saveVaga,
    deleteVaga,
    createCandidatura,
    updateCandidaturaEtapa,
    updateMatchScore,
    scheduleEntrevista,
    addFeedback,
    refetch,
  } = useRecruitment();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="vagas" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Vagas</span>
          </TabsTrigger>
          <TabsTrigger value="candidatos" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Candidatos</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <GitMerge className="w-4 h-4" />
            <span className="hidden sm:inline">Pipeline</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <RecruitmentDashboard 
            candidatos={candidatos}
            vagas={vagas}
            candidaturas={candidaturas}
          />
        </TabsContent>

        <TabsContent value="vagas" className="mt-6">
          <VagasTab
            vagas={vagas}
            candidaturas={candidaturas}
            onSaveVaga={saveVaga}
            onDeleteVaga={deleteVaga}
            isDemoMode={isDemoMode}
          />
        </TabsContent>

        <TabsContent value="candidatos" className="mt-6">
          <CandidatosTab
            candidatos={candidatos}
            vagas={vagas}
            candidaturas={candidaturas}
            onSaveCandidato={saveCandidato}
            onDeleteCandidato={deleteCandidato}
            onCreateCandidatura={createCandidatura}
            isDemoMode={isDemoMode}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <PipelineTab
            candidatos={candidatos}
            vagas={vagas}
            candidaturas={candidaturas}
            onUpdateEtapa={updateCandidaturaEtapa}
            onUpdateMatchScore={updateMatchScore}
            onScheduleEntrevista={scheduleEntrevista}
            onAddFeedback={addFeedback}
            isDemoMode={isDemoMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
