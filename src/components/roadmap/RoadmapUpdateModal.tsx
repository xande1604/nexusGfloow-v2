import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GraduationCap, Award, Sparkles, Loader2 } from 'lucide-react';
import { CareerRoadmap, Skill } from '@/types';
import { cn } from '@/lib/utils';

export interface PrefilledTrainingData {
  skills: string[];
  training: { name: string; date: string; institution?: string };
}

interface RoadmapUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: CareerRoadmap;
  availableSkills: Skill[];
  onUpdate: (data: RoadmapProgressData) => Promise<void>;
  prefilledData?: PrefilledTrainingData;
}

export interface RoadmapProgressData {
  acquiredSkills: string[];
  completedTrainings: { name: string; date: string; institution?: string }[];
  additionalNotes?: string;
}

export const RoadmapUpdateModal = ({
  isOpen,
  onClose,
  roadmap,
  availableSkills,
  onUpdate,
  prefilledData
}: RoadmapUpdateModalProps) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [trainings, setTrainings] = useState<{ name: string; date: string; institution?: string }[]>([
    { name: '', date: '', institution: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  // Reset form when modal opens, or prefill with data
  useEffect(() => {
    if (isOpen) {
      if (prefilledData) {
        setSelectedSkills(prefilledData.skills);
        setTrainings([prefilledData.training]);
        setAdditionalNotes(`Habilidades identificadas via IA a partir do treinamento "${prefilledData.training.name}".`);
      } else {
        setSelectedSkills([]);
        setTrainings([{ name: '', date: '', institution: '' }]);
        setAdditionalNotes('');
      }
      setSkillSearch('');
    }
  }, [isOpen, prefilledData]);

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.includes(skill.name)
  );

  const handleAddSkill = (skillName: string) => {
    setSelectedSkills(prev => [...prev, skillName]);
    setSkillSearch('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skillName));
  };

  const handleAddTraining = () => {
    setTrainings(prev => [...prev, { name: '', date: '', institution: '' }]);
  };

  const handleRemoveTraining = (index: number) => {
    setTrainings(prev => prev.filter((_, i) => i !== index));
  };

  const handleTrainingChange = (index: number, field: string, value: string) => {
    setTrainings(prev => prev.map((t, i) => 
      i === index ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = async () => {
    const validTrainings = trainings.filter(t => t.name.trim() !== '');
    
    if (selectedSkills.length === 0 && validTrainings.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate({
        acquiredSkills: selectedSkills,
        completedTrainings: validTrainings,
        additionalNotes: additionalNotes.trim() || undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-xl shadow-hard max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Atualizar Progresso</h2>
              <p className="text-sm text-muted-foreground">
                {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Acquired Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Award className="w-4 h-4 text-brand-600" />
              Habilidades Obtidas
            </label>
            
            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-brand-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Search */}
            <div className="relative">
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Buscar ou digitar habilidade..."
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              
              {skillSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-medium max-h-40 overflow-y-auto z-10">
                  {filteredSkills.length > 0 ? (
                    filteredSkills.slice(0, 5).map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => handleAddSkill(skill.name)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                      >
                        {skill.name}
                        <span className="text-xs text-muted-foreground ml-2">({skill.category})</span>
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => handleAddSkill(skillSearch)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar "{skillSearch}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Completed Trainings */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              Treinamentos Realizados
            </label>
            
            <div className="space-y-3">
              {trainings.map((training, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={training.name}
                      onChange={(e) => handleTrainingChange(index, 'name', e.target.value)}
                      placeholder="Nome do treinamento"
                      className="h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <input
                      type="text"
                      value={training.institution}
                      onChange={(e) => handleTrainingChange(index, 'institution', e.target.value)}
                      placeholder="Instituição (opcional)"
                      className="h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <input
                      type="date"
                      value={training.date}
                      onChange={(e) => handleTrainingChange(index, 'date', e.target.value)}
                      className="h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  {trainings.length > 1 && (
                    <button
                      onClick={() => handleRemoveTraining(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={handleAddTraining}
                className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar treinamento
              </button>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Observações Adicionais (opcional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Informações adicionais sobre o progresso do colaborador..."
              rows={3}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (selectedSkills.length === 0 && trainings.every(t => !t.name.trim()))}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              !isSubmitting && (selectedSkills.length > 0 || trainings.some(t => t.name.trim()))
                ? "bg-gradient-to-r from-brand-600 to-brand-700 text-primary-foreground hover:from-brand-700 hover:to-brand-800"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Atualizar Roadmap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
