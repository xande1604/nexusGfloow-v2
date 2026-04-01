import { useState, useEffect } from 'react';
import { X, Check, Sparkles, Target, BookOpen, Wrench, Heart, DollarSign, Loader2 } from 'lucide-react';
import { JobRole, Skill } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: JobRole) => void;
  role: JobRole | null;
  skills: Skill[];
}

const levels: JobRole['level'][] = ['Estagiário', 'Trainee', 'Júnior', 'Pleno', 'Sênior', 'Master', 'Especialista', 'Tech Lead', 'Coordenador', 'Gerente', 'Diretor', 'C-Level'];
const departments = ['Tecnologia', 'Produto', 'Design', 'Marketing', 'Vendas', 'RH', 'Financeiro', 'Operações', 'Jurídico', 'Administrativo', 'Operacional'];

export const RoleFormModal = ({ isOpen, onClose, onSave, role, skills }: RoleFormModalProps) => {
  const { toast } = useToast();
  const [isRefining, setIsRefining] = useState(false);
  const [form, setForm] = useState<Partial<JobRole> & { is_active?: boolean }>({
    codigocargo: '',
    title: '',
    level: 'Pleno',
    department: 'Tecnologia',
    cbo: '',
    salaryRange: { min: 0, max: 0 },
    description: '',
    requiredSkillIds: [],
    technicalKnowledge: '',
    hardSkills: '',
    softSkills: '',
    keyDeliverables: '',
    titulolongocargo: '',
    entregas: '',
    tags: [],
    is_active: true,
  });

  const [baseSalary, setBaseSalary] = useState<number>(0);

  useEffect(() => {
    if (role) {
      setForm({ ...role, is_active: (role as any).is_active !== false });
      setBaseSalary(role.salaryRange?.min || 0);
    } else {
      setForm({
        codigocargo: '',
        title: '',
        level: 'Pleno',
        department: 'Tecnologia',
        cbo: '',
        salaryRange: { min: 0, max: 0 },
        description: '',
        requiredSkillIds: [],
        technicalKnowledge: '',
        hardSkills: '',
        softSkills: '',
        keyDeliverables: '',
        titulolongocargo: '',
        entregas: '',
        tags: [],
      });
      setBaseSalary(0);
    }
  }, [role, isOpen]);

  const handleRefineWithAI = async () => {
    if (!form.title?.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Preencha o título do cargo para usar a IA.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-role', {
        body: { 
          roleTitle: form.title,
          currentDescription: form.description 
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setForm(prev => ({
        ...prev,
        description: data.description || prev.description,
        technicalKnowledge: data.technicalKnowledge || prev.technicalKnowledge,
        hardSkills: data.hardSkills || prev.hardSkills,
        softSkills: data.softSkills || prev.softSkills,
        keyDeliverables: data.deliverables || prev.keyDeliverables,
      }));

      toast({
        title: 'Sugestões geradas',
        description: 'Revise e edite os campos conforme necessário.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao refinar',
        description: error.message || 'Não foi possível gerar sugestões.',
        variant: 'destructive',
      });
    } finally {
      setIsRefining(false);
    }
  };

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
      codigocargo: form.codigocargo || '',
      title: form.title || '',
      level: form.level || 'Pleno',
      department: form.department || 'Tecnologia',
      cbo: form.cbo,
      salaryRange: form.salaryRange || { min: 0, max: 0 },
      description: form.description || '',
      requiredSkillIds: form.requiredSkillIds || [],
      technicalKnowledge: form.technicalKnowledge,
      hardSkills: form.hardSkills,
      softSkills: form.softSkills,
      keyDeliverables: form.keyDeliverables,
      is_active: form.is_active,
    } as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-float w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
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
          {/* Code & Title */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Código do Cargo *</label>
              <input
                type="text"
                value={form.codigocargo || ''}
                onChange={(e) => setForm(prev => ({ ...prev, codigocargo: e.target.value }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: 001"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Título do Cargo *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: Desenvolvedor Full Stack"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nível Senioridade</label>
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
          </div>

          {/* Department & CBO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Departamento</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: Operacional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">CBO (Código Brasileiro de Ocupações)</label>
              <input
                type="text"
                value={form.cbo || ''}
                onChange={(e) => setForm(prev => ({ ...prev, cbo: e.target.value }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: 252210"
              />
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Faixa Salarial Estimada (R$)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.salaryRange?.min || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  salaryRange: { ...prev.salaryRange!, min: Number(e.target.value) } 
                }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="0"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="number"
                value={form.salaryRange?.max || ''}
                onChange={(e) => setForm(prev => ({ 
                  ...prev, 
                  salaryRange: { ...prev.salaryRange!, max: Number(e.target.value) } 
                }))}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Base Salary - Highlighted */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-brand-600 mb-1.5">
              <DollarSign className="w-4 h-4" />
              Salário Base / Alvo (Real)
            </label>
            <input
              type="number"
              value={baseSalary || ''}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="w-full h-10 px-3 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700 placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="Ex: 4500.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Este valor será usado nos cálculos de média salarial do dashboard se preenchido.
            </p>
          </div>

          {/* Skills Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tags de Habilidades (para Roadmap)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-lg border border-border min-h-[60px] max-h-40 overflow-y-auto">
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

          {/* Description with AI Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Descrição Detalhada do Cargo</label>
              <button
                type="button"
                onClick={handleRefineWithAI}
                disabled={isRefining}
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Refinar com IA
                  </>
                )}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-28 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              placeholder="Descreva as responsabilidades e desafios do cargo..."
            />
          </div>

          {/* 2x2 Grid: Key Deliverables, Technical Knowledge, Hard Skills, Soft Skills */}
          <div className="grid grid-cols-2 gap-4">
            {/* Key Deliverables */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Principais Entregas Esperadas
              </label>
              <textarea
                value={form.keyDeliverables || ''}
                onChange={(e) => setForm(prev => ({ ...prev, keyDeliverables: e.target.value }))}
                className="w-full h-20 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                placeholder="- Relatórios mensais de performance&#10;- Implementação de 2 novos projetos..."
              />
            </div>

            {/* Technical Knowledge */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Conhecimentos Técnicos
              </label>
              <textarea
                value={form.technicalKnowledge || ''}
                onChange={(e) => setForm(prev => ({ ...prev, technicalKnowledge: e.target.value }))}
                className="w-full h-20 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                placeholder="- Graduação em Ciência da Computação&#10;- Conhecimento em arquitetura de microsserviços..."
              />
            </div>

            {/* Hard Skills */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Hard Skills (Ferramentas)
              </label>
              <textarea
                value={form.hardSkills || ''}
                onChange={(e) => setForm(prev => ({ ...prev, hardSkills: e.target.value }))}
                className="w-full h-20 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                placeholder="- Excel Avançado&#10;- ReactJS, Node.js&#10;- Certificação AWS..."
              />
            </div>

            {/* Soft Skills */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Soft Skills (Comportamental)
              </label>
              <textarea
                value={form.softSkills || ''}
                onChange={(e) => setForm(prev => ({ ...prev, softSkills: e.target.value }))}
                className="w-full h-20 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                placeholder="- Liderança de equipes&#10;- Comunicação assertiva&#10;- Resolução de conflitos..."
              />
            </div>
          </div>

          {/* Active Flag */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Label htmlFor="role-is-active" className="text-sm font-medium">Cargo Ativo</Label>
            <Switch
              id="role-is-active"
              checked={form.is_active !== false}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-6 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-soft"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
