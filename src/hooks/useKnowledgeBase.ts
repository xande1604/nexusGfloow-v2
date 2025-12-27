import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KnowledgeBaseItem } from '@/types/tests';

export const useKnowledgeBase = () => {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: KnowledgeBaseItem[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        content: row.content || undefined,
        fileUrl: row.file_url || undefined,
        fileType: row.file_type || undefined,
        cargoId: row.cargo_id || undefined,
        costCenterId: row.cost_center_id || undefined,
        tags: row.tags || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setItems(mapped);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar base de conhecimento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (item: Omit<KnowledgeBaseItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('knowledge_base')
        .insert({
          title: item.title,
          description: item.description || null,
          content: item.content || null,
          file_url: item.fileUrl || null,
          file_type: item.fileType || null,
          cargo_id: item.cargoId || null,
          cost_center_id: item.costCenterId || null,
          tags: item.tags || [],
          owner_admin_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Conteúdo salvo',
        description: `"${item.title}" foi adicionado à base de conhecimento.`,
      });

      await fetchItems();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar conteúdo',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<KnowledgeBaseItem>) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({
          title: updates.title,
          description: updates.description || null,
          content: updates.content || null,
          file_url: updates.fileUrl || null,
          file_type: updates.fileType || null,
          cargo_id: updates.cargoId || null,
          cost_center_id: updates.costCenterId || null,
          tags: updates.tags || [],
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Conteúdo atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });

      await fetchItems();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar conteúdo',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Conteúdo excluído',
        description: 'O item foi removido da base de conhecimento.',
      });

      setItems(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir conteúdo',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('knowledge-base')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('knowledge-base')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    saveItem,
    updateItem,
    deleteItem,
    uploadFile,
    refetch: fetchItems,
  };
};
