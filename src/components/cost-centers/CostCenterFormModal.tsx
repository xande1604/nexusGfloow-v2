import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CostCenter } from '@/types';
import { Empresa } from '@/hooks/useEmpresas';

interface CostCenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (costCenter: Partial<CostCenter> & { is_active?: boolean }) => void;
  costCenter: (CostCenter & { is_active?: boolean }) | null;
  empresas: Empresa[];
}

export const CostCenterFormModal = ({
  isOpen,
  onClose,
  onSave,
  costCenter,
  empresas,
}: CostCenterFormModalProps) => {
  const [formData, setFormData] = useState({
    codcentrodecustos: '',
    nomecentrodecustos: '',
    codempresa: '',
    is_active: true,
  });

  useEffect(() => {
    if (costCenter) {
      setFormData({
        codcentrodecustos: costCenter.codcentrodecustos,
        nomecentrodecustos: costCenter.nomecentrodecustos,
        codempresa: costCenter.codempresa,
        is_active: costCenter.is_active !== false,
      });
    } else {
      setFormData({
        codcentrodecustos: '',
        nomecentrodecustos: '',
        codempresa: empresas[0]?.codempresa || '',
        is_active: true,
      });
    }
  }, [costCenter, empresas, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: costCenter?.id,
      ...formData,
    });
  };

  const isEditing = !!costCenter;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Centro de Custos' : 'Novo Centro de Custos'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codcentrodecustos">Código</Label>
            <Input
              id="codcentrodecustos"
              value={formData.codcentrodecustos}
              onChange={(e) => setFormData(prev => ({ ...prev, codcentrodecustos: e.target.value }))}
              placeholder="Ex: CC001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomecentrodecustos">Nome</Label>
            <Input
              id="nomecentrodecustos"
              value={formData.nomecentrodecustos}
              onChange={(e) => setFormData(prev => ({ ...prev, nomecentrodecustos: e.target.value }))}
              placeholder="Ex: Departamento Financeiro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codempresa">Empresa</Label>
            <Select
              value={formData.codempresa}
              onValueChange={(value) => setFormData(prev => ({ ...prev, codempresa: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map(empresa => (
                  <SelectItem key={empresa.codempresa} value={empresa.codempresa}>
                    {empresa.codempresa} - {empresa.nomeempresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Ativo</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
