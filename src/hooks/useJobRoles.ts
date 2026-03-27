import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { fetchAllRows } from '@/lib/fetchAllRows';

export const useJobRoles = () => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const data = await fetchAllRows('cargos', {
        order: { column: 'tituloreduzido', ascending: true },
      });

      const mappedRoles: JobRole[] = (data || []).map(row => ({
        id: row.id,
        codigocargo: row.codigocargo,
        title: row.tituloreduzido,
        level: 'Pleno' as JobRole['level'],
        department: 'Geral',
        cbo: row.cbo2002 || undefined,
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      const { data: ownerIdData } = await supabase.rpc('get_owner_admin_id', { _user_id: userId });
      const ownerAdminId = ownerIdData ?? userId;

      const dbRole: any = {
        id: role.id,
        tituloreduzido: role.title,
        codigocargo: role.codigocargo || role.title.substring(0, 10).toUpperCase(),
        technical_knowledge: role.technicalKnowledge || null,
        hard_skills: role.hardSkills || null,
        soft_skills: role.softSkills || null,
        salary_min: role.salaryRange?.min || 0,
        salary_max: role.salaryRange?.max || 0,
        owner_admin_id: ownerAdminId,
        is_active: (role as any).is_active !== false,
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
