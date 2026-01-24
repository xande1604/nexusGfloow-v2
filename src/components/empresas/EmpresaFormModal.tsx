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
import { Empresa } from '@/hooks/useEmpresas';

interface EmpresaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (empresa: Partial<Empresa>) => void;
  empresa: Empresa | null;
}

export const EmpresaFormModal = ({
  isOpen,
  onClose,
  onSave,
  empresa,
}: EmpresaFormModalProps) => {
  const [formData, setFormData] = useState({
    codempresa: '',
    nomeempresa: '',
    cnae: '',
    percentual_encargos: 80,
    grau_risco: 1,
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        codempresa: empresa.codempresa || '',
        nomeempresa: empresa.nomeempresa || '',
        cnae: empresa.cnae || '',
        percentual_encargos: empresa.percentual_encargos ?? 80,
        grau_risco: empresa.grau_risco ?? 1,
      });
    } else {
      setFormData({
        codempresa: '',
        nomeempresa: '',
        cnae: '',
        percentual_encargos: 80,
        grau_risco: 1,
      });
    }
  }, [empresa, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: empresa?.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codempresa">Código</Label>
              <Input
                id="codempresa"
                value={formData.codempresa}
                onChange={(e) =>
                  setFormData({ ...formData, codempresa: e.target.value.toUpperCase() })
                }
                placeholder="EMP001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnae">CNAE</Label>
              <Input
                id="cnae"
                value={formData.cnae}
                onChange={(e) =>
                  setFormData({ ...formData, cnae: e.target.value })
                }
                placeholder="0000-0/00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nomeempresa">Nome da Empresa</Label>
            <Input
              id="nomeempresa"
              value={formData.nomeempresa}
              onChange={(e) =>
                setFormData({ ...formData, nomeempresa: e.target.value })
              }
              placeholder="Nome da empresa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentual_encargos">% Encargos</Label>
              <Input
                id="percentual_encargos"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.percentual_encargos}
                onChange={(e) =>
                  setFormData({ ...formData, percentual_encargos: parseFloat(e.target.value) || 0 })
                }
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grau_risco">Grau de Risco</Label>
              <Input
                id="grau_risco"
                type="number"
                min="1"
                max="4"
                value={formData.grau_risco}
                onChange={(e) =>
                  setFormData({ ...formData, grau_risco: parseInt(e.target.value) || 1 })
                }
                placeholder="1-4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {empresa ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
