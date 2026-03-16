import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CostCenter } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export interface CostCenterWithCount extends CostCenter {
  employeeCount: number;
}

export const useCostCenters = () => {
  const [costCenters, setCostCenters] = useState<CostCenterWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      
      // Fetch cost centers
      const { data: ccData, error: ccError } = await supabase
        .from('centrodecustos')
        .select('id, codcentrodecustos, nomecentrodecustos, codempresa')
        .order('nomecentrodecustos');

      if (ccError) throw ccError;

      // Fetch employee counts by cost center
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('codcentrodecustos');

      if (empError) throw empError;

      // Count employees per cost center
      const countMap = new Map<string, number>();
      employeeData?.forEach(emp => {
        if (emp.codcentrodecustos) {
          countMap.set(emp.codcentrodecustos, (countMap.get(emp.codcentrodecustos) || 0) + 1);
        }
      });

      // Merge counts with cost centers
      const costCentersWithCount = (ccData || []).map(cc => ({
        ...cc,
        employeeCount: countMap.get(cc.codcentrodecustos) || 0,
      }));

      setCostCenters(costCentersWithCount);
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
      const { data: ownerIdData } = await supabase.rpc('get_owner_admin_id', { _user_id: user?.id });
      const ownerAdminId = ownerIdData ?? user?.id;

      let error;

      if (costCenter.id) {
        // UPDATE existing
        ({ error } = await supabase
          .from('centrodecustos')
          .update({
            codcentrodecustos: costCenter.codcentrodecustos,
            nomecentrodecustos: costCenter.nomecentrodecustos,
            codempresa: costCenter.codempresa,
          })
          .eq('id', costCenter.id));
      } else {
        // INSERT new
        ({ error } = await supabase
          .from('centrodecustos')
          .insert({
            codcentrodecustos: costCenter.codcentrodecustos,
            nomecentrodecustos: costCenter.nomecentrodecustos,
            codempresa: costCenter.codempresa,
            owner_admin_id: ownerAdminId,
          }));
      }

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
