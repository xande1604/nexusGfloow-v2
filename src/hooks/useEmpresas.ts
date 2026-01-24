import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('nomeempresa');

      if (empresasError) throw empresasError;

      // Fetch employee counts per empresa
      const { data: employeeCounts, error: countError } = await supabase
        .from('employees')
        .select('codempresa');

      if (countError) throw countError;

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
            owner_admin_id: userData?.user?.id
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
