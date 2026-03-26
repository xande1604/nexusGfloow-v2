import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchAllRows } from '@/lib/fetchAllRows';

export interface EvaluationCycle {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'closed';
  created_at: string;
}

export interface EmployeeEvaluation {
  id: string;
  cycle_id: string;
  employee_id: string;
  questions: Array<{ id: string; question: string; category: string; type: string }>;
  self_assessment_responses: Array<{ questionId: string; rating?: number; response?: string }> | null;
  self_assessment_completed_at: string | null;
  manager_evaluation_responses: Array<{ questionId: string; rating?: number; response?: string }> | null;
  manager_feedback: string | null;
  manager_evaluation_completed_at: string | null;
  status: 'pending' | 'self_assessment_done' | 'completed';
  created_at: string;
  employee?: {
    id: string;
    nome?: string;
    name?: string;
    email?: string;
    codigocargo?: string;
    gestor_id?: string | null;
  };
}

export const useEvaluationCycles = () => {
  const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
  const [evaluations, setEvaluations] = useState<EmployeeEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCycles = async () => {
    try {
      const data = await fetchAllRows('evaluation_cycles', {
        order: { column: 'created_at', ascending: false },
      });
      setCycles(data as EvaluationCycle[]);
    } catch (error) {
      console.error('Error fetching cycles:', error);
      toast.error('Erro ao carregar ciclos');
    }
  };

  const fetchEvaluations = async (cycleId?: string) => {
    let query = supabase
      .from('employee_evaluations')
      .select(`
        *,
        employee:employees(id, nome, email, codigocargo)
      `)
      .order('created_at', { ascending: false });

    if (cycleId) {
      query = query.eq('cycle_id', cycleId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('Erro ao carregar avaliações');
      return;
    }

    setEvaluations(data as unknown as EmployeeEvaluation[]);
  };

  const createCycle = async (cycle: Omit<EvaluationCycle, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('evaluation_cycles')
      .insert(cycle)
      .select()
      .single();

    if (error) {
      console.error('Error creating cycle:', error);
      toast.error('Erro ao criar ciclo');
      return null;
    }

    toast.success('Ciclo criado com sucesso!');
    await fetchCycles();
    return data as EvaluationCycle;
  };

  const closeCycle = async (cycleId: string) => {
    const { error } = await supabase
      .from('evaluation_cycles')
      .update({ status: 'closed' })
      .eq('id', cycleId);

    if (error) {
      console.error('Error closing cycle:', error);
      toast.error('Erro ao fechar ciclo');
      return;
    }

    toast.success('Ciclo fechado com sucesso!');
    await fetchCycles();
  };

  const addEmployeesToCycle = async (
    cycleId: string, 
    employeeIds: string[], 
    questions: Array<{ id: string; question: string; category: string; type: string }>
  ) => {
    const evaluationsToInsert = employeeIds.map(employeeId => ({
      cycle_id: cycleId,
      employee_id: employeeId,
      questions,
      status: 'pending'
    }));

    const { error } = await supabase
      .from('employee_evaluations')
      .insert(evaluationsToInsert);

    if (error) {
      console.error('Error adding employees to cycle:', error);
      toast.error('Erro ao adicionar colaboradores');
      return false;
    }

    toast.success(`${employeeIds.length} colaborador(es) adicionado(s) ao ciclo`);
    await fetchEvaluations(cycleId);
    return true;
  };

  const submitManagerEvaluation = async (
    evaluationId: string,
    responses: Array<{ questionId: string; rating?: number; response?: string }> | null,
    feedback: string | null,
    closeOnly: boolean = false
  ) => {
    const updateData: Record<string, unknown> = {
      status: 'completed',
      manager_evaluation_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!closeOnly) {
      updateData.manager_evaluation_responses = responses;
      updateData.manager_feedback = feedback;
    }

    const { error } = await supabase
      .from('employee_evaluations')
      .update(updateData)
      .eq('id', evaluationId);

    if (error) {
      console.error('Error submitting manager evaluation:', error);
      toast.error('Erro ao salvar avaliação');
      return false;
    }

    toast.success(closeOnly ? 'Ciclo fechado com sucesso!' : 'Avaliação do gestor salva com sucesso!');
    await fetchEvaluations();
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCycles(), fetchEvaluations()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    cycles,
    evaluations,
    loading,
    createCycle,
    closeCycle,
    addEmployeesToCycle,
    submitManagerEvaluation,
    fetchEvaluations,
    refetch: () => Promise.all([fetchCycles(), fetchEvaluations()])
  };
};
