import { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Calendar, Building2, Award, BookOpen, Loader2, Hash, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  
  const { skills, loading: loadingSkills } = useEmployeeSkills(employee?.id);

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

  if (!employee) return null;

  const empAny = employee as any;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground leading-tight">{employee.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{getRoleName(employee.roleId)}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Email</p>
                <p className="text-sm text-foreground truncate">{employee.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Matrícula</p>
                <p className="text-sm text-foreground truncate">{empAny.matricula || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Admissão</p>
                <p className="text-sm text-foreground">
                  {employee.admissionDate
                    ? format(new Date(employee.admissionDate), "dd/MM/yyyy", { locale: ptBR })
                    : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Empresa</p>
                <p className="text-sm text-foreground truncate">{empAny.codempresa || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Centro Custos</p>
                <p className="text-sm text-foreground truncate">{empAny.codcentrodecustos || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 pt-3">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="skills" className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4" />
                Habilidades ({skills.length})
              </TabsTrigger>
              <TabsTrigger value="trainings" className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4" />
                Treinamentos ({trainings.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="skills" className="mt-0 h-full">
              <EmployeeSkillsPanel
                skills={skills}
                employeeName={employee.name}
                loading={loadingSkills}
              />
            </TabsContent>

            <TabsContent value="trainings" className="mt-0">
              {loadingTrainings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : trainings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">
                    Nenhum treinamento registrado
                  </h4>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Os treinamentos do colaborador aparecerão aqui quando forem registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainings.map((training) => (
                    <div
                      key={training.id}
                      className="p-4 rounded-lg border border-border bg-background hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-foreground">{training.nome_treinamento}</span>
                            {getStatusBadge(training.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {training.instituicao && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {training.instituicao}
                              </span>
                            )}
                            {training.carga_horaria && (
                              <span>{training.carga_horaria}h</span>
                            )}
                            {training.data_conclusao && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(training.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
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
  );
};
