import { useState } from 'react';
import { Search, Mail, User, Calendar, Briefcase, Edit2, Check, X, UserCheck, Eye, BarChart3, Building2, Layers } from 'lucide-react';
import { Employee, JobRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeDetailsModal } from './EmployeeDetailsModal';
import { SkillGapReport } from './SkillGapReport';
import { useEmployeeSkills } from '@/hooks/useEmployeeSkills';
import { useCostCenters } from '@/hooks/useCostCenters';
import { useEmpresas } from '@/hooks/useEmpresas';

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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();
  const { skills: allEmployeeSkills } = useEmployeeSkills();
  const { costCenters } = useCostCenters();
  const { empresas } = useEmpresas();

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.title || roleId || 'Não definido';
  };

  const getCostCenterName = (codcentrodecustos?: string) => {
    if (!codcentrodecustos) return null;
    const cc = costCenters.find(c => c.codcentrodecustos === codcentrodecustos);
    return cc?.nomecentrodecustos || codcentrodecustos;
  };

  const getEmpresaName = (codempresa?: string) => {
    if (!codempresa) return null;
    const empresa = empresas.find(e => e.codempresa === codempresa);
    return empresa?.nomeempresa || codempresa;
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

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEmployee(null);
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
            Gerencie os colaboradores e analise gaps de habilidades
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="gap-report" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Gap de Habilidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 space-y-6">
          {/* Search and Stats for list view */}
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
              <table className="w-full min-w-[600px] md:min-w-0">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Colaborador
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Cargo
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                      Empresa
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                      Centro de Custos
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Gestor/Avaliador
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 md:w-24">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-brand-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-foreground text-sm md:text-base block truncate">{employee.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden truncate block">{getRoleName(employee.roleId)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{getRoleName(employee.roleId)}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {getEmpresaName((employee as any).codempresa) || (
                              <span className="italic">-</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Layers className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {getCostCenterName((employee as any).codcentrodecustos) || (
                              <span className="italic">-</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 hidden lg:table-cell">
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
                      <td className="px-3 md:px-4 py-3">
                        {editingId === employee.id ? (
                          <Input
                            type="email"
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            placeholder="email@empresa.com"
                            className="h-9 text-sm"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {employee.email ? (
                              <span className="text-foreground truncate max-w-[120px] md:max-w-none">{employee.email}</span>
                            ) : (
                              <span className="text-muted-foreground italic">Não cadastrado</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <TooltipProvider>
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
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleViewDetails(employee)}
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver perfil e habilidades</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleEditStart(employee)}
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-brand-600 hover:bg-brand-100 transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Editar email</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum colaborador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gap-report" className="mt-6">
          <SkillGapReport 
            employees={employees} 
            roles={roles} 
            allSkills={allEmployeeSkills} 
          />
        </TabsContent>
      </Tabs>

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        employee={selectedEmployee}
        roles={roles}
        employees={employees}
      />
    </div>
  );
};