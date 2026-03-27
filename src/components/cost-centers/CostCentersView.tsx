import { useState, useMemo } from 'react';
import { Building2, Search, Plus, Pencil, Trash2, Users, CheckSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useCostCenters, CostCenterWithCount } from '@/hooks/useCostCenters';
import { useEmpresas } from '@/hooks/useEmpresas';
import { CostCenterFormModal } from './CostCenterFormModal';
import { CostCenter } from '@/types';
import { Loader2 } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { demoCostCenters, demoEmpresas } from '@/components/demo/demoData';
import { toast } from 'sonner';

interface CostCentersViewProps {
  onNavigateToEmployees?: (costCenterCode: string) => void;
}

export const CostCentersView = ({ onNavigateToEmployees }: CostCentersViewProps) => {
  const { isDemoMode } = useDemo();
  const { costCenters: realCostCenters, loading, saveCostCenter, deleteCostCenter, bulkUpdateActive } = useCostCenters();
  const { empresas: realEmpresas } = useEmpresas();
  
  const costCenters = isDemoMode ? demoCostCenters : realCostCenters;
  const empresas = isDemoMode ? demoEmpresas : realEmpresas;
  
  const [search, setSearch] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenterWithCount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costCenterToDelete, setCostCenterToDelete] = useState<CostCenterWithCount | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const handleDemoAction = () => {
    toast.info('Funcionalidade restrita no modo demonstração');
  };

  const filteredCostCenters = useMemo(() => {
    return costCenters.filter(cc => {
      const matchesSearch = 
        cc.nomecentrodecustos.toLowerCase().includes(search.toLowerCase()) ||
        cc.codcentrodecustos.toLowerCase().includes(search.toLowerCase());
      const matchesEmpresa = empresaFilter === 'all' || cc.codempresa === empresaFilter;
      return matchesSearch && matchesEmpresa;
    });
  }, [costCenters, search, empresaFilter]);

  const totalEmployees = useMemo(() => {
    return costCenters.reduce((sum, cc) => sum + cc.employeeCount, 0);
  }, [costCenters]);

  const getEmpresaName = (codempresa: string) => {
    const empresa = empresas.find(e => e.codempresa === codempresa);
    return empresa?.nomeempresa || codempresa;
  };

  const handleEdit = (costCenter: CostCenterWithCount) => {
    if (isDemoMode) { handleDemoAction(); return; }
    setEditingCostCenter(costCenter);
    setIsModalOpen(true);
  };

  const handleDelete = (costCenter: CostCenterWithCount) => {
    if (isDemoMode) { handleDemoAction(); return; }
    setCostCenterToDelete(costCenter);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (costCenterToDelete) {
      await deleteCostCenter(costCenterToDelete.id);
      setDeleteDialogOpen(false);
      setCostCenterToDelete(null);
    }
  };

  const handleSave = async (costCenter: Partial<CostCenter>) => {
    await saveCostCenter(costCenter);
    setIsModalOpen(false);
    setEditingCostCenter(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCostCenter(null);
  };

  // Bulk selection
  const allFilteredSelected = filteredCostCenters.length > 0 && filteredCostCenters.every(cc => selectedIds.has(cc.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCostCenters.map(cc => cc.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (isDemoMode) { handleDemoAction(); return; }
    if (selectedIds.size === 0) return;
    await bulkUpdateActive(Array.from(selectedIds), activate);
    setSelectedIds(new Set());
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
                <Building2 className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{costCenters.length}</p>
                <p className="text-sm text-muted-foreground">Total de Centros</p>
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
                <Building2 className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{empresas.length}</p>
                <p className="text-sm text-muted-foreground">Empresas</p>
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
                <p className="text-2xl font-bold text-foreground">{filteredCostCenters.length}</p>
                <p className="text-sm text-muted-foreground">Filtrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-600" />
              Centros de Custos
            </CardTitle>
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleBulkActivate(true)} className="gap-1">
                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                    Ativar ({selectedIds.size})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkActivate(false)} className="gap-1">
                    <ToggleLeft className="w-4 h-4 text-destructive" />
                    Inativar ({selectedIds.size})
                  </Button>
                </>
              )}
              <Button onClick={() => isDemoMode ? handleDemoAction() : setIsModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Centro de Custos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {empresas.map(empresa => (
                  <SelectItem key={empresa.codempresa} value={empresa.codempresa}>
                    {empresa.nomeempresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Colaboradores</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCostCenters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum centro de custos encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCostCenters.map(cc => (
                    <TableRow key={cc.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(cc.id)}
                          onCheckedChange={() => toggleSelect(cc.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {cc.codcentrodecustos}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{cc.nomecentrodecustos}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getEmpresaName(cc.codempresa)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={(cc as any).is_active !== false ? "default" : "outline"} className={(cc as any).is_active !== false ? "bg-emerald-500" : "text-muted-foreground"}>
                          {(cc as any).is_active !== false ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={cc.employeeCount > 0 ? "default" : "outline"}
                          className={`gap-1 ${cc.employeeCount > 0 && onNavigateToEmployees ? 'cursor-pointer hover:opacity-80' : ''}`}
                          onClick={() => {
                            if (cc.employeeCount > 0 && onNavigateToEmployees) {
                              onNavigateToEmployees(cc.codcentrodecustos);
                            }
                          }}
                        >
                          <Users className="w-3 h-3" />
                          {cc.employeeCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cc)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cc)}
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
      <CostCenterFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        costCenter={editingCostCenter}
        empresas={empresas}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o centro de custos "{costCenterToDelete?.nomecentrodecustos}"? 
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
