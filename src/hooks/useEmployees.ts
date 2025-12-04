import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, nome, codigocargo, matricula, dataadmissao')
        .not('nome', 'is', null)
        .order('nome');

      if (error) throw error;

      const mappedEmployees: Employee[] = (data || []).map(emp => ({
        id: emp.id,
        name: emp.nome || '',
        roleId: emp.codigocargo || '',
        email: '',
        admissionDate: emp.dataadmissao || '',
      }));

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, refetch: fetchEmployees };
};
