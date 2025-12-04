import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { JobRole, Skill } from '@/types';
import { cn } from '@/lib/utils';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: JobRole) => void;
  role: JobRole | null;
  skills: Skill[];
}

const levels: JobRole['level'][] = ['Estagiário', 'Trainee', 'Júnior', 'Pleno', 'Sênior', 'Master', 'Especialista', 'Tech Lead', 'Coordenador', 'Gerente', 'Diretor', 'C-Level'];
const departments = ['Tecnologia', 'Produto', 'Design', 'Marketing', 'Vendas', 'RH', 'Financeiro', 'Operações', 'Jurídico', 'Administrativo'];

export const RoleFormModal = ({ isOpen, onClose, onSave, role, skills }: RoleFormModalProps) => {
  const [form, setForm] = useState<Partial<JobRole>>({
    title: '',
    level: 'Pleno',
    department: 'Tecnologia',
    salaryRange: { min: 0, max: 0 },
    description: '',
    requiredSkillIds: [],
  });

  useEffect(() => {
    if (role) {
      setForm(role);
    } else {
      setForm({
        title: '',
        level: 'Pleno',
        department: 'Tecnologia',
        salaryRange: { min: 0, max: 0 },
        description: '',
        requiredSkillIds: [],
      });
    }
  }, [role, isOpen]);

  const toggleSkill = (skillId: string) => {
    setForm(prev => ({
      ...prev,
      requiredSkillIds: prev.requiredSkillIds?.includes(skillId)
        ? prev.requiredSkillIds.filter(id => id !== skillId)
        : [...(prev.requiredSkillIds || []), skillId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: role?.id || crypto.randomUUID(),
      title: form.title || '',
      level: form.level || 'Pleno',
      department: form.department || 'Tecnologia',
      salaryRange: form.salaryRange || { min: 0, max: 0 },
      description: form.description || '',
      requiredSkillIds: form.requiredSkillIds || [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-float w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">
            {role ? 'Editar Cargo' : 'Novo Cargo'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Título do Cargo</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Ex: Desenvolvedor Full Stack"
              required
            />
          </div>

          {/* Level & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nível</label>
              <select
                value={form.level}
                onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value as JobRole['level'] }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Departamento</label>
              <select
                value={form.department}
                onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Salário Mínimo (R$)</label>
              <input
                type="number"
                value={form.salaryRange?.min || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  salaryRange: { ...prev.salaryRange!, min: Number(e.target.value) } 
                }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: 5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Salário Máximo (R$)</label>
              <input
                type="number"
                value={form.salaryRange?.max || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  salaryRange: { ...prev.salaryRange!, max: Number(e.target.value) } 
                }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: 8000"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              placeholder="Descreva as responsabilidades e requisitos do cargo..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Habilidades Requeridas ({form.requiredSkillIds?.length || 0} selecionadas)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg max-h-40 overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada</p>
              ) : (
                skills.map(skill => {
                  const isSelected = form.requiredSkillIds?.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        isSelected
                          ? "bg-brand-100 text-brand-700 border border-brand-300"
                          : "bg-card text-muted-foreground border border-border hover:border-brand-300 hover:text-brand-600"
                      )}
                    >
                      {skill.name}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-5 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-soft"
            >
              {role ? 'Salvar Alterações' : 'Criar Cargo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
