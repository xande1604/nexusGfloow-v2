import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  hasCompletedLeadForm: boolean;
  setHasCompletedLeadForm: (value: boolean) => void;
  hasOwnData: boolean;
  isCheckingData: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasCompletedLeadForm, setHasCompletedLeadForm] = useState(false);
  const [hasOwnData, setHasOwnData] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(true);

  // Check if user has their own data (employees with their owner_admin_id)
  useEffect(() => {
    const checkUserData = async () => {
      if (!user?.id) {
        setHasOwnData(false);
        setIsCheckingData(false);
        return;
      }

      try {
        // Check if user has any employees assigned to them
        const { count, error } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          console.error('Error checking user data:', error);
          setHasOwnData(false);
        } else {
          // If count > 0, user has their own data
          setHasOwnData((count || 0) > 0);
          // Auto-enable demo mode if user has no data
          if ((count || 0) === 0) {
            setIsDemoMode(true);
          }
        }
      } catch (err) {
        console.error('Exception checking user data:', err);
        setHasOwnData(false);
      } finally {
        setIsCheckingData(false);
      }
    };

    checkUserData();
  }, [user?.id]);

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
      isCheckingData
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
