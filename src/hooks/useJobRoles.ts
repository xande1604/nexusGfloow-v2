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
        .from('cargos')
        .select('*')
        .order('tituloreduzido');

      if (error) throw error;

      const mappedRoles: JobRole[] = (data || []).map(row => ({
        id: row.id,
        title: row.tituloreduzido,
        level: 'Pleno' as JobRole['level'],
        department: row.cbo2002 ? `CBO: ${row.cbo2002}` : 'Geral',
        description: [
          row.technical_knowledge,
          row.hard_skills,
          row.soft_skills
        ].filter(Boolean).join(' | ') || 'Sem descrição',
        salaryRange: { 
          min: Number(row.salary_min) || 0, 
          max: Number(row.salary_max) || 0 
        },
        requiredSkillIds: [],
        technicalKnowledge: row.technical_knowledge || undefined,
        hardSkills: row.hard_skills || undefined,
        softSkills: row.soft_skills || undefined,
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
        tituloreduzido: role.title,
        codigocargo: role.id.substring(0, 8),
        technical_knowledge: role.technicalKnowledge || null,
        hard_skills: role.hardSkills || null,
        soft_skills: role.softSkills || null,
        salary_min: role.salaryRange?.min || 0,
        salary_max: role.salaryRange?.max || 0,
      };

      const { error } = await supabase
        .from('cargos')
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
        .from('cargos')
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
