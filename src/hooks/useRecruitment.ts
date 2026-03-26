import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllRows } from '@/lib/fetchAllRows';
import type { 
  Candidato, 
  Vaga, 
  Candidatura, 
  Entrevista, 
  CandidaturaFeedback,
  CandidatoSkill,
  VagaSkill,
  EtapaCandidatura 
} from '@/types/recruitment';

// Helper to safely cast database results
const asCandidaturas = (data: any[]): Candidatura[] => {
  return (data || []).map(c => ({
    ...c,
    etapa: c.etapa as EtapaCandidatura,
    match_detalhes: c.match_detalhes as any,
  }));
};

export const useRecruitment = () => {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch candidatos
  const fetchCandidatos = async () => {
    try {
      const data = await fetchAllRows('candidatos', {
        order: { column: 'created_at', ascending: false },
      });

      // Fetch skills for each candidato
      const candidatosWithSkills = await Promise.all(
        (data || []).map(async (candidato) => {
          const { data: skills } = await supabase
            .from('candidato_skills')
            .select('*')
            .eq('candidato_id', candidato.id);
          
          return {
            ...candidato,
            skills: skills || [],
          } as Candidato;
        })
      );

      setCandidatos(candidatosWithSkills);
    } catch (error) {
      console.error('Error fetching candidatos:', error);
    }
  };

  // Fetch vagas
  const fetchVagas = async () => {
    try {
      const { data, error } = await supabase
        .from('vagas')
        .select(`
          *,
          cargos:cargo_id (tituloreduzido)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch skills for each vaga
      const vagasWithSkills = await Promise.all(
        (data || []).map(async (vaga) => {
          const { data: skills } = await supabase
            .from('vaga_skills')
            .select('*')
            .eq('vaga_id', vaga.id);
          
          return {
            ...vaga,
            cargo_titulo: (vaga as any).cargos?.tituloreduzido,
            skills: skills || [],
          } as Vaga;
        })
      );

      setVagas(vagasWithSkills);
    } catch (error) {
      console.error('Error fetching vagas:', error);
    }
  };

  // Fetch candidaturas
  const fetchCandidaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*')
        .order('data_candidatura', { ascending: false });

      if (error) throw error;

      setCandidaturas(asCandidaturas(data || []));
    } catch (error) {
      console.error('Error fetching candidaturas:', error);
    }
  };

  // Save candidato
  const saveCandidato = async (candidato: Partial<Candidato>, skills?: Partial<CandidatoSkill>[]) => {
    try {
      const ownerAdminId = user?.id;
      const { id, skills: _, experiencias, formacoes, ...rest } = candidato;
      
      const upsertData: any = { ...rest, owner_admin_id: ownerAdminId };
      if (id) upsertData.id = id;
      
      const { data, error } = await supabase
        .from('candidatos')
        .upsert(upsertData)
        .select()
        .single();

      if (error) throw error;

      // Save skills if provided
      if (skills && skills.length > 0 && data) {
        await supabase.from('candidato_skills').delete().eq('candidato_id', data.id);
        
        const validSkills = skills.filter(s => s.skill_name);
        if (validSkills.length > 0) {
          const skillsToInsert = validSkills.map(s => ({
            skill_name: s.skill_name!,
            skill_category: s.skill_category,
            nivel: s.nivel,
            anos_experiencia: s.anos_experiencia,
            candidato_id: data.id,
          }));
          await supabase.from('candidato_skills').insert(skillsToInsert);
        }
      }

      await fetchCandidatos();
      
      toast({
        title: 'Candidato salvo',
        description: 'Os dados do candidato foram salvos com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error saving candidato:', error);
      toast({
        title: 'Erro ao salvar candidato',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete candidato
  const deleteCandidato = async (id: string) => {
    try {
      const { error } = await supabase.from('candidatos').delete().eq('id', id);
      if (error) throw error;

      setCandidatos(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: 'Candidato removido',
        description: 'O candidato foi removido com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting candidato:', error);
      toast({
        title: 'Erro ao remover candidato',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Save vaga
  const saveVaga = async (vaga: Partial<Vaga>, skills?: Partial<VagaSkill>[]) => {
    try {
      const ownerAdminId = user?.id;
      const { id, cargo_titulo, skills: _, ...rest } = vaga;
      
      const upsertData: any = { ...rest, owner_admin_id: ownerAdminId };
      if (id) upsertData.id = id;
      
      const { data, error } = await supabase
        .from('vagas')
        .upsert(upsertData)
        .select()
        .single();

      if (error) throw error;

      // Save skills if provided
      if (skills && skills.length > 0 && data) {
        await supabase.from('vaga_skills').delete().eq('vaga_id', data.id);
        
        const validSkills = skills.filter(s => s.skill_name);
        if (validSkills.length > 0) {
          const skillsToInsert = validSkills.map(s => ({
            skill_name: s.skill_name!,
            skill_category: s.skill_category,
            nivel_minimo: s.nivel_minimo,
            obrigatoria: s.obrigatoria ?? true,
            vaga_id: data.id,
          }));
          await supabase.from('vaga_skills').insert(skillsToInsert);
        }
      }

      await fetchVagas();
      
      toast({
        title: 'Vaga salva',
        description: 'A vaga foi salva com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error saving vaga:', error);
      toast({
        title: 'Erro ao salvar vaga',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete vaga
  const deleteVaga = async (id: string) => {
    try {
      const { error } = await supabase.from('vagas').delete().eq('id', id);
      if (error) throw error;

      setVagas(prev => prev.filter(v => v.id !== id));
      
      toast({
        title: 'Vaga removida',
        description: 'A vaga foi removida com sucesso.',
      });
    } catch (error: any) {
      console.error('Error deleting vaga:', error);
      toast({
        title: 'Erro ao remover vaga',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Create candidatura
  const createCandidatura = async (candidatoId: string, vagaId: string) => {
    try {
      const ownerAdminId = user?.id;
      
      const { data, error } = await supabase
        .from('candidaturas')
        .insert({
          candidato_id: candidatoId,
          vaga_id: vagaId,
          owner_admin_id: ownerAdminId,
          etapa: 'triagem',
          status: 'em_analise',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCandidaturas();
      
      toast({
        title: 'Candidatura criada',
        description: 'O candidato foi inscrito na vaga com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating candidatura:', error);
      toast({
        title: 'Erro ao criar candidatura',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update candidatura etapa
  const updateCandidaturaEtapa = async (candidaturaId: string, etapa: EtapaCandidatura, status?: string) => {
    try {
      const updateData: any = { etapa, data_atualizacao: new Date().toISOString() };
      if (status) updateData.status = status;

      const { error } = await supabase
        .from('candidaturas')
        .update(updateData)
        .eq('id', candidaturaId);

      if (error) throw error;

      await fetchCandidaturas();
      
      toast({
        title: 'Etapa atualizada',
        description: 'A candidatura foi movida para a próxima etapa.',
      });
    } catch (error: any) {
      console.error('Error updating candidatura:', error);
      toast({
        title: 'Erro ao atualizar etapa',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update match score
  const updateMatchScore = async (candidaturaId: string, matchScore: number, matchDetalhes: any) => {
    try {
      const { error } = await supabase
        .from('candidaturas')
        .update({ 
          match_score: matchScore, 
          match_detalhes: matchDetalhes,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', candidaturaId);

      if (error) throw error;

      await fetchCandidaturas();
    } catch (error: any) {
      console.error('Error updating match score:', error);
    }
  };

  // Schedule entrevista
  const scheduleEntrevista = async (entrevista: Partial<Entrevista>) => {
    try {
      const { id, ...rest } = entrevista;
      const insertData: any = { ...rest, owner_admin_id: user?.id };
      
      const { data, error } = await supabase
        .from('entrevistas')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Entrevista agendada',
        description: 'A entrevista foi agendada com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error scheduling entrevista:', error);
      toast({
        title: 'Erro ao agendar entrevista',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Add feedback
  const addFeedback = async (feedback: Partial<CandidaturaFeedback>) => {
    try {
      const { id, created_at, ...rest } = feedback;
      const insertData: any = { ...rest, owner_admin_id: user?.id };
      
      const { data, error } = await supabase
        .from('candidatura_feedbacks')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Feedback registrado',
        description: 'O feedback foi registrado com sucesso.',
      });

      return data;
    } catch (error: any) {
      console.error('Error adding feedback:', error);
      toast({
        title: 'Erro ao registrar feedback',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchCandidatos(), fetchVagas(), fetchCandidaturas()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return {
    candidatos,
    vagas,
    candidaturas,
    loading,
    saveCandidato,
    deleteCandidato,
    saveVaga,
    deleteVaga,
    createCandidatura,
    updateCandidaturaEtapa,
    updateMatchScore,
    scheduleEntrevista,
    addFeedback,
    refetch: async () => {
      await Promise.all([fetchCandidatos(), fetchVagas(), fetchCandidaturas()]);
    },
  };
};
