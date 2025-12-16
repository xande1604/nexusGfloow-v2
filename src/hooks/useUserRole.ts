import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasAccess(false);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking user role:', error);
          setHasAccess(false);
          setRole(null);
        } else if (data) {
          setHasAccess(true);
          setRole(data.role);
        } else {
          // User has no role assigned
          setHasAccess(false);
          setRole(null);
        }
      } catch (err) {
        console.error('Exception checking user role:', err);
        setHasAccess(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, authLoading]);

  return { hasAccess, role, loading };
};
