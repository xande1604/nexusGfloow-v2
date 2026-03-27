import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchAllRows } from '@/lib/fetchAllRows';

export interface Empresa {
  id: string;
  codempresa: string;
  nomeempresa: string;
  cnae?: string;
  percentual_encargos?: number;
  grau_risco?: number;
  owner_admin_id?: string;
}

export interface EmpresaWithCount extends Empresa {
  employeeCount: number;
}

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<EmpresaWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      
      // Fetch empresas
      const empresasData = await fetchAllRows('empresas', {
        order: { column: 'nomeempresa', ascending: true },
      });

      const employeeCounts = await fetchAllRows('nexus_employees', {
        select: 'codempresa',
      });

      // Count employees per empresa
      const countMap: Record<string, number> = {};
      employeeCounts?.forEach(emp => {
        if (emp.codempresa) {
          countMap[emp.codempresa] = (countMap[emp.codempresa] || 0) + 1;
        }
      });

      // Merge data
      const empresasWithCount: EmpresaWithCount[] = (empresasData || []).map(empresa => ({
        ...empresa,
        employeeCount: countMap[empresa.codempresa] || 0
      }));

      setEmpresas(empresasWithCount);
    } catch (error) {
      console.error('Error fetching empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const saveEmpresa = async (empresa: Partial<Empresa>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // Resolve the correct owner_admin_id via RPC (handles gestor -> admin tenant)
      const { data: ownerIdData } = await supabase.rpc('get_owner_admin_id', { _user_id: userId });
      const ownerAdminId = ownerIdData ?? userId;

      if (empresa.id) {
        // Update existing
        const { error } = await supabase
          .from('empresas')
          .update({
            codempresa: empresa.codempresa,
            nomeempresa: empresa.nomeempresa,
            cnae: empresa.cnae,
            percentual_encargos: empresa.percentual_encargos,
            grau_risco: empresa.grau_risco,
            updated_at: new Date().toISOString()
          })
          .eq('id', empresa.id);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso');
      } else {
        // Insert new
        const { error } = await supabase
          .from('empresas')
          .insert({
            codempresa: empresa.codempresa,
            nomeempresa: empresa.nomeempresa,
            cnae: empresa.cnae,
            percentual_encargos: empresa.percentual_encargos ?? 80.0,
            grau_risco: empresa.grau_risco,
            owner_admin_id: ownerAdminId
          });

        if (error) throw error;
        toast.success('Empresa criada com sucesso');
      }

      await fetchEmpresas();
    } catch (error: any) {
      console.error('Error saving empresa:', error);
      toast.error(error.message || 'Erro ao salvar empresa');
    }
  };

  const deleteEmpresa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Empresa excluída com sucesso');
      await fetchEmpresas();
    } catch (error: any) {
      console.error('Error deleting empresa:', error);
      toast.error(error.message || 'Erro ao excluir empresa');
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { 
    empresas, 
    loading, 
    saveEmpresa, 
    deleteEmpresa, 
    refetch: fetchEmpresas 
  };
};
