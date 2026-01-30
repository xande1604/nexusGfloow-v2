import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerRoadmap, RoadmapStep, RoadmapProgress } from '@/types';
import { useToast } from '@/hooks/use-toast';

const normalizeProgress = (progress: any): RoadmapProgress | undefined => {
  if (!progress || typeof progress !== 'object') return undefined;

  return {
    currentStepIndex: Number(progress.currentStepIndex) || 0,
    progressPercentage: Number(progress.progressPercentage) || 0,
    completedSteps: Array.isArray(progress.completedSteps) ? progress.completedSteps : [],
    achievements: Array.isArray(progress.achievements) ? progress.achievements : [],
    gaps: Array.isArray(progress.gaps) ? progress.gaps : [],
    nextActions: Array.isArray(progress.nextActions) ? progress.nextActions : [],
    summary: typeof progress.summary === 'string' ? progress.summary : '',
    lastUpdated: typeof progress.lastUpdated === 'string' ? progress.lastUpdated : new Date().toISOString(),
    updateHistory: Array.isArray(progress.updateHistory)
      ? progress.updateHistory.map((entry: any) => ({
          date: typeof entry?.date === 'string' ? entry.date : new Date().toISOString(),
          acquiredSkills: Array.isArray(entry?.acquiredSkills) ? entry.acquiredSkills : [],
          completedTrainings: Array.isArray(entry?.completedTrainings) ? entry.completedTrainings : [],
          additionalNotes: typeof entry?.additionalNotes === 'string' ? entry.additionalNotes : undefined,
        }))
      : [],
    history: Array.isArray(progress.history) ? progress.history : undefined,
  };
};

export const useRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoadmaps = async () => {
    try {
      const { data, error } = await supabase
        .from('career_roadmaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRoadmaps: CareerRoadmap[] = (data || []).map(row => ({
        id: row.id,
        employeeId: row.employee_id || undefined,
        sourceRoleTitle: row.source_role_title,
        targetRoleTitle: row.target_role_title,
        steps: (row.steps as unknown as RoadmapStep[]) || [],
        createdAt: row.created_at || new Date().toISOString(),
        progress: normalizeProgress(row.progress),
      }));

      setRoadmaps(mappedRoadmaps);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar roadmaps',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRoadmap = async (roadmap: Omit<CareerRoadmap, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('career_roadmaps')
        .insert({
          source_role_title: roadmap.sourceRoleTitle,
          target_role_title: roadmap.targetRoleTitle,
          employee_id: roadmap.employeeId || null,
          steps: roadmap.steps as any,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Roadmap salvo',
        description: 'O plano de carreira foi salvo com sucesso.',
      });

      await fetchRoadmaps();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar roadmap',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRoadmapProgress = async (
    roadmapId: string,
    employeeId: string | undefined,
    acquiredSkills: string[],
    completedTrainings: { name: string; date: string; institution?: string }[],
    additionalNotes: string | undefined,
    roadmapSteps: RoadmapStep[],
    sourceRoleTitle: string,
    targetRoleTitle: string,
    selectedEvaluationIds?: string[]
  ): Promise<RoadmapProgress | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('update-roadmap-progress', {
        body: {
          roadmapId,
          employeeId,
          acquiredSkills,
          completedTrainings,
          additionalNotes,
          roadmapSteps,
          sourceRoleTitle,
          targetRoleTitle,
          selectedEvaluationIds
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Progresso atualizado',
        description: 'O roadmap foi atualizado com sucesso.',
      });

      await fetchRoadmaps();
      return data.progress;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar progresso',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRoadmapEmployee = async (roadmapId: string, employeeId: string | null) => {
    try {
      const { error } = await supabase
        .from('career_roadmaps')
        .update({ employee_id: employeeId })
        .eq('id', roadmapId);

      if (error) throw error;

      toast({
        title: 'Roadmap atualizado',
        description: employeeId 
          ? 'Colaborador vinculado com sucesso.' 
          : 'Colaborador desvinculado do roadmap.',
      });

      await fetchRoadmaps();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar roadmap',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRoadmap = async (id: string) => {
    try {
      const { error } = await supabase
        .from('career_roadmaps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Roadmap excluído',
        description: 'O plano de carreira foi removido.',
      });

      setRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir roadmap',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  return { roadmaps, loading, saveRoadmap, deleteRoadmap, updateRoadmapProgress, updateRoadmapEmployee, refetch: fetchRoadmaps };
};
