import { useState } from 'react';
import { Plus, Users, Calendar, ChevronRight, Loader2, Lock, CheckCircle, Clock, FileText, Download, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCycleReport } from '@/lib/generateCycleReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useEvaluationCycles, EvaluationCycle, EmployeeEvaluation } from '@/hooks/useEvaluationCycles';
import { useQuestionTemplates } from '@/hooks/useQuestionTemplates';
import { Employee, JobRole } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface CycleManagementViewProps {
  employees: Employee[];
  roles: JobRole[];
}

export const CycleManagementView = ({ employees, roles }: CycleManagementViewProps) => {
  const { cycles, evaluations, loading, createCycle, closeCycle, addEmployeesToCycle, submitManagerEvaluation, fetchEvaluations } = useEvaluationCycles();
  const { templates } = useQuestionTemplates();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddEmployeesModalOpen, setIsAddEmployeesModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<EvaluationCycle | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EmployeeEvaluation | null>(null);
  
  // Create cycle form
  const [cycleTitle, setCycleTitle] = useState('');
  const [cycleDescription, setCycleDescription] = useState('');
  const [cycleEndDate, setCycleEndDate] = useState('');
  
  // Add employees form
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // Manager evaluation form
  const [managerResponses, setManagerResponses] = useState<Record<string, { rating?: number; response?: string }>>({});
  const [managerFeedback, setManagerFeedback] = useState('');

  const handleCreateCycle = async () => {
    if (!cycleTitle) return;
    
    await createCycle({
      title: cycleTitle,
      description: cycleDescription || null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: cycleEndDate || null,
      status: 'active'
    });
    
    setIsCreateModalOpen(false);
    setCycleTitle('');
    setCycleDescription('');
    setCycleEndDate('');
  };

  const handleAddEmployees = async () => {
    if (!selectedCycle || selectedEmployees.length === 0 || selectedQuestions.length === 0) return;
    
    const questions = templates
      .filter(t => selectedQuestions.includes(t.id))
      .map(t => ({ id: t.id, question: t.question, category: t.category, type: t.type }));
    
    await addEmployeesToCycle(selectedCycle.id, selectedEmployees, questions);
    
    setIsAddEmployeesModalOpen(false);
    setSelectedEmployees([]);
    setSelectedQuestions([]);
  };

  const handleOpenCycleDetail = async (cycle: EvaluationCycle) => {
    setSelectedCycle(cycle);
    await fetchEvaluations(cycle.id);
  };

  const handleOpenManagerEvaluation = (evaluation: EmployeeEvaluation) => {
    setSelectedEvaluation(evaluation);
    setManagerResponses({});
    setManagerFeedback('');
    setIsEvaluationModalOpen(true);
  };

  const handleSubmitManagerEvaluation = async (closeOnly: boolean = false) => {
    if (!selectedEvaluation) return;
    
    const responses = closeOnly ? null : selectedEvaluation.questions.map(q => ({
      questionId: q.id,
      ...managerResponses[q.id]
    }));
    
    await submitManagerEvaluation(selectedEvaluation.id, responses, closeOnly ? null : managerFeedback, closeOnly);
    setIsEvaluationModalOpen(false);
    setSelectedEvaluation(null);
    if (selectedCycle) await fetchEvaluations(selectedCycle.id);
  };

  const cycleEvaluations = selectedCycle ? evaluations.filter(e => e.cycle_id === selectedCycle.id) : [];
  const employeesWithEmail = employees.filter(e => e.email);
  const employeesWithoutEmail = employees.filter(e => !e.email);
  
  const handleSendInvite = (employee: Employee) => {
    toast.info(`Funcionalidade de envio de convite para ${employee.name} será implementada em breve. Cadastre o email do colaborador na tela de Colaboradores.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Cycle detail view
  if (selectedCycle) {
    const pendingCount = cycleEvaluations.filter(e => e.status === 'pending').length;
    const selfDoneCount = cycleEvaluations.filter(e => e.status === 'self_assessment_done').length;
    const completedCount = cycleEvaluations.filter(e => e.status === 'completed').length;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setSelectedCycle(null)} className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1">
              ← Voltar aos ciclos
            </button>
            <h2 className="text-xl font-bold text-foreground">{selectedCycle.title}</h2>
            {selectedCycle.description && <p className="text-muted-foreground mt-1">{selectedCycle.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => generateCycleReport(selectedCycle, cycleEvaluations)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            {selectedCycle.status === 'active' && (
              <>
                <Button variant="outline" onClick={() => setIsAddEmployeesModalOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Adicionar Colaboradores
                </Button>
                <Button variant="destructive" onClick={() => closeCycle(selectedCycle.id)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Fechar Ciclo
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Aguardando autoavaliação</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-brand-500" />
                <div>
                  <p className="text-2xl font-bold">{selfDoneCount}</p>
                  <p className="text-sm text-muted-foreground">Aguardando gestor</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Avaliações do Ciclo</CardTitle>
          </CardHeader>
          <CardContent>
            {cycleEvaluations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum colaborador adicionado ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {cycleEvaluations.map(evaluation => (
                  <div key={evaluation.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-foreground">{evaluation.employee?.nome || evaluation.employee?.name || 'Colaborador'}</p>
                      <p className="text-sm text-muted-foreground">{evaluation.employee?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        evaluation.status === 'pending' && 'bg-amber-100 text-amber-700',
                        evaluation.status === 'self_assessment_done' && 'bg-brand-100 text-brand-700',
                        evaluation.status === 'completed' && 'bg-emerald-100 text-emerald-700'
                      )}>
                        {evaluation.status === 'pending' && 'Aguardando'}
                        {evaluation.status === 'self_assessment_done' && 'Avaliar'}
                        {evaluation.status === 'completed' && 'Concluída'}
                      </Badge>
                      {evaluation.status === 'self_assessment_done' && (
                        <Button size="sm" onClick={() => handleOpenManagerEvaluation(evaluation)}>
                          Avaliar
                        </Button>
                      )}
                      {evaluation.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => handleOpenManagerEvaluation(evaluation)}>
                          Ver detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Employees Modal */}
        <Dialog open={isAddEmployeesModalOpen} onOpenChange={setIsAddEmployeesModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Colaboradores ao Ciclo</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Selecione os colaboradores</Label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-2">
                  {/* Colaboradores com email */}
                  {employeesWithEmail.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer">
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={(checked) => {
                          setSelectedEmployees(prev => 
                            checked ? [...prev, emp.id] : prev.filter(id => id !== emp.id)
                          );
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </label>
                  ))}
                  {/* Colaboradores sem email */}
                  {employeesWithoutEmail.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 rounded bg-amber-50 border border-amber-200">
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={(checked) => {
                          setSelectedEmployees(prev => 
                            checked ? [...prev, emp.id] : prev.filter(id => id !== emp.id)
                          );
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{emp.name}</p>
                          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Sem email
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Colaborador precisa cadastrar email para participar</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSendInvite(emp);
                        }}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Enviar convite
                      </Button>
                    </div>
                  ))}
                </div>
                {employees.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum colaborador cadastrado.
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Selecione as perguntas do questionário</Label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-2">
                  {templates.map(template => (
                    <label key={template.id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer">
                      <Checkbox
                        checked={selectedQuestions.includes(template.id)}
                        onCheckedChange={(checked) => {
                          setSelectedQuestions(prev => 
                            checked ? [...prev, template.id] : prev.filter(id => id !== template.id)
                          );
                        }}
                      />
                      <div>
                        <p className="font-medium text-sm">{template.question}</p>
                        <p className="text-xs text-muted-foreground">{template.category}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {selectedEmployees.some(id => employeesWithoutEmail.find(e => e.id === id)) && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Colaboradores sem email serão adicionados ao ciclo, mas precisarão ter um email cadastrado para acessar o portal de autoavaliação.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEmployeesModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddEmployees} disabled={selectedEmployees.length === 0 || selectedQuestions.length === 0}>
                Adicionar {selectedEmployees.length} colaborador(es)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manager Evaluation Modal */}
        <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Avaliação - {selectedEvaluation?.employee?.nome || selectedEvaluation?.employee?.name}</DialogTitle>
            </DialogHeader>
            {selectedEvaluation && (
              <div className="space-y-6">
                {selectedEvaluation.questions.map((q, idx) => {
                  const selfResponse = selectedEvaluation.self_assessment_responses?.find(r => r.questionId === q.id);
                  const managerResponse = selectedEvaluation.status === 'completed' 
                    ? selectedEvaluation.manager_evaluation_responses?.find(r => r.questionId === q.id)
                    : managerResponses[q.id];
                  
                  return (
                    <div key={q.id} className="border-b pb-4">
                      <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                      <p className="text-xs text-muted-foreground mb-2">{q.category}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Autoavaliação:</p>
                          {selfResponse?.rating && <p className="font-semibold">Nota: {selfResponse.rating}/5</p>}
                          {selfResponse?.response && <p className="text-sm">{selfResponse.response}</p>}
                        </div>
                        
                        {selectedEvaluation.status !== 'completed' ? (
                          <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Sua avaliação:</p>
                            {q.type === 'rating' || q.type === 'scale' ? (
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(rating => (
                                  <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setManagerResponses(prev => ({ ...prev, [q.id]: { ...prev[q.id], rating } }))}
                                    className={cn(
                                      "w-8 h-8 rounded text-sm font-semibold transition-all",
                                      managerResponse?.rating === rating
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white border hover:border-brand-400'
                                    )}
                                  >
                                    {rating}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <Textarea
                                value={managerResponses[q.id]?.response || ''}
                                onChange={(e) => setManagerResponses(prev => ({ ...prev, [q.id]: { response: e.target.value } }))}
                                placeholder="Sua resposta..."
                                rows={2}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="bg-brand-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Avaliação do Gestor:</p>
                            {managerResponse?.rating && <p className="font-semibold">Nota: {managerResponse.rating}/5</p>}
                            {managerResponse?.response && <p className="text-sm">{managerResponse.response}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {selectedEvaluation.status !== 'completed' && (
                  <div>
                    <Label>Feedback geral (opcional)</Label>
                    <Textarea
                      value={managerFeedback}
                      onChange={(e) => setManagerFeedback(e.target.value)}
                      placeholder="Observações e feedback para o colaborador..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                )}

                {selectedEvaluation.status === 'completed' && selectedEvaluation.manager_feedback && (
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Feedback do Gestor:</p>
                    <p className="text-sm">{selectedEvaluation.manager_feedback}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEvaluationModalOpen(false)}>
                {selectedEvaluation?.status === 'completed' ? 'Fechar' : 'Cancelar'}
              </Button>
              {selectedEvaluation?.status !== 'completed' && (
                <>
                  <Button variant="secondary" onClick={() => handleSubmitManagerEvaluation(true)}>
                    Apenas Fechar Ciclo
                  </Button>
                  <Button onClick={() => handleSubmitManagerEvaluation(false)}>
                    Salvar Avaliação e Fechar
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Cycles list
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Ciclos de Avaliação</h2>
          <p className="text-muted-foreground">Gerencie os ciclos de autoavaliação dos colaboradores</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ciclo
        </Button>
      </div>

      <div className="grid gap-4">
        {cycles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum ciclo de avaliação criado</p>
              <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                Criar primeiro ciclo
              </Button>
            </CardContent>
          </Card>
        ) : (
          cycles.map(cycle => {
            const cycleEvals = evaluations.filter(e => e.cycle_id === cycle.id);
            const completedCount = cycleEvals.filter(e => e.status === 'completed').length;
            
            return (
              <Card key={cycle.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenCycleDetail(cycle)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{cycle.title}</h3>
                        <Badge variant={cycle.status === 'active' ? 'default' : 'secondary'}>
                          {cycle.status === 'active' ? 'Ativo' : 'Fechado'}
                        </Badge>
                      </div>
                      {cycle.description && <p className="text-sm text-muted-foreground">{cycle.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {cycleEvals.length} colaboradores
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {completedCount} concluídas
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Cycle Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Ciclo de Avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cycleTitle">Título do ciclo</Label>
              <Input
                id="cycleTitle"
                value={cycleTitle}
                onChange={(e) => setCycleTitle(e.target.value)}
                placeholder="Ex: Avaliação Q4 2024"
              />
            </div>
            <div>
              <Label htmlFor="cycleDescription">Descrição (opcional)</Label>
              <Textarea
                id="cycleDescription"
                value={cycleDescription}
                onChange={(e) => setCycleDescription(e.target.value)}
                placeholder="Descrição do ciclo de avaliação..."
              />
            </div>
            <div>
              <Label htmlFor="cycleEndDate">Data limite (opcional)</Label>
              <Input
                id="cycleEndDate"
                type="date"
                value={cycleEndDate}
                onChange={(e) => setCycleEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCycle} disabled={!cycleTitle}>Criar Ciclo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
