import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Treinamento {
  id: string;
  employee_id: string | null;
  nome_treinamento: string;
  instituicao: string | null;
  data_inicio: string | null;
  data_conclusao: string | null;
  carga_horaria: number | null;
  certificado_url: string | null;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreinamentoInput {
  employee_id?: string | null;
  nome_treinamento: string;
  instituicao?: string | null;
  data_inicio?: string | null;
  data_conclusao?: string | null;
  carga_horaria?: number | null;
  certificado_url?: string | null;
  status?: 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string | null;
}

export const useTreinamentos = () => {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTreinamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('treinamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTreinamentos((data as Treinamento[]) || []);
    } catch (error: any) {
      console.error('Erro ao buscar treinamentos:', error);
      toast({
        title: 'Erro ao carregar treinamentos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTreinamento = async (treinamento: TreinamentoInput) => {
    try {
      const { data, error } = await supabase
        .from('treinamentos')
        .insert([treinamento])
        .select()
        .single();

      if (error) throw error;

      setTreinamentos(prev => [data as Treinamento, ...prev]);
      
      toast({
        title: 'Treinamento registrado',
        description: 'O treinamento foi salvo com sucesso.',
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao salvar treinamento:', error);
      toast({
        title: 'Erro ao salvar treinamento',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateTreinamento = async (id: string, updates: Partial<TreinamentoInput>) => {
    try {
      const { data, error } = await supabase
        .from('treinamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTreinamentos(prev => 
        prev.map(t => t.id === id ? (data as Treinamento) : t)
      );

      toast({
        title: 'Treinamento atualizado',
        description: 'As alterações foram salvas.',
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao atualizar treinamento:', error);
      toast({
        title: 'Erro ao atualizar treinamento',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const deleteTreinamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treinamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTreinamentos(prev => prev.filter(t => t.id !== id));

      toast({
        title: 'Treinamento excluído',
        description: 'O registro foi removido.',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao excluir treinamento:', error);
      toast({
        title: 'Erro ao excluir treinamento',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchTreinamentos();
  }, []);

  return {
    treinamentos,
    loading,
    saveTreinamento,
    updateTreinamento,
    deleteTreinamento,
    refetch: fetchTreinamentos,
  };
};
