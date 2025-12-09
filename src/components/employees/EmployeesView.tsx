import { useState } from 'react';
import { Search, Mail, User, Calendar, Briefcase, Edit2, Check, X, UserCheck } from 'lucide-react';
import { Employee, JobRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeesViewProps {
  employees: Employee[];
  roles: JobRole[];
  onUpdateEmail: (employeeId: string, email: string) => Promise<{ success: boolean; error?: any }>;
  onUpdateGestor?: (employeeId: string, gestorId: string | null) => Promise<{ success: boolean; error?: any }>;
}

export const EmployeesView = ({ employees, roles, onUpdateEmail, onUpdateGestor }: EmployeesViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState('');
  const [editingGestorId, setEditingGestorId] = useState<string | null>(null);
  const [selectedGestor, setSelectedGestor] = useState<string>('');
  const { toast } = useToast();

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.title || roleId || 'Não definido';
  };

  const getGestorName = (gestorId?: string) => {
    if (!gestorId) return null;
    const gestor = employees.find(e => e.id === gestorId);
    return gestor?.name || null;
  };

  const handleEditGestorStart = (employee: Employee & { gestorId?: string }) => {
    setEditingGestorId(employee.id);
    setSelectedGestor(employee.gestorId || '');
  };

  const handleEditGestorCancel = () => {
    setEditingGestorId(null);
    setSelectedGestor('');
  };

  const handleEditGestorSave = async (employeeId: string) => {
    if (!onUpdateGestor) return;
    
    const result = await onUpdateGestor(employeeId, selectedGestor === '__none__' ? null : selectedGestor || null);
    
    if (result.success) {
      toast({
        title: 'Gestor atualizado',
        description: 'O gestor do colaborador foi atualizado com sucesso.',
      });
      setEditingGestorId(null);
      setSelectedGestor('');
    } else {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o gestor.',
        variant: 'destructive',
      });
    }
  };

  const handleEditStart = (employee: Employee) => {
    setEditingId(employee.id);
    setEditingEmail(employee.email || '');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingEmail('');
  };

  const handleEditSave = async (employeeId: string) => {
    const result = await onUpdateEmail(employeeId, editingEmail);
    
    if (result.success) {
      toast({
        title: 'Email atualizado',
        description: 'O email do colaborador foi atualizado com sucesso.',
      });
      setEditingId(null);
      setEditingEmail('');
    } else {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o email do colaborador.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os emails dos colaboradores para autoavaliação
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Total de Colaboradores</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {employees.filter(e => e.email).length}
              </p>
              <p className="text-sm text-muted-foreground">Com Email Cadastrado</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {employees.filter(e => !e.email).length}
              </p>
              <p className="text-sm text-muted-foreground">Sem Email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Gestor/Avaliador
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email para Autoavaliação
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-600" />
                      </div>
                      <span className="font-medium text-foreground">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      {getRoleName(employee.roleId)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingGestorId === employee.id ? (
                      <div className="flex items-center gap-2">
                        <Select value={selectedGestor} onValueChange={setSelectedGestor}>
                          <SelectTrigger className="h-9 w-48">
                            <SelectValue placeholder="Selecione um gestor..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Nenhum</SelectItem>
                            {employees
                              .filter(e => e.id !== employee.id)
                              .map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => handleEditGestorSave(employee.id)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Salvar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleEditGestorCancel}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-brand-600 group"
                        onClick={() => handleEditGestorStart(employee as Employee & { gestorId?: string })}
                      >
                        <UserCheck className="w-4 h-4 text-muted-foreground group-hover:text-brand-600" />
                        {getGestorName((employee as Employee & { gestorId?: string }).gestorId) || (
                          <span className="text-muted-foreground italic">Não definido</span>
                        )}
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === employee.id ? (
                      <Input
                        type="email"
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        placeholder="email@empresa.com"
                        className="h-9"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {employee.email ? (
                          <span className="text-foreground">{employee.email}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Não cadastrado</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === employee.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(employee.id)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditStart(employee)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-brand-600 hover:bg-brand-100 transition-colors"
                          title="Editar email"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum colaborador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};