import { useState, useMemo } from 'react';
import { Plus, Search, BookOpen, Calendar, Clock, Building2, Trash2, Edit2, Filter, GraduationCap, CheckCircle2, XCircle, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTreinamentos, Treinamento } from '@/hooks/useTreinamentos';
import { useEmployees } from '@/hooks/useEmployees';
import { useCostCenters } from '@/hooks/useCostCenters';
import { TreinamentoFormModal } from './TreinamentoFormModal';
import { TreinamentosReportsView } from './TreinamentosReportsView';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TreinamentosViewProps {
  isDemoMode?: boolean;
}

export const TreinamentosView = ({ isDemoMode = false }: TreinamentosViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreinamento, setEditingTreinamento] = useState<Treinamento | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const { treinamentos, loading, saveTreinamento, updateTreinamento, deleteTreinamento } = useTreinamentos();
  const { employees } = useEmployees();
  const { costCenters } = useCostCenters();

  const filteredTreinamentos = useMemo(() => {
    return treinamentos.filter(t => {
      const matchesSearch = 
        t.nome_treinamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.instituicao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [treinamentos, searchTerm, statusFilter]);

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Não vinculado';
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Colaborador não encontrado';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</Badge>;
      case 'em_andamento':
        return <Badge className="bg-info/10 text-info border-info/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Em Andamento</Badge>;
      case 'cancelado':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleEdit = (treinamento: Treinamento) => {
    setEditingTreinamento(treinamento);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTreinamento(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteTreinamento(deleteId);
      setDeleteId(null);
    }
  };

  const stats = useMemo(() => {
    const total = treinamentos.length;
    const concluidos = treinamentos.filter(t => t.status === 'concluido').length;
    const emAndamento = treinamentos.filter(t => t.status === 'em_andamento').length;
    const totalHoras = treinamentos.reduce((acc, t) => acc + (t.carga_horaria || 0), 0);
    
    return { total, concluidos, emAndamento, totalHoras };
  }, [treinamentos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Treinamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.concluidos}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <GraduationCap className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.emAndamento}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalHoras}h</p>
                <p className="text-sm text-muted-foreground">Horas de Treinamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Registros de Treinamentos
            </CardTitle>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isDemoMode}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Treinamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou instituição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="concluido">Concluídos</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Training List */}
          {filteredTreinamentos.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum treinamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece registrando o primeiro treinamento.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsModalOpen(true)} disabled={isDemoMode}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Treinamento
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTreinamentos.map((treinamento) => (
                <div 
                  key={treinamento.id}
                  className="p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{treinamento.nome_treinamento}</h4>
                          <p className="text-sm text-muted-foreground">{getEmployeeName(treinamento.employee_id)}</p>
                        </div>
                        {getStatusBadge(treinamento.status)}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground ml-11">
                        {treinamento.instituicao && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {treinamento.instituicao}
                          </span>
                        )}
                        {treinamento.data_conclusao && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(treinamento.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                        {treinamento.carga_horaria && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {treinamento.carga_horaria}h
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-11 lg:ml-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(treinamento)}
                        disabled={isDemoMode}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteId(treinamento.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDemoMode}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <TreinamentoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={saveTreinamento}
        onUpdate={updateTreinamento}
        editingTreinamento={editingTreinamento}
        employees={employees}
      />

      {/* Delete Confirmation */}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <TreinamentosReportsView 
            treinamentos={treinamentos}
            employees={employees}
            costCenters={costCenters}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de treinamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
