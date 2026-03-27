import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CostCenter } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllRows } from '@/lib/fetchAllRows';

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
      const ccData = await fetchAllRows('centrodecustos', {
        select: 'id, codcentrodecustos, nomecentrodecustos, codempresa, is_active',
        order: { column: 'nomecentrodecustos', ascending: true },
      });

      const employeeData = await fetchAllRows('employees', {
        select: 'codcentrodecustos',
      });

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
            is_active: (costCenter as any).is_active !== false,
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
            is_active: (costCenter as any).is_active !== false,
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

  const bulkUpdateActive = async (ids: string[], isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('centrodecustos')
        .update({ is_active: isActive })
        .in('id', ids);

      if (error) throw error;

      toast({
        title: isActive ? 'Centros ativados' : 'Centros inativados',
        description: `${ids.length} centro(s) de custos atualizado(s).`,
      });

      await fetchCostCenters();
    } catch (error: any) {
      console.error('Error bulk updating cost centers:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    costCenters,
    loading,
    saveCostCenter,
    deleteCostCenter,
    bulkUpdateActive,
    refetch: fetchCostCenters,
  };
};
