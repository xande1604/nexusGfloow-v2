import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PricingProfileType = 'empresa_isolada' | 'consultor_revenda' | 'consultor_proprio';

export interface PricingProfile {
  id: string;
  profile_type: PricingProfileType;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export interface PricingQuestion {
  id: string;
  profile_type: PricingProfileType;
  question_text: string;
  question_type: 'text' | 'number' | 'select' | 'multiselect' | 'range';
  options: string[] | null;
  placeholder: string | null;
  is_required: boolean;
  display_order: number;
  metadata: Record<string, any> | null;
}

export interface PricingResponseSubmit {
  profile_type: PricingProfileType;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  responses: Record<string, any>;
}

export function usePricingQuestionnaire() {
  const [profiles, setProfiles] = useState<PricingProfile[]>([]);
  const [questions, setQuestions] = useState<PricingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [profilesRes, questionsRes] = await Promise.all([
        supabase
          .from('pricing_profiles')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('pricing_questions')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (questionsRes.error) throw questionsRes.error;

      setProfiles(profilesRes.data as PricingProfile[]);
      setQuestions(questionsRes.data.map(q => ({
        ...q,
        options: q.options ? (Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)) : null
      })) as PricingQuestion[]);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast.error('Erro ao carregar questionário');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionsForProfile = (profileType: PricingProfileType) => {
    return questions.filter(q => q.profile_type === profileType);
  };

  const submitResponse = async (data: PricingResponseSubmit) => {
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('pricing_responses')
        .insert({
          profile_type: data.profile_type,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          company_name: data.company_name || null,
          responses: data.responses
        });

      if (error) throw error;
      
      toast.success('Suas respostas foram enviadas! Entraremos em contato em breve.');
      return true;
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Erro ao enviar respostas. Tente novamente.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    profiles,
    questions,
    loading,
    submitting,
    getQuestionsForProfile,
    submitResponse,
    refetch: fetchData
  };
}
