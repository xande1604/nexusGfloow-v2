import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface PendingMember {
  id: string;
  email: string;
  name: string;
  pending_role: string | null;
  requested_at: string | null;
}

export interface TeamAccessKey {
  id: string;
  key_code: string;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export const useTeamManagement = (isAdmin: boolean) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [accessKeys, setAccessKeys] = useState<TeamAccessKey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      setLoading(true);

      // Fetch team members (users created_by this admin)
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('created_by_admin_id', user.id);

      if (rolesData && rolesData.length > 0) {
        const userIds = rolesData.map(r => r.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, name')
          .in('id', userIds);

        const combined: TeamMember[] = rolesData.map(r => {
          const profile = profilesData?.find(p => p.id === r.user_id);
          return {
            id: r.user_id,
            email: profile?.email || 'N/A',
            name: profile?.name || 'N/A',
            role: r.role,
            created_at: r.created_at || '',
          };
        });
        setMembers(combined);
      } else {
        setMembers([]);
      }

      // Fetch pending members requesting to join this admin
      const { data: pendingData } = await supabase
        .from('profiles')
        .select('id, email, name, pending_role, requested_at')
        .eq('pending_admin_id', user.id);

      setPendingMembers(pendingData || []);

      // Fetch access keys created by this admin
      const { data: keysData } = await supabase
        .from('access_keys')
        .select('*')
        .eq('created_by_admin_id', user.id)
        .order('created_at', { ascending: false });

      setAccessKeys(keysData || []);

    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateKey = async (targetRole: string, expiresInDays?: number) => {
    if (!user) return null;
    try {
      const key_code = `${targetRole.toUpperCase().slice(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const expires_at = expiresInDays
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null;

      const { error } = await supabase
        .from('access_keys')
        .insert({
          key_code,
          created_by_admin_id: user.id,
          expires_at,
          is_used: false,
        });

      if (error) throw error;
      toast.success('Chave gerada com sucesso!');
      await fetchData();
      return key_code;
    } catch (err) {
      toast.error('Erro ao gerar chave');
      return null;
    }
  };

  const deleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase.from('access_keys').delete().eq('id', keyId);
      if (error) throw error;
      toast.success('Chave removida');
      await fetchData();
    } catch (err) {
      toast.error('Erro ao remover chave');
    }
  };

  const approveMember = async (userId: string, role: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('approve-team-member', {
        body: { user_id: userId, role, action: 'approve' },
      });
      if (error) throw error;
      toast.success('Membro aprovado com sucesso!');
      await fetchData();
    } catch (err) {
      toast.error('Erro ao aprovar membro');
    }
  };

  const rejectMember = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('approve-team-member', {
        body: { user_id: userId, action: 'reject' },
      });
      if (error) throw error;
      toast.success('Solicitação recusada');
      await fetchData();
    } catch (err) {
      toast.error('Erro ao recusar solicitação');
    }
  };

  const updateMemberRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId)
        .eq('created_by_admin_id', user!.id);
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
      await fetchData();
    } catch (err) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('created_by_admin_id', user!.id);
      if (error) throw error;
      toast.success('Membro removido');
      await fetchData();
    } catch (err) {
      toast.error('Erro ao remover membro');
    }
  };

  return {
    members,
    pendingMembers,
    accessKeys,
    loading,
    generateKey,
    deleteKey,
    approveMember,
    rejectMember,
    removeMember,
    refresh: fetchData,
  };
};
