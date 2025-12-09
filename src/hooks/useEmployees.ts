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
        .select('id, nome, codigocargo, matricula, dataadmissao, email, gestor_id')
        .not('nome', 'is', null)
        .order('nome');

      if (error) throw error;

      const mappedEmployees: (Employee & { gestorId?: string })[] = (data || []).map(emp => ({
        id: emp.id,
        name: emp.nome || '',
        roleId: emp.codigocargo || '',
        email: emp.email || '',
        admissionDate: emp.dataadmissao || '',
        gestorId: emp.gestor_id || undefined,
      }));

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeEmail = async (employeeId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ email })
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId ? { ...emp, email } : emp
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating employee email:', error);
      return { success: false, error };
    }
  };

  const updateEmployeeGestor = async (employeeId: string, gestorId: string | null) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ gestor_id: gestorId || null })
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId ? { ...emp, gestorId: gestorId || undefined } : emp
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating employee gestor:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, refetch: fetchEmployees, updateEmployeeEmail, updateEmployeeGestor };
};
