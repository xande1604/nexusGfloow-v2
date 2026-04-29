import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, ChevronRight, Loader2, Lock, CheckCircle, Clock, FileText, Download, Mail, AlertCircle, Sparkles, RefreshCw, Pencil, Trash2, Send, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCycleReport } from '@/lib/generateCycleReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEvaluationCycles, EvaluationCycle, EmployeeEvaluation } from '@/hooks/useEvaluationCycles';
import { Employee, JobRole } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';
import { demoEvaluationCycles, demoEvaluations } from '@/components/demo/demoData';

interface InviteHistoryItem {
  id: string;
  type: 'self_assessment' | 'manager_evaluation';
  recipient_email: string;
  recipient_name: string | null;
  sent_at: string;
  status: string;
}

interface CycleManagementViewProps {
  employees: Employee[];
  roles: JobRole[];
}

interface GeneratedQuestion {
  id: string;
  question: string;
  category: string;
  type: string;
}

export const CycleManagementView = ({ employees, roles }: CycleManagementViewProps) => {
  const { isDemoMode } = useDemo();
  const { cycles: realCycles, evaluations: realEvaluations, loading, createCycle, closeCycle, addEmployeesToCycle, submitManagerEvaluation, fetchEvaluations } = useEvaluationCycles();
  
  // Use demo data when in demo mode
  const cycles = isDemoMode ? demoEvaluationCycles as EvaluationCycle[] : realCycles;
  const evaluations = isDemoMode ? demoEvaluations as unknown as EmployeeEvaluation[] : realEvaluations;
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddEmployeesModalOpen, setIsAddEmployeesModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<EvaluationCycle | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EmployeeEvaluation | null>(null);
  
  // Create cycle form
  const [cycleTitle, setCycleTitle] = useState('');
  const [cycleDescription, setCycleDescription] = useState('');
  const [cycleEndDate, setCycleEndDate] = useState('');
  
  // Add employee form (single selection with AI questions)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Question editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  
  // Close cycle confirmation
  const [isCloseCycleConfirmOpen, setIsCloseCycleConfirmOpen] = useState(false);

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

  const handleEmployeeSelect = async (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setGeneratedQuestions([]);

    const employee = employees.find(e => e.id === employeeId);
    if (!employee?.roleId) {
      setSelectedRoleId('');
      toast.info('Colaborador sem cargo definido. Selecione outro ou defina o cargo.');
      return;
    }

    // Find the role details and auto-select cargo
    const role = roles.find(r => r.id === employee.roleId || r.title === employee.roleId);
    setSelectedRoleId(role?.id || employee.roleId);
    
    setIsGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-review-questions', {
        body: {
          roleTitle: role?.title || employee.roleId,
          roleDescription: role?.description || '',
          hardSkills: role?.hardSkills || '',
          softSkills: role?.softSkills || '',
          technicalKnowledge: role?.technicalKnowledge || ''
        }
      });
      
      if (error) throw error;
      
      if (data?.questions) {
        setGeneratedQuestions(data.questions);
        toast.success('Perguntas geradas com sucesso!');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Erro ao gerar perguntas. Tente novamente.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAddEmployeeWithQuestions = async () => {
    if (!selectedCycle || !selectedEmployeeId || generatedQuestions.length === 0) return;
    
    await addEmployeesToCycle(selectedCycle.id, [selectedEmployeeId], generatedQuestions);
    
    setIsAddEmployeesModalOpen(false);
    setSelectedEmployeeId('');
    setGeneratedQuestions([]);
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

  const handleSubmitManagerEvaluation = async () => {
    if (!selectedEvaluation) return;

    const responses = selectedEvaluation.questions.map(q => ({
      questionId: q.id,
      ...managerResponses[q.id]
    }));

    await submitManagerEvaluation(selectedEvaluation.id, responses, managerFeedback, false);
    setIsEvaluationModalOpen(false);
    setSelectedEvaluation(null);
    if (selectedCycle) await fetchEvaluations(selectedCycle.id);
  };

  const cycleEvaluations = selectedCycle ? evaluations.filter(e => e.cycle_id === selectedCycle.id) : [];
  
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [inviteHistory, setInviteHistory] = useState<Record<string, InviteHistoryItem[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null);

  const fetchInviteHistory = async (evaluationId: string) => {
    if (inviteHistory[evaluationId]) return; // Already fetched
    
    setLoadingHistory(evaluationId);
    try {
      const { data, error } = await supabase
        .from('evaluation_invite_history')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      
      const typedData: InviteHistoryItem[] = (data || []).map(item => ({
        id: item.id,
        type: item.type as 'self_assessment' | 'manager_evaluation',
        recipient_email: item.recipient_email,
        recipient_name: item.recipient_name,
        sent_at: item.sent_at,
        status: item.status
      }));
      
      setInviteHistory(prev => ({
        ...prev,
        [evaluationId]: typedData
      }));
    } catch (error) {
      console.error('Error fetching invite history:', error);
    } finally {
      setLoadingHistory(null);
    }
  };

  const handleSendInvite = async (evaluation: EmployeeEvaluation, type: 'self_assessment' | 'manager_evaluation') => {
    const employee = evaluation.employee;
    if (!employee?.email) {
      toast.error('Colaborador não possui email cadastrado.');
      return;
    }

    // Find manager info if sending manager evaluation invite
    let managerName: string | undefined;
    let managerEmail: string | undefined;
    
    if (type === 'manager_evaluation') {
      const manager = employees.find(e => e.id === employee.gestor_id);
      if (manager) {
        managerName = manager.name;
        managerEmail = manager.email || undefined;
      }
    }

    setSendingInvite(`${evaluation.id}-${type}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-evaluation-invite', {
        body: {
          type,
          employeeName: employee.nome || employee.name,
          employeeEmail: employee.email,
          managerName,
          managerEmail,
          cycleTitle: selectedCycle?.title || '',
          cycleId: selectedCycle?.id || '',
          evaluationId: evaluation.id,
          cycleEndDate: selectedCycle?.end_date || null
        }
      });
      
      if (error) throw error;
      
      // Refresh the invite history for this evaluation
      setInviteHistory(prev => {
        const copy = { ...prev };
        delete copy[evaluation.id];
        return copy;
      });
      
      toast.success(type === 'self_assessment' 
        ? 'Convite de autoavaliação enviado!'
        : 'Convite de avaliação do gestor enviado!');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Erro ao enviar convite. Verifique a configuração do webhook.');
    } finally {
      setSendingInvite(null);
    }
  };

  // Question editing handlers
  const handleEditQuestion = (question: GeneratedQuestion) => {
    setEditingQuestionId(question.id);
    setEditingQuestionText(question.question);
  };

  const handleSaveQuestionEdit = () => {
    if (!editingQuestionId || !editingQuestionText.trim()) return;
    setGeneratedQuestions(prev => 
      prev.map(q => q.id === editingQuestionId ? { ...q, question: editingQuestionText.trim() } : q)
    );
    setEditingQuestionId(null);
    setEditingQuestionText('');
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setEditingQuestionText('');
  };

  const handleDeleteQuestion = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  if (!isDemoMode && loading) {
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
        <div className="flex flex-col gap-4">
          <div>
            <button onClick={() => setSelectedCycle(null)} className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1">
              ← Voltar aos ciclos
            </button>
            <h2 className="text-xl font-bold text-foreground">{selectedCycle.title}</h2>
            {selectedCycle.description && <p className="text-muted-foreground mt-1">{selectedCycle.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => generateCycleReport(selectedCycle, cycleEvaluations)}>
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            {selectedCycle.status === 'active' && (
              <>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsAddEmployeesModalOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Adicionar Colaboradores</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
                <Button variant="destructive" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsCloseCycleConfirmOpen(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Fechar Ciclo</span>
                  <span className="sm:hidden">Fechar</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        evaluation.status === 'pending' && 'bg-amber-100 text-amber-700',
                        evaluation.status === 'self_assessment_done' && 'bg-brand-100 text-brand-700',
                        evaluation.status === 'completed' && 'bg-emerald-100 text-emerald-700'
                      )}>
                        {evaluation.status === 'pending' && 'Aguardando'}
                        {evaluation.status === 'self_assessment_done' && 'Avaliar'}
                        {evaluation.status === 'completed' && 'Concluída'}
                      </Badge>
                      
                      {/* Invite history popover */}
                      <Popover onOpenChange={(open) => open && fetchInviteHistory(evaluation.id)}>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-xs">
                            <History className="w-3 h-3 mr-1" />
                            Histórico
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Histórico de Convites</h4>
                            {loadingHistory === evaluation.id ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            ) : inviteHistory[evaluation.id]?.length ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {inviteHistory[evaluation.id].map(invite => (
                                  <div key={invite.id} className="text-xs p-2 bg-muted rounded-md">
                                    <div className="flex items-center justify-between mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {invite.type === 'self_assessment' ? 'Autoavaliação' : 'Gestor'}
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        {new Date(invite.sent_at).toLocaleDateString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground truncate">
                                      Para: {invite.recipient_name || invite.recipient_email}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground py-2">
                                Nenhum convite enviado ainda.
                              </p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      {/* Resend buttons */}
                      {evaluation.status === 'pending' && evaluation.employee?.email && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs"
                          onClick={() => handleSendInvite(evaluation, 'self_assessment')}
                          disabled={sendingInvite === `${evaluation.id}-self_assessment`}
                        >
                          {sendingInvite === `${evaluation.id}-self_assessment` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-1" />
                              Reenviar convite
                            </>
                          )}
                        </Button>
                      )}
                      
                      {evaluation.status === 'self_assessment_done' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs"
                            onClick={() => handleSendInvite(evaluation, 'manager_evaluation')}
                            disabled={sendingInvite === `${evaluation.id}-manager_evaluation`}
                          >
                            {sendingInvite === `${evaluation.id}-manager_evaluation` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                Notificar gestor
                              </>
                            )}
                          </Button>
                          <Button size="sm" onClick={() => handleOpenManagerEvaluation(evaluation)}>
                            Avaliar
                          </Button>
                        </>
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

        {/* Fechar Ciclo - Confirmação */}
        <Dialog open={isCloseCycleConfirmOpen} onOpenChange={setIsCloseCycleConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-destructive" />
                Fechar Ciclo de Avaliação
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {(pendingCount > 0 || selfDoneCount > 0) ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Avaliações incompletas
                  </div>
                  <p className="text-sm text-amber-700">
                    Este ciclo ainda possui avaliações em andamento:
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1 ml-2">
                    {pendingCount > 0 && (
                      <li>• <strong>{pendingCount}</strong> aguardando autoavaliação do colaborador</li>
                    )}
                    {selfDoneCount > 0 && (
                      <li>• <strong>{selfDoneCount}</strong> aguardando avaliação do gestor</li>
                    )}
                    {completedCount > 0 && (
                      <li>• <strong>{completedCount}</strong> concluída(s)</li>
                    )}
                  </ul>
                  <p className="text-sm text-amber-700 mt-2">
                    Ao fechar, as avaliações pendentes serão encerradas sem dados.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-green-300 bg-green-50 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Todas as avaliações concluídas
                  </div>
                  <p className="text-sm text-green-700">
                    {completedCount} avaliação(ões) completa(s). O ciclo pode ser fechado com segurança.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Após fechar, o ciclo não poderá ser reaberto.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCloseCycleConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await closeCycle(selectedCycle.id);
                  setIsCloseCycleConfirmOpen(false);
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Confirmar Fechamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Employee Modal */}
        <Dialog open={isAddEmployeesModalOpen} onOpenChange={(open) => {
          setIsAddEmployeesModalOpen(open);
          if (!open) {
            setSelectedEmployeeId('');
            setSelectedRoleId('');
            setGeneratedQuestions([]);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador ao Ciclo</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Selecione o colaborador</Label>
                <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colaborador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => {
                      const hasEmail = !!emp.email;
                      return (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            <span>{emp.name}</span>
                            {!hasEmail && (
                              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                                Sem email
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedEmployeeId && !employees.find(e => e.id === selectedEmployeeId)?.email && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-700">Colaborador precisa cadastrar email para participar</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Cargo atual</Label>
                <Select
                  value={selectedRoleId}
                  onValueChange={(value) => setSelectedRoleId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.codigocargo ? `${role.codigocargo} - ${role.title}` : role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isGeneratingQuestions && (
                <div className="flex flex-col items-center justify-center py-8 border rounded-lg bg-secondary/30">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
                  <p className="text-sm text-muted-foreground">Gerando perguntas personalizadas com IA...</p>
                  <p className="text-xs text-muted-foreground">Baseado no cargo e requisitos do colaborador</p>
                </div>
              )}

              {generatedQuestions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <Label>Perguntas geradas com IA ({generatedQuestions.length})</Label>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEmployeeSelect(selectedEmployeeId)}
                      disabled={isGeneratingQuestions}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-1", isGeneratingQuestions && "animate-spin")} />
                      Regenerar
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-64 overflow-y-auto p-2 space-y-2">
                    {generatedQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3 rounded bg-secondary/50 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {editingQuestionId === q.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingQuestionText}
                                  onChange={(e) => setEditingQuestionText(e.target.value)}
                                  className="text-sm"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={handleSaveQuestionEdit}>
                                    Salvar
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={handleCancelQuestionEdit}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                            )}
                          </div>
                          {editingQuestionId !== q.id && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditQuestion(q)}
                                className="p-1 rounded hover:bg-secondary"
                                title="Editar pergunta"
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1 rounded hover:bg-destructive/10"
                                title="Remover pergunta"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingQuestionId !== q.id && (
                          <Badge variant="outline" className="text-xs mt-1">{q.category}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployeeId && !isGeneratingQuestions && generatedQuestions.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Não foi possível gerar as perguntas. Verifique se o colaborador tem um cargo definido com requisitos.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEmployeesModalOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddEmployeeWithQuestions} 
                disabled={!selectedEmployeeId || generatedQuestions.length === 0 || isGeneratingQuestions}
              >
                Adicionar Colaborador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manager Evaluation Modal */}
        <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Avaliação - {selectedEvaluation?.employee?.nome || selectedEvaluation?.employee?.name}</DialogTitle>
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
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" onClick={() => setIsEvaluationModalOpen(false)} className="w-full sm:w-auto">
                {selectedEvaluation?.status === 'completed' ? 'Fechar' : 'Cancelar'}
              </Button>
              {selectedEvaluation?.status !== 'completed' && (
                <Button onClick={() => handleSubmitManagerEvaluation(false)} className="w-full sm:w-auto">
                  Salvar Avaliação
                </Button>
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
