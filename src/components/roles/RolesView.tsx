import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Briefcase, DollarSign, Users, LayoutGrid, List, Filter, ChevronDown } from 'lucide-react';
import { JobRole, Skill, Employee } from '@/types';
import { RoleFormModal } from './RoleFormModal';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedEmployee extends Employee {
  codcentrodecustos?: string;
  codempresa?: string;
}

interface RolesViewProps {
  roles: JobRole[];
  skills: Skill[];
  employees?: Employee[];
  onSaveRole: (role: JobRole) => void;
  onDeleteRole: (id: string) => void;
  onNavigateToEmployees?: (codigocargo: string) => void;
}

const levels = ['Estagiário', 'Trainee', 'Júnior', 'Pleno', 'Sênior', 'Master', 'Especialista', 'Tech Lead', 'Coordenador', 'Gerente', 'Diretor', 'C-Level'];

export const RolesView = ({ roles, skills, employees = [], onSaveRole, onDeleteRole, onNavigateToEmployees }: RolesViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);

  const extEmployees = employees as ExtendedEmployee[];

  // Fetch CC and empresa labels
  const [ccLabels, setCcLabels] = useState<Map<string, string>>(new Map());
  const [empresaLabels, setEmpresaLabels] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchLabels = async () => {
      const [{ data: ccData }, { data: empData }] = await Promise.all([
        supabase.from('centrodecustos').select('codcentrodecustos, nomecentrodecustos'),
        supabase.from('empresas').select('codempresa, nomeempresa'),
      ]);
      if (ccData) setCcLabels(new Map(ccData.map(c => [c.codcentrodecustos, `${c.codcentrodecustos} - ${c.nomecentrodecustos}`])));
      if (empData) setEmpresaLabels(new Map(empData.map(e => [e.codempresa, `${e.codempresa} - ${e.nomeempresa}`])));
    };
    fetchLabels();
  }, []);

  // Employee count per role
  const employeeCountByRole = useMemo(() => {
    const countMap = new Map<string, number>();
    extEmployees.forEach(emp => {
      if (emp.roleId) countMap.set(emp.roleId, (countMap.get(emp.roleId) || 0) + 1);
    });
    return countMap;
  }, [extEmployees]);

  const getEmployeeCount = (role: JobRole) => employeeCountByRole.get(role.codigocargo || '') || 0;

  // Derive filter options from employees
  const empresaOptions = useMemo(() => {
    const set = new Set<string>();
    extEmployees.forEach(e => { if (e.codempresa) set.add(e.codempresa); });
    return [...set].sort();
  }, [extEmployees]);

  const costCenterOptions = useMemo(() => {
    const set = new Set<string>();
    extEmployees.forEach(e => { if (e.codcentrodecustos) set.add(e.codcentrodecustos); });
    return [...set].sort();
  }, [extEmployees]);

  // Roles that have employees in selected empresa/CC
  const roleCodigosInEmpresa = useMemo(() => {
    if (!selectedEmpresa) return null;
    const set = new Set<string>();
    extEmployees.filter(e => e.codempresa === selectedEmpresa).forEach(e => { if (e.roleId) set.add(e.roleId); });
    return set;
  }, [extEmployees, selectedEmpresa]);

  const roleCodigosInCC = useMemo(() => {
    if (!selectedCostCenter) return null;
    const set = new Set<string>();
    extEmployees.filter(e => e.codcentrodecustos === selectedCostCenter).forEach(e => { if (e.roleId) set.add(e.roleId); });
    return set;
  }, [extEmployees, selectedCostCenter]);

  const departments = [...new Set(roles.map(r => r.department))];

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.codigocargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDepartment || role.department === selectedDepartment;
    const matchesLevel = !selectedLevel || role.level === selectedLevel;
    const matchesEmpresa = !roleCodigosInEmpresa || roleCodigosInEmpresa.has(role.codigocargo || '');
    const matchesCC = !roleCodigosInCC || roleCodigosInCC.has(role.codigocargo || '');
    return matchesSearch && matchesDept && matchesLevel && matchesEmpresa && matchesCC;
  });

  const handleEdit = (role: JobRole) => { setEditingRole(role); setIsModalOpen(true); };
  const handleCreate = () => { setEditingRole(null); setIsModalOpen(true); };
  const handleSave = (role: JobRole) => { onSaveRole(role); setIsModalOpen(false); setEditingRole(null); };

  const activeFiltersCount = [selectedDepartment, selectedLevel, selectedEmpresa, selectedCostCenter].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-brand-600 text-primary-foreground text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 transition-colors ${viewMode === 'cards' ? 'bg-brand-600 text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              title="Visualizar em cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-brand-600 text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              title="Visualizar em lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-primary-foreground rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" />
          Novo Cargo
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Departamento</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full h-9 px-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nível</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full h-9 px-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Empresa</label>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
              className="w-full h-9 px-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todas</option>
              {empresaOptions.map(e => <option key={e} value={e}>{empresaLabels.get(e) || e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Centro de Custos</label>
            <select
              value={selectedCostCenter}
              onChange={(e) => setSelectedCostCenter(e.target.value)}
              className="w-full h-9 px-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos</option>
              {costCenterOptions.map(c => <option key={c} value={c}>{ccLabels.get(c) || c}</option>)}
            </select>
          </div>
          {activeFiltersCount > 0 && (
            <div className="col-span-full flex justify-end">
              <button
                onClick={() => { setSelectedDepartment(''); setSelectedLevel(''); setSelectedEmpresa(''); setSelectedCostCenter(''); }}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Total de Cargos</p>
          <p className="text-2xl font-bold text-foreground">{filteredRoles.length}<span className="text-sm font-normal text-muted-foreground ml-1">/ {roles.length}</span></p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Departamentos</p>
          <p className="text-2xl font-bold text-foreground">{departments.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Menor Salário</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {filteredRoles.length > 0 ? Math.min(...filteredRoles.map(r => r.salaryRange.min)).toLocaleString('pt-BR') : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Maior Salário</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {filteredRoles.length > 0 ? Math.max(...filteredRoles.map(r => r.salaryRange.max)).toLocaleString('pt-BR') : 0}
          </p>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRoles.map((role, index) => (
            <div
              key={role.id}
              className="bg-card rounded-xl p-5 shadow-soft hover:shadow-medium transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-brand-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(role)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteRole(role.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-0.5">{role.codigocargo ? `${role.codigocargo} - ` : ''}{role.titulolongocargo || role.title}</h3>
              {role.titulolongocargo && role.titulolongocargo !== role.title && (
                <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                  <span className="font-medium">Título reduzido:</span> {role.title}
                </p>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">{role.level}</span>
                <span className="text-xs text-muted-foreground">{role.department}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{role.description || 'Sem descrição'}</p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-success">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {role.salaryRange.min.toLocaleString('pt-BR')} - {role.salaryRange.max.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1 text-muted-foreground ${getEmployeeCount(role) > 0 && onNavigateToEmployees ? 'cursor-pointer hover:text-brand-600 transition-colors' : ''}`}
                    onClick={() => { if (getEmployeeCount(role) > 0 && onNavigateToEmployees && role.codigocargo) onNavigateToEmployees(role.codigocargo); }}
                    title={getEmployeeCount(role) > 0 ? 'Ver colaboradores deste cargo' : ''}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">{getEmployeeCount(role)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{role.requiredSkillIds.length} skills</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Título</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Nível</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Departamento</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Faixa Salarial</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Colaboradores</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => {
                  const empCount = getEmployeeCount(role);
                  return (
                    <tr key={role.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{role.codigocargo || '-'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium text-foreground">{role.title}</span>
                          {role.titulolongocargo && role.titulolongocargo !== role.title && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{role.titulolongocargo}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">{role.level}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{role.department}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-success">
                          R$ {role.salaryRange.min.toLocaleString('pt-BR')} - {role.salaryRange.max.toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${empCount > 0 && onNavigateToEmployees ? 'cursor-pointer text-brand-600 hover:text-brand-700 font-medium' : 'text-muted-foreground'}`}
                          onClick={() => { if (empCount > 0 && onNavigateToEmployees && role.codigocargo) onNavigateToEmployees(role.codigocargo); }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {empCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(role)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteRole(role.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRoles.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl">
          <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum cargo encontrado</p>
          <button onClick={handleCreate} className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium">
            Criar primeiro cargo
          </button>
        </div>
      )}

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRole(null); }}
        onSave={handleSave}
        role={editingRole}
        skills={skills}
      />
    </div>
  );
};
