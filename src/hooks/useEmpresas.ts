import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Empresa {
  codempresa: string;
  nomeempresa: string;
}

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('codempresa, nomeempresa')
        .order('nomeempresa');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Error fetching empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { empresas, loading };
};
