import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Search, Plus, Pencil, Trash2, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useEmpresas, EmpresaWithCount, Empresa } from '@/hooks/useEmpresas';
import { EmpresaFormModal } from './EmpresaFormModal';
import { Loader2 } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { demoEmpresas } from '@/components/demo/demoData';
import { toast } from 'sonner';

export const EmpresasView = () => {
  const { isDemoMode } = useDemo();
  const { empresas: realEmpresas, loading, saveEmpresa, deleteEmpresa } = useEmpresas();
  
  // Convert demo data to EmpresaWithCount format
  const demoEmpresasWithCount: EmpresaWithCount[] = demoEmpresas.map(e => ({
    ...e,
    employeeCount: 0
  }));
  
  const empresas = isDemoMode ? demoEmpresasWithCount : realEmpresas;
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaWithCount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<EmpresaWithCount | null>(null);
  
  const handleDemoAction = () => {
    toast.info('Funcionalidade restrita no modo demonstração');
  };

  const filteredEmpresas = useMemo(() => {
    return empresas.filter(emp => 
      emp.nomeempresa.toLowerCase().includes(search.toLowerCase()) ||
      emp.codempresa.toLowerCase().includes(search.toLowerCase()) ||
      (emp.cnae && emp.cnae.toLowerCase().includes(search.toLowerCase()))
    );
  }, [empresas, search]);

  const totalEmployees = useMemo(() => {
    return empresas.reduce((sum, emp) => sum + emp.employeeCount, 0);
  }, [empresas]);

  const getRiskBadge = (risk?: number) => {
    if (!risk) return <Badge variant="outline">-</Badge>;
    const colors: Record<number, string> = {
      1: 'bg-emerald-100 text-emerald-700',
      2: 'bg-yellow-100 text-yellow-700',
      3: 'bg-orange-100 text-orange-700',
      4: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={colors[risk] || 'bg-muted text-muted-foreground'}>
        Grau {risk}
      </Badge>
    );
  };

  const handleEdit = (empresa: EmpresaWithCount) => {
    if (isDemoMode) {
      handleDemoAction();
      return;
    }
    setEditingEmpresa(empresa);
    setIsModalOpen(true);
  };

  const handleDelete = (empresa: EmpresaWithCount) => {
    if (isDemoMode) {
      handleDemoAction();
      return;
    }
    setEmpresaToDelete(empresa);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (empresaToDelete) {
      await deleteEmpresa(empresaToDelete.id);
      setDeleteDialogOpen(false);
      setEmpresaToDelete(null);
    }
  };

  const handleSave = async (empresa: Partial<Empresa>) => {
    await saveEmpresa(empresa);
    setIsModalOpen(false);
    setEditingEmpresa(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmpresa(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-100">
                <Building className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{empresas.length}</p>
                <p className="text-sm text-muted-foreground">Total de Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-100">
                <AlertTriangle className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {empresas.filter(e => e.grau_risco && e.grau_risco >= 3).length}
                </p>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <Search className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{filteredEmpresas.length}</p>
                <p className="text-sm text-muted-foreground">Filtradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-600" />
              Empresas
            </CardTitle>
            <Button onClick={() => isDemoMode ? handleDemoAction() : setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Empresa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, nome ou CNAE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNAE</TableHead>
                  <TableHead className="text-center">% Encargos</TableHead>
                  <TableHead className="text-center">Grau Risco</TableHead>
                  <TableHead className="text-center">Colaboradores</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmpresas.map(emp => (
                    <TableRow key={emp.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {emp.codempresa}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{emp.nomeempresa}</TableCell>
                      <TableCell>
                        {emp.cnae ? (
                          <Badge variant="secondary">{emp.cnae}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {emp.percentual_encargos ? `${emp.percentual_encargos}%` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getRiskBadge(emp.grau_risco)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={emp.employeeCount > 0 ? "default" : "outline"} 
                          className={`gap-1 ${emp.employeeCount > 0 ? 'cursor-pointer hover:opacity-80' : ''}`}
                          onClick={() => {
                            if (emp.employeeCount > 0) {
                              navigate('/app', { state: { view: 'employees', filterEmpresa: emp.codempresa } });
                            }
                          }}
                        >
                          <Users className="w-3 h-3" />
                          {emp.employeeCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(emp)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(emp)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <EmpresaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        empresa={editingEmpresa}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{empresaToDelete?.nomeempresa}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
