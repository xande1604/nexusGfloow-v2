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
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header com avatar e nome */}
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

          {/* Info Cards em grid */}
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
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    Nenhum treinamento registrado
                  </h4>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Os treinamentos aparecerão aqui quando forem registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainings.map((training) => (
                    <div
                      key={training.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors"
                    >
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
                        {training.carga_horaria && (
                          <span>{training.carga_horaria}h</span>
                        )}
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
  );
};
