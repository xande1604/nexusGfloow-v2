import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';
import { fetchAllRows } from '@/lib/fetchAllRows';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const data = await fetchAllRows('nexus_employees', {
        select: 'id, nome, codigocargo, matricula, dataadmissao, email, gestor_id, codcentrodecustos, codempresa',
        order: { column: 'nome', ascending: true },
        filters: (q: any) => q.not('nome', 'is', null),
      });

      const mappedEmployees: (Employee & { gestorId?: string; codcentrodecustos?: string; codempresa?: string })[] = (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.nome || '',
        roleId: emp.codigocargo || '',
        email: emp.email || '',
        admissionDate: emp.dataadmissao || '',
        gestorId: emp.gestor_id || undefined,
        codcentrodecustos: emp.codcentrodecustos || undefined,
        codempresa: emp.codempresa || undefined,
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

  const createEmployee = async (data: {
    nome: string;
    email?: string;
    codigocargo?: string;
    dataadmissao?: string;
    codempresa?: string;
    codcentrodecustos?: string;
    matricula?: string;
  }) => {
    try {
      // Get owner_admin_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('created_by_admin_id, role')
        .eq('user_id', user.id)
        .single();

      const ownerAdminId = roleData?.created_by_admin_id || user.id;

      // Build chave_empresa
      const chave_empresa = data.codempresa
        ? `${ownerAdminId}_${data.codempresa}`
        : `${ownerAdminId}_MANUAL`;

      const { error } = await supabase
        .from('employees')
        .insert({
          nome: data.nome,
          email: data.email || null,
          codigocargo: data.codigocargo || null,
          dataadmissao: data.dataadmissao || null,
          codempresa: data.codempresa || null,
          codcentrodecustos: data.codcentrodecustos || null,
          matricula: data.matricula || null,
          chave_empresa,
          owner_admin_id: ownerAdminId,
        });

      if (error) throw error;

      await fetchEmployees();
      return { success: true };
    } catch (error) {
      console.error('Error creating employee:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, refetch: fetchEmployees, updateEmployeeEmail, updateEmployeeGestor, createEmployee };
};
