import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_name: string;
  skill_category?: string;
  acquired_at: string;
  source_type: string;
  source_id?: string;
  source_name?: string;
  created_at: string;
}

export interface SaveEmployeeSkillInput {
  employee_id: string;
  skill_name: string;
  skill_category?: string;
  source_type?: string;
  source_id?: string;
  source_name?: string;
}

export const useEmployeeSkills = (employeeId?: string) => {
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSkills = async () => {
    try {
      let query = supabase
        .from('employee_skills')
        .select('*')
        .order('acquired_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSkills((data || []) as EmployeeSkill[]);
    } catch (error: any) {
      console.error('Error fetching employee skills:', error);
      toast({
        title: 'Erro ao carregar habilidades',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSkills = async (skillsToSave: SaveEmployeeSkillInput[]): Promise<boolean> => {
    try {
      // Use upsert to handle duplicates gracefully
      const { error } = await supabase
        .from('employee_skills')
        .upsert(
          skillsToSave.map(skill => ({
            employee_id: skill.employee_id,
            skill_name: skill.skill_name,
            skill_category: skill.skill_category || null,
            source_type: skill.source_type || 'training',
            source_id: skill.source_id || null,
            source_name: skill.source_name || null,
            acquired_at: new Date().toISOString(),
          })),
          { onConflict: 'employee_id,skill_name' }
        );

      if (error) throw error;

      await fetchSkills();
      return true;
    } catch (error: any) {
      console.error('Error saving employee skills:', error);
      toast({
        title: 'Erro ao salvar habilidades',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('employee_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      setSkills(prev => prev.filter(s => s.id !== skillId));
      toast({
        title: 'Habilidade removida',
        description: 'A habilidade foi removida do perfil.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover habilidade',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getSkillsByEmployee = (empId: string): EmployeeSkill[] => {
    return skills.filter(s => s.employee_id === empId);
  };

  useEffect(() => {
    fetchSkills();
  }, [employeeId]);

  return { 
    skills, 
    loading, 
    saveSkills, 
    deleteSkill, 
    getSkillsByEmployee,
    refetch: fetchSkills 
  };
};
