import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Star, Sparkles, Loader2, FileText, Check } from 'lucide-react';
import { Employee, JobRole } from '@/types';
import { ReviewQuestion, ReviewResponse } from '@/hooks/usePerformanceReviews';
import { useQuestionTemplates, QuestionTemplate } from '@/hooks/useQuestionTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompanyContext {
  mission?: string;
  values?: string[];
}

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    employeeId: string;
    date: string;
    status: 'PendingSelf' | 'PendingManager' | 'Completed';
    questions: ReviewQuestion[];
    responses: ReviewResponse[];
    overallFeedback: string | null;
  }) => void;
  employees: Employee[];
  roles: JobRole[];
  companyContext?: CompanyContext;
  defaultQuestions: ReviewQuestion[];
}

const CATEGORIES: QuestionTemplate['category'][] = ['Technical', 'Cultural', 'Soft Skill', 'Goal'];

export const ReviewFormModal = ({
  isOpen,
  onClose,
  onSave,
  employees,
  roles,
  companyContext,
  defaultQuestions,
}: ReviewFormModalProps) => {
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'rating' | 'text'>('text');
  const [newQuestionCategory, setNewQuestionCategory] = useState<QuestionTemplate['category']>('Technical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'custom'>('templates');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const { templates, loading: templatesLoading, saveTemplate } = useQuestionTemplates();

  useEffect(() => {
    if (isOpen && templates.length > 0 && questions.length === 0) {
      // Pre-select some default templates
      const defaultTemplates = templates.filter(t => t.isDefault).slice(0, 6);
      const newSelectedIds = new Set(defaultTemplates.map(t => t.id));
      setSelectedTemplateIds(newSelectedIds);
      setQuestions(defaultTemplates.map((t, i) => ({
        id: `template-${t.id}`,
        question: t.question,
        type: t.type,
        category: t.category,
      } as ReviewQuestion & { category?: string })));
    }
  }, [isOpen, templates]);

  if (!isOpen) return null;

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  const handleToggleTemplate = (template: QuestionTemplate) => {
    const newSelected = new Set(selectedTemplateIds);
    if (newSelected.has(template.id)) {
      newSelected.delete(template.id);
      setQuestions(questions.filter(q => q.id !== `template-${template.id}`));
    } else {
      newSelected.add(template.id);
      setQuestions([...questions, {
        id: `template-${template.id}`,
        question: template.question,
        type: template.type,
        category: template.category,
      } as ReviewQuestion & { category?: string }]);
    }
    setSelectedTemplateIds(newSelected);
  };

  const handleSelectAllCategory = (category: QuestionTemplate['category']) => {
    const categoryTemplates = templates.filter(t => t.category === category);
    const allSelected = categoryTemplates.every(t => selectedTemplateIds.has(t.id));
    
    const newSelected = new Set(selectedTemplateIds);
    const newQuestions = [...questions];
    
    categoryTemplates.forEach(t => {
      if (allSelected) {
        newSelected.delete(t.id);
        const idx = newQuestions.findIndex(q => q.id === `template-${t.id}`);
        if (idx >= 0) newQuestions.splice(idx, 1);
      } else if (!newSelected.has(t.id)) {
        newSelected.add(t.id);
        newQuestions.push({
          id: `template-${t.id}`,
          question: t.question,
          type: t.type,
          category: t.category,
        } as ReviewQuestion & { category?: string });
      }
    });
    
    setSelectedTemplateIds(newSelected);
    setQuestions(newQuestions);
  };

  const handleGenerateWithAI = async () => {
    if (!selectedRole) {
      toast({
        title: 'Selecione um cargo',
        description: 'Escolha um cargo para gerar perguntas personalizadas.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-review-questions', {
        body: {
          roleTitle: selectedRole.title,
          roleDescription: selectedRole.description,
          hardSkills: selectedRole.hardSkills,
          softSkills: selectedRole.softSkills,
          technicalKnowledge: selectedRole.technicalKnowledge,
          companyValues: companyContext?.values,
          companyMission: companyContext?.mission,
        }
      });

      if (error) throw error;

      if (data.questions && Array.isArray(data.questions)) {
        const mappedQuestions = data.questions.map((q: any, index: number) => ({
          id: `ai-${index + 1}`,
          question: q.question,
          type: q.type === 'rating' ? 'rating' : 'text',
          category: q.category,
        }));
        setQuestions(mappedQuestions);
        setSelectedTemplateIds(new Set());
        setResponses([]);
        toast({
          title: 'Perguntas geradas',
          description: `${mappedQuestions.length} perguntas criadas com IA.`,
        });
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Erro ao gerar perguntas',
        description: error.message || 'Não foi possível gerar as perguntas.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const question = {
        id: `custom-${Date.now()}`,
        question: newQuestion.trim(),
        type: newQuestionType,
        category: newQuestionCategory,
      } as ReviewQuestion & { category?: string };
      setQuestions([...questions, question]);
      setNewQuestion('');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (newQuestion.trim()) {
      await saveTemplate({
        question: newQuestion.trim(),
        type: newQuestionType,
        category: newQuestionCategory,
      });
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (id.startsWith('template-')) {
      const templateId = id.replace('template-', '');
      const newSelected = new Set(selectedTemplateIds);
      newSelected.delete(templateId);
      setSelectedTemplateIds(newSelected);
    }
    setResponses(responses.filter(r => r.questionId !== id));
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Technical': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cultural': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Soft Skill': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Goal': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Technical': return 'Técnica';
      case 'Cultural': return 'Cultural';
      case 'Soft Skill': return 'Soft Skill';
      case 'Goal': return 'Objetivos';
      default: return category;
    }
  };

  const handleSubmit = () => {
    if (!employeeId || questions.length === 0) {
      toast({
        title: 'Dados incompletos',
        description: 'Selecione um colaborador e adicione pelo menos uma pergunta.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      employeeId,
      date,
      status: 'PendingSelf',
      questions,
      responses,
      overallFeedback: overallFeedback || null,
    });

    // Reset form
    setEmployeeId('');
    setSelectedRoleId('');
    setDate(new Date().toISOString().split('T')[0]);
    setQuestions([]);
    setSelectedTemplateIds(new Set());
    setResponses([]);
    setOverallFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Nova Avaliação de Desempenho</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Colaborador *</label>
              <select
                value={employeeId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setEmployeeId(selectedId);
                  if (selectedId) {
                    const selectedEmployee = employees.find(emp => emp.id === selectedId);
                    if (selectedEmployee?.roleId) {
                      const employeeRole = roles.find(r =>
                        r.id === selectedEmployee.roleId ||
                        r.codigocargo === selectedEmployee.roleId ||
                        r.title === selectedEmployee.roleId
                      );
                      setSelectedRoleId(employeeRole?.id || '');
                    }
                  }
                }}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Cargo (para IA)</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('templates')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'templates' ? "bg-brand-600 text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-4 h-4" />
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'ai' ? "bg-brand-600 text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'custom' ? "bg-brand-600 text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Plus className="w-4 h-4" />
              Personalizada
            </button>
          </div>

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {templatesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                </div>
              ) : (
                CATEGORIES.map(category => {
                  const categoryTemplates = templates.filter(t => t.category === category);
                  const allSelected = categoryTemplates.every(t => selectedTemplateIds.has(t.id));
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={cn("px-2 py-1 rounded text-xs font-semibold", getCategoryColor(category))}>
                          {getCategoryLabel(category)} ({categoryTemplates.length})
                        </span>
                        <button
                          onClick={() => handleSelectAllCategory(category)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {categoryTemplates.map(template => (
                          <div
                            key={template.id}
                            onClick={() => handleToggleTemplate(template)}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              selectedTemplateIds.has(template.id)
                                ? "bg-brand-50 border-brand-300"
                                : "bg-secondary/30 border-border hover:border-brand-200"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                                selectedTemplateIds.has(template.id)
                                  ? "bg-brand-600 border-brand-600"
                                  : "border-border"
                              )}>
                                {selectedTemplateIds.has(template.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{template.question}</p>
                                <span className="text-xs text-muted-foreground">
                                  {template.type === 'rating' ? 'Nota (1-5)' : 'Resposta aberta'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="p-6 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl border border-brand-200">
              <div className="text-center">
                <Sparkles className="w-10 h-10 text-brand-600 mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Gerar Perguntas com IA</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione um cargo acima para gerar perguntas personalizadas baseadas nas competências e valores da empresa
                </p>
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !selectedRoleId}
                  className={cn(
                    "flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold transition-all mx-auto",
                    selectedRoleId && !isGenerating
                      ? "bg-brand-600 text-primary-foreground hover:bg-brand-700"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando perguntas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar {selectedRoleId ? `para ${selectedRole?.title}` : '(selecione um cargo)'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Custom Tab */}
          {activeTab === 'custom' && (
            <div className="p-4 bg-secondary/30 rounded-xl border border-border space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Pergunta</label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Digite sua pergunta personalizada..."
                  className="w-full h-20 px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-muted-foreground mb-1">Categoria</label>
                  <select
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value as QuestionTemplate['category'])}
                    className="w-full h-9 px-2 bg-background border border-border rounded-lg text-sm"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as 'rating' | 'text')}
                    className="h-9 px-2 bg-background border border-border rounded-lg text-sm"
                  >
                    <option value="text">Texto</option>
                    <option value="rating">Nota</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  className="flex-1 h-9 px-4 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  Adicionar à avaliação
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!newQuestion.trim()}
                  className="h-9 px-4 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  Salvar como template
                </button>
              </div>
            </div>
          )}

          {/* Selected Questions Preview */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Perguntas Selecionadas ({questions.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-2 p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">
                        {index + 1}
                      </span>
                      {(q as any).category && (
                        <span className={cn("text-xs px-1.5 py-0.5 rounded flex-shrink-0", getCategoryColor((q as any).category))}>
                          {getCategoryLabel((q as any).category)}
                        </span>
                      )}
                      <p className="text-sm text-foreground truncate">{q.question}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-border bg-secondary/30">
          <span className="text-sm text-muted-foreground">
            {questions.length} pergunta{questions.length !== 1 ? 's' : ''} selecionada{questions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!employeeId || questions.length === 0}
              className="h-10 px-6 bg-brand-600 text-primary-foreground rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Avaliação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
