import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useJobRoles = () => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .order('title');

      if (error) throw error;

      const mappedRoles: JobRole[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        level: row.level as JobRole['level'],
        department: row.department,
        description: row.description || '',
        salaryRange: {
          min: Number(row.salary_min) || 0,
          max: Number(row.salary_max) || 0,
        },
        requiredSkillIds: [], // Will be fetched separately if needed
      }));

      setRoles(mappedRoles);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar cargos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRole = async (role: JobRole) => {
    try {
      const dbRole = {
        id: role.id,
        title: role.title,
        level: role.level,
        department: role.department,
        description: role.description,
        salary_min: role.salaryRange.min,
        salary_max: role.salaryRange.max,
      };

      const { error } = await supabase
        .from('job_roles')
        .upsert(dbRole, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Cargo salvo',
        description: `"${role.title}" foi salvo com sucesso.`,
      });

      await fetchRoles();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cargo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Cargo excluído',
        description: 'O cargo foi removido com sucesso.',
      });

      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir cargo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, loading, saveRole, deleteRole, refetch: fetchRoles };
};
