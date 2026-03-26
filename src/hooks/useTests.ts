import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Test, TestQuestion, TestAttempt, Certification } from '@/types/tests';
import { fetchAllRows } from '@/lib/fetchAllRows';

export const useTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Test[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        cargoId: row.cargo_id || undefined,
        costCenterId: row.cost_center_id || undefined,
        participationMode: row.participation_mode as Test['participationMode'],
        passingScore: row.passing_score,
        timeLimitMinutes: row.time_limit_minutes || undefined,
        isActive: row.is_active,
        validFrom: row.valid_from || undefined,
        validUntil: row.valid_until || undefined,
        questions: (row.questions as any[] || []).map(q => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          category: q.category,
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setTests(mapped);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar testes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async (test: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Convert questions to JSON-compatible format
      const questionsJson = test.questions.map(q => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        options: q.options || null,
        correctAnswer: q.correctAnswer || null,
        points: q.points,
        category: q.category || null,
      }));
      
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          description: test.description || null,
          cargo_id: test.cargoId || null,
          cost_center_id: test.costCenterId || null,
          participation_mode: test.participationMode,
          passing_score: test.passingScore,
          time_limit_minutes: test.timeLimitMinutes || null,
          is_active: test.isActive,
          valid_from: test.validFrom || null,
          valid_until: test.validUntil || null,
          questions: questionsJson,
          owner_admin_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Teste criado',
        description: `"${test.title}" foi criado com sucesso.`,
      });

      await fetchTests();
      return data.id;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar teste',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTest = async (id: string, updates: Partial<Test>) => {
    try {
      // Convert questions to JSON-compatible format if provided
      const questionsJson = updates.questions?.map(q => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        options: q.options || null,
        correctAnswer: q.correctAnswer || null,
        points: q.points,
        category: q.category || null,
      }));
      
      const { error } = await supabase
        .from('tests')
        .update({
          title: updates.title,
          description: updates.description || null,
          cargo_id: updates.cargoId || null,
          cost_center_id: updates.costCenterId || null,
          participation_mode: updates.participationMode,
          passing_score: updates.passingScore,
          time_limit_minutes: updates.timeLimitMinutes || null,
          is_active: updates.isActive,
          valid_from: updates.validFrom || null,
          valid_until: updates.validUntil || null,
          questions: questionsJson,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Teste atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });

      await fetchTests();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar teste',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Teste excluído',
        description: 'O teste foi removido com sucesso.',
      });

      setTests(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir teste',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const addParticipants = async (testId: string, employeeIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const participants = employeeIds.map(employeeId => ({
        test_id: testId,
        employee_id: employeeId,
        invited_by: user?.id,
      }));

      const { error } = await supabase
        .from('test_participants')
        .upsert(participants, { onConflict: 'test_id,employee_id' });

      if (error) throw error;

      toast({
        title: 'Participantes adicionados',
        description: `${employeeIds.length} colaborador(es) convidado(s) para o teste.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar participantes',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return {
    tests,
    loading,
    saveTest,
    updateTest,
    deleteTest,
    addParticipants,
    refetch: fetchTests,
  };
};

export const useTestAttempts = (testId?: string) => {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAttempts = async () => {
    if (!testId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('test_id', testId)
        .order('started_at', { ascending: false });

      if (error) throw error;

      const mapped: TestAttempt[] = (data || []).map(row => ({
        id: row.id,
        testId: row.test_id,
        employeeId: row.employee_id,
        startedAt: row.started_at,
        completedAt: row.completed_at || undefined,
        responses: row.responses as TestAttempt['responses'],
        autoScore: row.auto_score ? Number(row.auto_score) : undefined,
        manualScore: row.manual_score ? Number(row.manual_score) : undefined,
        finalScore: row.final_score ? Number(row.final_score) : undefined,
        status: row.status as TestAttempt['status'],
        reviewedBy: row.reviewed_by || undefined,
        reviewedAt: row.reviewed_at || undefined,
        feedback: row.feedback || undefined,
      }));

      setAttempts(mapped);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tentativas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const gradeAttempt = async (
    attemptId: string,
    essayScores: { questionId: string; score: number }[],
    feedback?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const attempt = attempts.find(a => a.id === attemptId);
      if (!attempt) throw new Error('Tentativa não encontrada');

      // Calculate manual score for essays
      const manualScore = essayScores.reduce((acc, s) => acc + s.score, 0);
      const finalScore = (attempt.autoScore || 0) + manualScore;

      const { error } = await supabase
        .from('test_attempts')
        .update({
          manual_score: manualScore,
          final_score: finalScore,
          status: 'graded',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          feedback: feedback || null,
        })
        .eq('id', attemptId);

      if (error) throw error;

      toast({
        title: 'Avaliação concluída',
        description: `Nota final: ${finalScore.toFixed(1)} pontos`,
      });

      await fetchAttempts();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao avaliar',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [testId]);

  return {
    attempts,
    loading,
    gradeAttempt,
    refetch: fetchAttempts,
  };
};

export const useCertifications = (employeeId?: string) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCertifications = async () => {
    try {
      let query = supabase
        .from('certifications')
        .select('*')
        .order('issued_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped: Certification[] = (data || []).map(row => ({
        id: row.id,
        testId: row.test_id,
        employeeId: row.employee_id,
        attemptId: row.attempt_id,
        issuedAt: row.issued_at,
        validUntil: row.valid_until || undefined,
        certificateCode: row.certificate_code,
      }));

      setCertifications(mapped);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar certificações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [employeeId]);

  return {
    certifications,
    loading,
    refetch: fetchCertifications,
  };
};
