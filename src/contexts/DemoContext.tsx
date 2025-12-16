import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  hasCompletedLeadForm: boolean;
  setHasCompletedLeadForm: (value: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasCompletedLeadForm, setHasCompletedLeadForm] = useState(() => {
    return localStorage.getItem('gfloow_demo_lead') === 'true';
  });

  const handleSetHasCompletedLeadForm = (value: boolean) => {
    setHasCompletedLeadForm(value);
    if (value) {
      localStorage.setItem('gfloow_demo_lead', 'true');
    } else {
      localStorage.removeItem('gfloow_demo_lead');
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
