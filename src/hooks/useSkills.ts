import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { fetchAllRows } from '@/lib/fetchAllRows';

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedSkills: Skill[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        category: row.category as Skill['category'],
        description: row.description || undefined,
      }));

      setSkills(mappedSkills);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar habilidades',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSkill = async (skill: Skill) => {
    try {
      const dbSkill = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description || null,
      };

      const { error } = await supabase
        .from('skills')
        .upsert(dbSkill, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Habilidade salva',
        description: `"${skill.name}" foi salva com sucesso.`,
      });

      await fetchSkills();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar habilidade',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Habilidade excluída',
        description: 'A habilidade foi removida com sucesso.',
      });

      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir habilidade',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return { skills, loading, saveSkill, deleteSkill, refetch: fetchSkills };
};
