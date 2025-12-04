import { useState } from 'react';
import { X, Plus, Trash2, Star, Sparkles, Loader2 } from 'lucide-react';
import { Employee, JobRole } from '@/types';
import { ReviewQuestion, ReviewResponse } from '@/hooks/usePerformanceReviews';
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
  const [questions, setQuestions] = useState<ReviewQuestion[]>(defaultQuestions);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'rating' | 'text'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  
  const { toast } = useToast();

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === employeeId);
  const selectedRole = roles.find(r => r.id === selectedRoleId);

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
        const mappedQuestions: ReviewQuestion[] = data.questions.map((q: any, index: number) => ({
          id: `ai-${index + 1}`,
          question: q.question,
          type: q.type === 'rating' ? 'rating' : 'text',
          category: q.category,
        }));
        setQuestions(mappedQuestions);
        setResponses([]);
        toast({
          title: 'Perguntas geradas',
          description: `${mappedQuestions.length} perguntas criadas com base no cargo e valores da empresa.`,
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
      const question: ReviewQuestion = {
        id: `custom-${Date.now()}`,
        question: newQuestion.trim(),
        type: newQuestionType,
      };
      setQuestions([...questions, question]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    setResponses(responses.filter(r => r.questionId !== id));
  };

  const handleResponseChange = (questionId: string, value: number | string, type: 'rating' | 'text') => {
    const existingIndex = responses.findIndex(r => r.questionId === questionId);
    const newResponse: ReviewResponse = {
      questionId,
      ...(type === 'rating' ? { rating: value as number } : { text: value as string }),
    };

    if (existingIndex >= 0) {
      const updated = [...responses];
      updated[existingIndex] = newResponse;
      setResponses(updated);
    } else {
      setResponses([...responses, newResponse]);
    }
  };

  const getResponse = (questionId: string) => {
    return responses.find(r => r.questionId === questionId);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Technical': return 'bg-blue-100 text-blue-700';
      case 'Cultural': return 'bg-purple-100 text-purple-700';
      case 'Soft Skill': return 'bg-emerald-100 text-emerald-700';
      case 'Goal': return 'bg-amber-100 text-amber-700';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const handleSubmit = () => {
    if (!employeeId) return;

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
    setQuestions(defaultQuestions);
    setResponses([]);
    setOverallFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Nova Avaliação de Desempenho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Colaborador *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Cargo (para gerar perguntas)
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione um cargo...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Data da Avaliação
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* AI Generation */}
          <div className="p-4 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl border border-brand-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Gerar Perguntas com IA
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Cria perguntas personalizadas baseadas no cargo, skills e valores da empresa
                </p>
              </div>
              <button
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !selectedRoleId}
                className={cn(
                  "flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-all",
                  selectedRoleId && !isGenerating
                    ? "bg-brand-600 text-primary-foreground hover:bg-brand-700"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar com IA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Perguntas da Avaliação ({questions.length})
            </h3>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      {(q as any).category && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          getCategoryColor((q as any).category)
                        )}>
                          {(q as any).category}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-3">{q.question}</p>

                  {q.type === 'rating' ? (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleResponseChange(q.id, star, 'rating')}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              "w-6 h-6 transition-colors",
                              (getResponse(q.id)?.rating || 0) >= star
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {getResponse(q.id)?.rating || 0}/5
                      </span>
                    </div>
                  ) : (
                    <textarea
                      value={getResponse(q.id)?.text || ''}
                      onChange={(e) => handleResponseChange(q.id, e.target.value, 'text')}
                      placeholder="Digite sua resposta..."
                      className="w-full h-20 px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Question */}
            <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-3">Adicionar Pergunta Manual</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Digite a pergunta..."
                  className="flex-1 h-9 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as 'rating' | 'text')}
                  className="h-9 px-2 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="text">Texto</option>
                  <option value="rating">Nota</option>
                </select>
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  className="h-9 px-3 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Overall Feedback */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Feedback Geral (opcional)
            </label>
            <textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Comentários gerais sobre o desempenho..."
              className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-secondary/30">
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!employeeId}
            className="h-10 px-6 bg-brand-600 text-primary-foreground rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
};
