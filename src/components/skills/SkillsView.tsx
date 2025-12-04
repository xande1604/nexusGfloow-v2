import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Sparkles, Code, Heart, Globe, Crown } from 'lucide-react';
import { Skill } from '@/types';
import { cn } from '@/lib/utils';

interface SkillsViewProps {
  skills: Skill[];
  onSaveSkill: (skill: Skill) => void;
  onDeleteSkill: (id: string) => void;
}

const categories: { value: Skill['category']; label: string; icon: typeof Code; color: string }[] = [
  { value: 'Technical', label: 'Técnica', icon: Code, color: 'bg-brand-100 text-brand-600' },
  { value: 'Soft Skill', label: 'Comportamental', icon: Heart, color: 'bg-emerald-100 text-emerald-600' },
  { value: 'Language', label: 'Idioma', icon: Globe, color: 'bg-amber-100 text-amber-600' },
  { value: 'Leadership', label: 'Liderança', icon: Crown, color: 'bg-violet-100 text-violet-600' },
];

export const SkillsView = ({ skills, onSaveSkill, onDeleteSkill }: SkillsViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Skill['category'] | ''>('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical' as Skill['category'], description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedSkills = categories.map(cat => ({
    ...cat,
    skills: filteredSkills.filter(s => s.category === cat.value)
  }));

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      onSaveSkill({
        id: crypto.randomUUID(),
        name: newSkill.name,
        category: newSkill.category,
        description: newSkill.description,
      });
      setNewSkill({ name: '', category: 'Technical', description: '' });
      setIsAdding(false);
    }
  };

  const getCategoryIcon = (category: Skill['category']) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || Sparkles;
  };

  const getCategoryColor = (category: Skill['category']) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-secondary text-muted-foreground';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar habilidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Skill['category'] | '')}
            className="h-10 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-primary-foreground rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" />
          Nova Habilidade
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-card rounded-xl p-5 shadow-medium animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Adicionar Habilidade</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da habilidade"
              className="h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              autoFocus
            />
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value as Skill['category'] }))}
              className="h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddSkill}
                className="flex-1 h-10 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewSkill({ name: '', category: 'Technical', description: '' }); }}
                className="h-10 px-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
            !selectedCategory 
              ? "bg-brand-600 text-primary-foreground shadow-soft" 
              : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Todas ({skills.length})
        </button>
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = skills.filter(s => s.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                selectedCategory === cat.value
                  ? "bg-brand-600 text-primary-foreground shadow-soft" 
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Skills Grid by Category */}
      <div className="space-y-6">
        {groupedSkills.map(group => {
          if (group.skills.length === 0) return null;
          const Icon = group.icon;
          
          return (
            <div key={group.value} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", group.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{group.label}</h3>
                <span className="text-sm text-muted-foreground">({group.skills.length})</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border hover:border-brand-300 transition-all animate-scale-in shadow-soft"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDeleteSkill(skill.id)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl">
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma habilidade encontrada</p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Adicionar primeira habilidade
          </button>
        </div>
      )}
    </div>
  );
};
