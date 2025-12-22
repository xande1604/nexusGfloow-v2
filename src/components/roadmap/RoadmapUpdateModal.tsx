import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GraduationCap, Award, Sparkles, Loader2, CheckCircle2, BookOpen } from 'lucide-react';
import { CareerRoadmap, Skill } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PrefilledTrainingData {
  skills: string[];
  training: { name: string; date: string; institution?: string };
}

interface EmployeeTraining {
  id: string;
  nome_treinamento: string;
  instituicao: string | null;
  data_conclusao: string | null;
  status: string;
}

interface EmployeeSkill {
  id: string;
  skill_name: string;
  skill_category: string | null;
  source_name: string | null;
  acquired_at: string;
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
  const [activeTab, setActiveTab] = useState('manual');
  
  // Employee data from database
  const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedFromDB, setSelectedFromDB] = useState<{
    trainingIds: string[];
    skillIds: string[];
  }>({ trainingIds: [], skillIds: [] });

  // Fetch employee trainings and skills
  const fetchEmployeeData = async () => {
    if (!roadmap.employeeId) return;
    
    setLoadingData(true);
    try {
      // Fetch trainings
      const { data: trainingsData, error: trainingsError } = await supabase
        .from('treinamentos')
        .select('id, nome_treinamento, instituicao, data_conclusao, status')
        .eq('employee_id', roadmap.employeeId)
        .eq('status', 'concluido')
        .order('data_conclusao', { ascending: false });

      if (trainingsError) throw trainingsError;
      setEmployeeTrainings((trainingsData || []) as EmployeeTraining[]);

      // Fetch skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('employee_skills')
        .select('id, skill_name, skill_category, source_name, acquired_at')
        .eq('employee_id', roadmap.employeeId)
        .order('acquired_at', { ascending: false });

      if (skillsError) throw skillsError;
      setEmployeeSkills((skillsData || []) as EmployeeSkill[]);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Reset form when modal opens, or prefill with data
  useEffect(() => {
    if (isOpen) {
      if (prefilledData) {
        setSelectedSkills(prefilledData.skills);
        setTrainings([prefilledData.training]);
        setAdditionalNotes(`Habilidades identificadas via IA a partir do treinamento "${prefilledData.training.name}".`);
        setActiveTab('manual');
      } else {
        setSelectedSkills([]);
        setTrainings([{ name: '', date: '', institution: '' }]);
        setAdditionalNotes('');
        setActiveTab('registros');
      }
      setSkillSearch('');
      setSelectedFromDB({ trainingIds: [], skillIds: [] });
      fetchEmployeeData();
    }
  }, [isOpen, prefilledData, roadmap.employeeId]);

  const handleToggleTrainingFromDB = (training: EmployeeTraining) => {
    setSelectedFromDB(prev => {
      const isSelected = prev.trainingIds.includes(training.id);
      if (isSelected) {
        // Remove training
        setTrainings(t => t.filter(tr => tr.name !== training.nome_treinamento));
        return { ...prev, trainingIds: prev.trainingIds.filter(id => id !== training.id) };
      } else {
        // Add training
        const newTraining = {
          name: training.nome_treinamento,
          date: training.data_conclusao || '',
          institution: training.instituicao || ''
        };
        setTrainings(t => {
          const existing = t.filter(tr => tr.name.trim() !== '');
          return [...existing, newTraining];
        });
        return { ...prev, trainingIds: [...prev.trainingIds, training.id] };
      }
    });
  };

  const handleToggleSkillFromDB = (skill: EmployeeSkill) => {
    setSelectedFromDB(prev => {
      const isSelected = prev.skillIds.includes(skill.id);
      if (isSelected) {
        // Remove skill
        setSelectedSkills(s => s.filter(name => name !== skill.skill_name));
        return { ...prev, skillIds: prev.skillIds.filter(id => id !== skill.id) };
      } else {
        // Add skill
        if (!selectedSkills.includes(skill.skill_name)) {
          setSelectedSkills(s => [...s, skill.skill_name]);
        }
        return { ...prev, skillIds: [...prev.skillIds, skill.id] };
      }
    });
  };

  const handleSelectAllSkills = () => {
    const allSkillNames = employeeSkills.map(s => s.skill_name);
    const allSkillIds = employeeSkills.map(s => s.id);
    setSelectedSkills(prev => [...new Set([...prev, ...allSkillNames])]);
    setSelectedFromDB(prev => ({ ...prev, skillIds: allSkillIds }));
  };

  const handleSelectAllTrainings = () => {
    const allTrainingIds = employeeTrainings.map(t => t.id);
    const newTrainings = employeeTrainings.map(t => ({
      name: t.nome_treinamento,
      date: t.data_conclusao || '',
      institution: t.instituicao || ''
    }));
    setTrainings(newTrainings);
    setSelectedFromDB(prev => ({ ...prev, trainingIds: allTrainingIds }));
  };

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
          {/* Tabs for selecting source */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registros" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Dados Registrados
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Entrada Manual
              </TabsTrigger>
            </TabsList>

            {/* From Database Tab */}
            <TabsContent value="registros" className="mt-4 space-y-6">
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !roadmap.employeeId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Este roadmap não está vinculado a um colaborador.</p>
                  <p className="text-sm mt-1">Use a entrada manual para adicionar dados.</p>
                </div>
              ) : (
                <>
                  {/* Employee Skills from DB */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Award className="w-4 h-4 text-brand-600" />
                        Habilidades Adquiridas ({employeeSkills.length})
                      </label>
                      {employeeSkills.length > 0 && (
                        <button
                          onClick={handleSelectAllSkills}
                          className="text-xs text-primary hover:underline"
                        >
                          Selecionar todas
                        </button>
                      )}
                    </div>
                    
                    {employeeSkills.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">
                        Nenhuma habilidade registrada para este colaborador.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {employeeSkills.map(skill => (
                          <div
                            key={skill.id}
                            onClick={() => handleToggleSkillFromDB(skill)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                              selectedFromDB.skillIds.includes(skill.id)
                                ? "bg-brand-50 border-brand-300 dark:bg-brand-950/30 dark:border-brand-700"
                                : "bg-secondary/50 border-border hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                selectedFromDB.skillIds.includes(skill.id)
                                  ? "border-brand-600 bg-brand-600"
                                  : "border-muted-foreground"
                              )}>
                                {selectedFromDB.skillIds.includes(skill.id) && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{skill.skill_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {skill.skill_category && `${skill.skill_category} • `}
                                  {skill.source_name && `Fonte: ${skill.source_name}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Employee Trainings from DB */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <GraduationCap className="w-4 h-4 text-brand-600" />
                        Treinamentos Concluídos ({employeeTrainings.length})
                      </label>
                      {employeeTrainings.length > 0 && (
                        <button
                          onClick={handleSelectAllTrainings}
                          className="text-xs text-primary hover:underline"
                        >
                          Selecionar todos
                        </button>
                      )}
                    </div>
                    
                    {employeeTrainings.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">
                        Nenhum treinamento concluído para este colaborador.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {employeeTrainings.map(training => (
                          <div
                            key={training.id}
                            onClick={() => handleToggleTrainingFromDB(training)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                              selectedFromDB.trainingIds.includes(training.id)
                                ? "bg-brand-50 border-brand-300 dark:bg-brand-950/30 dark:border-brand-700"
                                : "bg-secondary/50 border-border hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                selectedFromDB.trainingIds.includes(training.id)
                                  ? "border-brand-600 bg-brand-600"
                                  : "border-muted-foreground"
                              )}>
                                {selectedFromDB.trainingIds.includes(training.id) && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{training.nome_treinamento}</p>
                                <p className="text-xs text-muted-foreground">
                                  {training.instituicao && `${training.instituicao} • `}
                                  {training.data_conclusao && format(new Date(training.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                              Concluído
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="mt-4 space-y-6">
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
            </TabsContent>
          </Tabs>

          {/* Summary of selections */}
          {(selectedSkills.length > 0 || trainings.some(t => t.name.trim())) && (
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Resumo da atualização:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {selectedSkills.length > 0 && (
                  <p>• {selectedSkills.length} habilidade{selectedSkills.length !== 1 ? 's' : ''} selecionada{selectedSkills.length !== 1 ? 's' : ''}</p>
                )}
                {trainings.filter(t => t.name.trim()).length > 0 && (
                  <p>• {trainings.filter(t => t.name.trim()).length} treinamento{trainings.filter(t => t.name.trim()).length !== 1 ? 's' : ''} selecionado{trainings.filter(t => t.name.trim()).length !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          )}

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
