import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Briefcase, DollarSign, Filter, Users } from 'lucide-react';
import { JobRole, Skill, Employee } from '@/types';
import { cn } from '@/lib/utils';
import { RoleFormModal } from './RoleFormModal';

interface RolesViewProps {
  roles: JobRole[];
  skills: Skill[];
  employees?: Employee[];
  onSaveRole: (role: JobRole) => void;
  onDeleteRole: (id: string) => void;
}

const levels = ['Estagiário', 'Trainee', 'Júnior', 'Pleno', 'Sênior', 'Master', 'Especialista', 'Tech Lead', 'Coordenador', 'Gerente', 'Diretor', 'C-Level'];

export const RolesView = ({ roles, skills, employees = [], onSaveRole, onDeleteRole }: RolesViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);

  // Calculate employee count per role
  const employeeCountByRole = useMemo(() => {
    const countMap = new Map<string, number>();
    employees.forEach(emp => {
      if (emp.roleId) {
        countMap.set(emp.roleId, (countMap.get(emp.roleId) || 0) + 1);
      }
    });
    return countMap;
  }, [employees]);

  const departments = [...new Set(roles.map(r => r.department))];
  
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || role.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleEdit = (role: JobRole) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleSave = (role: JobRole) => {
    onSaveRole(role);
    setIsModalOpen(false);
    setEditingRole(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cargos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="h-10 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Todos departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-primary-foreground rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" />
          Novo Cargo
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Total de Cargos</p>
          <p className="text-2xl font-bold text-foreground">{roles.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Departamentos</p>
          <p className="text-2xl font-bold text-foreground">{departments.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Menor Salário</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {roles.length > 0 ? Math.min(...roles.map(r => r.salaryRange.min)).toLocaleString('pt-BR') : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl shadow-soft">
          <p className="text-xs text-muted-foreground mb-1">Maior Salário</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {roles.length > 0 ? Math.max(...roles.map(r => r.salaryRange.max)).toLocaleString('pt-BR') : 0}
          </p>
        </div>
      </div>

      {/* Roles Grid */}
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
                <button
                  onClick={() => handleEdit(role)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteRole(role.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">{role.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">
                {role.level}
              </span>
              <span className="text-xs text-muted-foreground">{role.department}</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {role.description || 'Sem descrição'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-success">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {role.salaryRange.min.toLocaleString('pt-BR')} - {role.salaryRange.max.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {employeeCountByRole.get(role.id) || 0}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {role.requiredSkillIds.length} skills
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl">
          <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum cargo encontrado</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Criar primeiro cargo
          </button>
        </div>
      )}

      {/* Modal */}
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
