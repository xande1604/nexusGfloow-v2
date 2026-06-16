import { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Calendar, Building2, Award, BookOpen, Loader2, Hash, MapPin, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, JobRole } from '@/types';
import { EmployeeSkillsPanel } from './EmployeeSkillsPanel';
import { useEmployeeSkills } from '@/hooks/useEmployeeSkills';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  roles: JobRole[];
  employees: Employee[];
}

interface TrainingRecord {
  id: string;
  nome_treinamento: string;
  instituicao: string | null;
  data_conclusao: string | null;
  carga_horaria: number | null;
  status: string;
}

interface CompletedEvaluation {
  id: string;
  title: string;
  feedback: string | null;
  completedAt: string | null;
  source: 'cycle' | 'standalone';
}

const CATEGORIES = ['Technical', 'Soft Skill', 'Leadership', 'Language', 'Outros'];

export const EmployeeDetailsModal = ({
  isOpen,
  onClose,
  employee,
  roles,
  employees
}: EmployeeDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('skills');
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(false);

  // Import from evaluation dialog
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [completedEvaluations, setCompletedEvaluations] = useState<CompletedEvaluation[]>([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');
  const [importSkillName, setImportSkillName] = useState('');
  const [importCategory, setImportCategory] = useState('Technical');
  const [importedSkills, setImportedSkills] = useState<{ name: string; category: string }[]>([]);
  const [savingImport, setSavingImport] = useState(false);

  const { skills, loading: loadingSkills, saveSkills, deleteSkill } = useEmployeeSkills(employee?.id);

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.title || roleId || 'Não definido';
  };

  const getGestorName = (gestorId?: string) => {
    if (!gestorId) return 'Não definido';
    const gestor = employees.find(e => e.id === gestorId);
    return gestor?.name || 'Não definido';
  };

  useEffect(() => {
    if (isOpen && employee?.id) {
      fetchTrainings();
    }
  }, [isOpen, employee?.id]);

  const fetchTrainings = async () => {
    if (!employee?.id) return;
    setLoadingTrainings(true);
    try {
      const { data, error } = await supabase
        .from('treinamentos')
        .select('id, nome_treinamento, instituicao, data_conclusao, carga_horaria, status')
        .eq('employee_id', employee.id)
        .order('data_conclusao', { ascending: false });
      if (error) throw error;
      setTrainings(data || []);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoadingTrainings(false);
    }
  };

  const fetchCompletedEvaluations = async () => {
    if (!employee?.id) return;
    setLoadingEvaluations(true);
    try {
      // Cycle evaluations
      const { data: cycleEvals } = await supabase
        .from('employee_evaluations')
        .select('id, manager_feedback, manager_evaluation_completed_at, evaluation_cycles(title)')
        .eq('employee_id', employee.id)
        .eq('status', 'completed');

      // Standalone reviews
      const { data: standaloneEvals } = await supabase
        .from('performance_reviews')
        .select('id, manager_overall_feedback, date, status')
        .eq('employee_id', employee.id)
        .eq('status', 'Completed');

      const evals: CompletedEvaluation[] = [
        ...(cycleEvals || []).map((e: any) => ({
          id: e.id,
          title: e.evaluation_cycles?.title || 'Ciclo de Avaliação',
          feedback: e.manager_feedback,
          completedAt: e.manager_evaluation_completed_at,
          source: 'cycle' as const,
        })),
        ...(standaloneEvals || []).map((e: any) => ({
          id: e.id,
          title: `Avaliação Avulsa — ${e.date ? format(new Date(e.date), 'dd/MM/yyyy', { locale: ptBR }) : ''}`,
          feedback: e.manager_overall_feedback,
          completedAt: e.date,
          source: 'standalone' as const,
        })),
      ];

      setCompletedEvaluations(evals);
      if (evals.length > 0) setSelectedEvalId(evals[0].id);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  const handleOpenImport = () => {
    setImportedSkills([]);
    setImportSkillName('');
    setImportCategory('Technical');
    setShowImportDialog(true);
    fetchCompletedEvaluations();
  };

  const handleAddImportSkill = () => {
    if (!importSkillName.trim()) return;
    setImportedSkills(prev => [...prev, { name: importSkillName.trim(), category: importCategory }]);
    setImportSkillName('');
  };

  const handleSaveImport = async () => {
    if (!employee?.id || importedSkills.length === 0) return;
    const eval_ = completedEvaluations.find(e => e.id === selectedEvalId);
    setSavingImport(true);
    await saveSkills(
      importedSkills.map(s => ({
        employee_id: employee.id,
        skill_name: s.name,
        skill_category: s.category,
        source_type: 'evaluation',
        source_id: selectedEvalId || undefined,
        source_name: eval_?.title || 'Avaliação',
      }))
    );
    setSavingImport(false);
    setShowImportDialog(false);
    setImportedSkills([]);
  };

  const handleManualAdd = async (name: string, category: string) => {
    if (!employee?.id) return;
    await saveSkills([{
      employee_id: employee.id,
      skill_name: name,
      skill_category: category,
      source_type: 'manual',
      source_name: 'Manual',
    }]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge className="bg-success/10 text-success border-success/20">Concluído</Badge>;
      case 'em_andamento':
        return <Badge className="bg-info/10 text-info border-info/20">Em Andamento</Badge>;
      case 'cancelado':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedEval = completedEvaluations.find(e => e.id === selectedEvalId);

  if (!employee) return null;

  const empAny = employee as any;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 bg-muted/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-foreground leading-tight tracking-tight">{employee.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getRoleName(employee.roleId)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { icon: Mail, label: 'Email', value: employee.email || '—' },
                { icon: Hash, label: 'Matrícula', value: empAny.matricula || '—' },
                { icon: Calendar, label: 'Admissão', value: employee.admissionDate ? format(new Date(employee.admissionDate), "dd/MM/yyyy", { locale: ptBR }) : '—' },
                { icon: Building2, label: 'Empresa', value: empAny.codempresa || '—' },
                { icon: MapPin, label: 'C. Custos', value: empAny.codcentrodecustos || '—' },
              ].map((item, i) => (
                <div key={i} className="bg-background rounded-xl border border-border p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate" title={item.value}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-8 pt-4 border-t border-border">
              <TabsList className="grid w-full grid-cols-2 h-11">
                <TabsTrigger value="skills" className="flex items-center gap-2 text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Habilidades ({skills.length})
                </TabsTrigger>
                <TabsTrigger value="trainings" className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Treinamentos ({trainings.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-5">
              <TabsContent value="skills" className="mt-0 h-full">
                <EmployeeSkillsPanel
                  skills={skills}
                  employeeName={employee.name}
                  loading={loadingSkills}
                  onAdd={handleManualAdd}
                  onDelete={deleteSkill}
                  onImportFromEvaluation={handleOpenImport}
                />
              </TabsContent>

              <TabsContent value="trainings" className="mt-0">
                {loadingTrainings ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : trainings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-1">Nenhum treinamento registrado</h4>
                    <p className="text-muted-foreground text-sm max-w-sm">Os treinamentos aparecerão aqui quando forem registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trainings.map((training) => (
                      <div key={training.id} className="p-4 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-medium text-foreground">{training.nome_treinamento}</span>
                          {getStatusBadge(training.status)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {training.instituicao && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5" />
                              {training.instituicao}
                            </span>
                          )}
                          {training.carga_horaria && <span>{training.carga_horaria}h</span>}
                          {training.data_conclusao && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(training.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Import from Evaluation Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Importar habilidades da avaliação
            </DialogTitle>
          </DialogHeader>

          {loadingEvaluations ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : completedEvaluations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Nenhuma avaliação concluída encontrada para este colaborador.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Select evaluation */}
              <div className="space-y-1.5">
                <Label>Avaliação de origem</Label>
                <Select value={selectedEvalId} onValueChange={setSelectedEvalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a avaliação..." />
                  </SelectTrigger>
                  <SelectContent>
                    {completedEvaluations.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                        {e.completedAt && ` — ${format(new Date(e.completedAt), 'dd/MM/yyyy', { locale: ptBR })}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback preview */}
              {selectedEval?.feedback && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Feedback do gestor</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedEval.feedback}</p>
                </div>
              )}

              {/* Add skill */}
              <div className="space-y-2">
                <Label>Adicionar habilidade identificada</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da habilidade..."
                    value={importSkillName}
                    onChange={e => setImportSkillName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddImportSkill()}
                    className="flex-1"
                  />
                  <Select value={importCategory} onValueChange={setImportCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddImportSkill} disabled={!importSkillName.trim()} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Staged skills */}
              {importedSkills.length > 0 && (
                <div className="space-y-2">
                  <Label>Habilidades a registrar ({importedSkills.length})</Label>
                  <div className="space-y-1.5">
                    {importedSkills.map((s, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{s.name}</span>
                          <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                        </div>
                        <button
                          onClick={() => setImportedSkills(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveImport}
              disabled={importedSkills.length === 0 || savingImport || !selectedEvalId}
            >
              {savingImport ? 'Salvando...' : `Salvar ${importedSkills.length > 0 ? `(${importedSkills.length})` : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
