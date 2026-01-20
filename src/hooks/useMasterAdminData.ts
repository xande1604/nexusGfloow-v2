import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  created_by_admin_id: string | null;
}

interface AccessKey {
  id: string;
  key_code: string;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface Environment {
  id: string;
  nomeempresa: string;
  codempresa: string;
  owner_admin_id: string | null;
  created_at: string;
  employeeCount?: number;
}

export interface PricingResponse {
  id: string;
  profile_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_name: string | null;
  responses: Record<string, any>;
  status: string | null;
  notes: string | null;
  created_at: string | null;
}

export const useMasterAdminData = () => {
  const { user } = useAuth();
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [pricingResponses, setPricingResponses] = useState<PricingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMasterAdmin = async () => {
      if (!user) {
        setIsMasterAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is master admin (no created_by_admin_id)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('created_by_admin_id, role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError || !roleData) {
          setIsMasterAdmin(false);
          setLoading(false);
          return;
        }

        // Master admin has no created_by_admin_id and role is admin
        const isMaster = roleData.role === 'admin' && roleData.created_by_admin_id === null;
        setIsMasterAdmin(isMaster);

        if (isMaster) {
          await fetchAllData();
        }
      } catch (err) {
        console.error('Error checking master admin:', err);
        setIsMasterAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkMasterAdmin();
  }, [user]);

  const fetchAllData = async () => {
    try {
      // Fetch all users with roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at, created_by_admin_id');

      if (rolesError) throw rolesError;

      // Fetch profiles for user names/emails
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name, created_at');

      if (profilesError) throw profilesError;

      // Combine data
      const combinedUsers: UserWithRole[] = (rolesData || []).map(role => {
        const profile = profilesData?.find(p => p.id === role.user_id);
        return {
          id: role.user_id,
          email: profile?.email || 'N/A',
          name: profile?.name || 'N/A',
          role: role.role,
          created_at: role.created_at || '',
          created_by_admin_id: role.created_by_admin_id
        };
      });
      setUsers(combinedUsers);

      // Fetch access keys
      const { data: keysData, error: keysError } = await supabase
        .from('access_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (!keysError && keysData) {
        setAccessKeys(keysData);
      }

      // Fetch environments (empresas)
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (!empresasError && empresasData) {
        // Get employee counts per environment
        const { data: employeeData } = await supabase
          .from('employees')
          .select('chave_empresa');

        const envWithCounts = empresasData.map(emp => ({
          ...emp,
          employeeCount: employeeData?.filter(e => e.chave_empresa === emp.codempresa).length || 0
        }));
        setEnvironments(envWithCounts);
      }

      // Fetch pricing responses
      const { data: pricingData, error: pricingError } = await supabase
        .from('pricing_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pricingError && pricingData) {
        setPricingResponses(pricingData as PricingResponse[]);
      }

    } catch (err) {
      console.error('Error fetching master admin data:', err);
    }
  };

  const refreshData = () => {
    if (isMasterAdmin) {
      fetchAllData();
    }
  };

  return {
    isMasterAdmin,
    users,
    accessKeys,
    environments,
    pricingResponses,
    loading,
    refreshData
  };
};
