import { useState, useMemo } from 'react';
import { Building2, Search, Plus, Pencil, Trash2 } from 'lucide-react';
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
import { useCostCenters } from '@/hooks/useCostCenters';
import { useEmpresas } from '@/hooks/useEmpresas';
import { CostCenterFormModal } from './CostCenterFormModal';
import { CostCenter } from '@/types';
import { Loader2 } from 'lucide-react';

export const CostCentersView = () => {
  const { costCenters, loading, saveCostCenter, deleteCostCenter } = useCostCenters();
  const { empresas } = useEmpresas();
  const [search, setSearch] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costCenterToDelete, setCostCenterToDelete] = useState<CostCenter | null>(null);

  const filteredCostCenters = useMemo(() => {
    return costCenters.filter(cc => {
      const matchesSearch = 
        cc.nomecentrodecustos.toLowerCase().includes(search.toLowerCase()) ||
        cc.codcentrodecustos.toLowerCase().includes(search.toLowerCase());
      const matchesEmpresa = empresaFilter === 'all' || cc.codempresa === empresaFilter;
      return matchesSearch && matchesEmpresa;
    });
  }, [costCenters, search, empresaFilter]);

  const getEmpresaName = (codempresa: string) => {
    const empresa = empresas.find(e => e.codempresa === codempresa);
    return empresa?.nomeempresa || codempresa;
  };

  const handleEdit = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setIsModalOpen(true);
  };

  const handleDelete = (costCenter: CostCenter) => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Building2 className="w-6 h-6 text-emerald-600" />
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
                <p className="text-sm text-muted-foreground">Resultados Filtrados</p>
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
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Centro de Custos
            </Button>
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCostCenters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum centro de custos encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCostCenters.map(cc => (
                    <TableRow key={cc.id} className="hover:bg-muted/30">
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
