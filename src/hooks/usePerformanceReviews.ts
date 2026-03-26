import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchAllRows } from '@/lib/fetchAllRows';

export interface ReviewQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text';
}

export interface ReviewResponse {
  questionId: string;
  rating?: number;
  text?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string | null;
  employeeName?: string;
  date: string;
  status: 'PendingSelf' | 'PendingManager' | 'Completed';
  questions: ReviewQuestion[];
  responses: ReviewResponse[];
  overallFeedback: string | null;
  createdAt: string;
}

const DEFAULT_QUESTIONS: ReviewQuestion[] = [
  { id: '1', question: 'Como você avalia o cumprimento de metas e objetivos?', type: 'rating' },
  { id: '2', question: 'Como você avalia a qualidade do trabalho entregue?', type: 'rating' },
  { id: '3', question: 'Como você avalia a colaboração e trabalho em equipe?', type: 'rating' },
  { id: '4', question: 'Como você avalia a comunicação e proatividade?', type: 'rating' },
  { id: '5', question: 'Quais foram os principais pontos fortes demonstrados?', type: 'text' },
  { id: '6', question: 'Quais áreas precisam de desenvolvimento?', type: 'text' },
];

export const usePerformanceReviews = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      const data = await fetchAllRows('performance_reviews', {
        select: `
          id,
          employee_id,
          date,
          status,
          questions,
          responses,
          overall_feedback,
          created_at,
          employees!performance_reviews_employee_id_fkey (nome)
        `,
        order: { column: 'created_at', ascending: false },
      });

      const mappedReviews: PerformanceReview[] = (data || []).map(review => ({
        id: review.id,
        employeeId: review.employee_id,
        employeeName: (review.employees as any)?.nome || 'Colaborador',
        date: review.date || new Date().toISOString().split('T')[0],
        status: review.status as PerformanceReview['status'],
        questions: (review.questions as unknown as ReviewQuestion[]) || DEFAULT_QUESTIONS,
        responses: (review.responses as unknown as ReviewResponse[]) || [],
        overallFeedback: review.overall_feedback,
        createdAt: review.created_at || new Date().toISOString(),
      }));

      setReviews(mappedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Erro ao carregar avaliações',
        description: 'Não foi possível carregar as avaliações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReview = async (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .insert({
          employee_id: review.employeeId,
          date: review.date,
          status: review.status,
          questions: review.questions as any,
          responses: review.responses as any,
          overall_feedback: review.overallFeedback,
        });

      if (error) throw error;

      toast({
        title: 'Avaliação criada',
        description: 'A avaliação foi criada com sucesso.',
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a avaliação.',
        variant: 'destructive',
      });
    }
  };

  const updateReview = async (id: string, updates: Partial<PerformanceReview>) => {
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .update({
          status: updates.status,
          responses: updates.responses as any,
          overall_feedback: updates.overallFeedback,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Avaliação atualizada',
        description: 'A avaliação foi atualizada com sucesso.',
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar a avaliação.',
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('performance_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Avaliação excluída',
        description: 'A avaliação foi excluída com sucesso.',
      });

      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a avaliação.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return { 
    reviews, 
    loading, 
    saveReview, 
    updateReview, 
    deleteReview,
    defaultQuestions: DEFAULT_QUESTIONS,
    refetch: fetchReviews 
  };
};
