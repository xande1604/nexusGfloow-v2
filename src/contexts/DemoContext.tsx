import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  hasCompletedLeadForm: boolean;
  setHasCompletedLeadForm: (value: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasCompletedLeadForm, setHasCompletedLeadForm] = useState(false);

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
      setHasCompletedLeadForm: handleSetHasCompletedLeadForm 
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
