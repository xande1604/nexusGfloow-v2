import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const DEMO_EMAIL = 'demo@gfloow.com.br';

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  hasCompletedLeadForm: boolean;
  setHasCompletedLeadForm: (value: boolean) => void;
  hasOwnData: boolean;
  isCheckingData: boolean;
  isDemoUser: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasCompletedLeadForm, setHasCompletedLeadForm] = useState(false);
  const [hasOwnData, setHasOwnData] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(true);

  const isDemoUser = user?.email === DEMO_EMAIL;

  // Auto-enable demo mode for demo user
  useEffect(() => {
    if (isDemoUser) {
      setIsDemoMode(true);
      setHasOwnData(false);
      setIsCheckingData(false);
      setHasCompletedLeadForm(true); // Skip lead form for demo user
      return;
    }
  }, [isDemoUser]);

  // Check if user has their own data (employees with their owner_admin_id)
  useEffect(() => {
    if (isDemoUser) return; // Skip for demo user
    
    const checkUserData = async () => {
      if (!user?.id) {
        setHasOwnData(false);
        setIsCheckingData(false);
        return;
      }

      try {
        // First check if user has a role assigned — if so, never force demo mode
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleData) {
          // User has a role: check employee count just to set hasOwnData, but never force demo mode
          const { count } = await supabase
            .from('nexus_employees')
            .select('*', { count: 'exact', head: true })
            .limit(1);
          setHasOwnData((count || 0) > 0);
          setIsDemoMode(false);
        } else {
          // No role assigned — activate demo mode
          setHasOwnData(false);
          setIsDemoMode(true);
        }
      } catch (err) {
        console.error('Exception checking user data:', err);
        setHasOwnData(false);
      } finally {
        setIsCheckingData(false);
      }
    };

    checkUserData();
  }, [user?.id, isDemoUser]);

  // Load lead form status based on user ID
  useEffect(() => {
    if (user?.id) {
      const key = `gfloow_demo_lead_${user.id}`;
      const completed = localStorage.getItem(key) === 'true';
      setHasCompletedLeadForm(completed);
    } else {
      setHasCompletedLeadForm(false);
    }
  }, [user?.id]);

  const handleSetHasCompletedLeadForm = (value: boolean) => {
    setHasCompletedLeadForm(value);
    if (user?.id) {
      const key = `gfloow_demo_lead_${user.id}`;
      if (value) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.removeItem(key);
      }
    }
  };

  return (
    <DemoContext.Provider value={{ 
      isDemoMode, 
      setIsDemoMode, 
      hasCompletedLeadForm, 
      setHasCompletedLeadForm: handleSetHasCompletedLeadForm,
      hasOwnData,
      isCheckingData,
      isDemoUser
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return context;
};
