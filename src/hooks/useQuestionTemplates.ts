import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuestionTemplate {
  id: string;
  question: string;
  category: 'Technical' | 'Cultural' | 'Soft Skill' | 'Goal';
  type: 'rating' | 'text';
  isDefault: boolean;
}

export const useQuestionTemplates = () => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('review_question_templates')
        .select('*')
        .order('category')
        .order('created_at');

      if (error) throw error;

      const mapped: QuestionTemplate[] = (data || []).map(t => ({
        id: t.id,
        question: t.question,
        category: t.category as QuestionTemplate['category'],
        type: t.type as QuestionTemplate['type'],
        isDefault: t.is_default || false,
      }));

      setTemplates(mapped);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Omit<QuestionTemplate, 'id' | 'isDefault'>) => {
    try {
      const { error } = await supabase
        .from('review_question_templates')
        .insert({
          question: template.question,
          category: template.category,
          type: template.type,
          is_default: false,
        });

      if (error) throw error;

      toast({
        title: 'Template salvo',
        description: 'O template foi adicionado à biblioteca.',
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o template.',
        variant: 'destructive',
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('review_question_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Template excluído',
        description: 'O template foi removido.',
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o template.',
        variant: 'destructive',
      });
    }
  };

  const getTemplatesByCategory = (category: QuestionTemplate['category']) => {
    return templates.filter(t => t.category === category);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    saveTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    refetch: fetchTemplates,
  };
};
