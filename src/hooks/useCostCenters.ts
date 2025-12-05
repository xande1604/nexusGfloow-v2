import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CostCenter } from '@/types';

export const useCostCenters = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('centrodecustos')
        .select('id, codcentrodecustos, nomecentrodecustos, codempresa')
        .order('nomecentrodecustos');

      if (error) throw error;
      setCostCenters(data || []);
    } catch (error: any) {
      console.error('Error fetching cost centers:', error);
      toast({
        title: 'Erro ao carregar centros de custos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCostCenter = async (costCenter: Partial<CostCenter>) => {
    try {
      const { error } = await supabase
        .from('centrodecustos')
        .upsert({
          id: costCenter.id,
          codcentrodecustos: costCenter.codcentrodecustos,
          nomecentrodecustos: costCenter.nomecentrodecustos,
          codempresa: costCenter.codempresa,
        });

      if (error) throw error;

      toast({
        title: 'Centro de custos salvo',
        description: 'Os dados foram salvos com sucesso.',
      });

      await fetchCostCenters();
    } catch (error: any) {
      console.error('Error saving cost center:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteCostCenter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('centrodecustos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCostCenters(prev => prev.filter(cc => cc.id !== id));
      toast({
        title: 'Centro de custos excluído',
        description: 'O registro foi removido com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting cost center:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  return {
    costCenters,
    loading,
    saveCostCenter,
    deleteCostCenter,
    refetch: fetchCostCenters,
  };
};
