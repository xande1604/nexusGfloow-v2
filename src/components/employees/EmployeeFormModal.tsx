import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobRole } from '@/types';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useCostCenters } from '@/hooks/useCostCenters';

export interface EmployeeFormData {
  nome: string;
  email?: string;
  codigocargo?: string;
  dataadmissao?: string;
  codempresa?: string;
  codcentrodecustos?: string;
  matricula?: string;
}

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: JobRole[];
  onSave: (data: EmployeeFormData) => Promise<{ success: boolean; error?: any }>;
  initialData?: EmployeeFormData & { id?: string };
  mode?: 'create' | 'edit';
}

export const EmployeeFormModal = ({ open, onOpenChange, roles, onSave, initialData, mode = 'create' }: EmployeeFormModalProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [codigocargo, setCodigocargo] = useState('');
  const [dataadmissao, setDataadmissao] = useState('');
  const [codempresa, setCodempresa] = useState('');
  const [codcentrodecustos, setCodcentrodecustos] = useState('');
  const [matricula, setMatricula] = useState('');
  const [saving, setSaving] = useState(false);
  const { empresas } = useEmpresas();
  const { costCenters } = useCostCenters();

  useEffect(() => {
    if (open && initialData) {
      setNome(initialData.nome || '');
      setEmail(initialData.email || '');
      setCodigocargo(initialData.codigocargo || '');
      setDataadmissao(initialData.dataadmissao || '');
      setCodempresa(initialData.codempresa || '');
      setCodcentrodecustos(initialData.codcentrodecustos || '');
      setMatricula(initialData.matricula || '');
    } else if (!open) {
      setNome('');
      setEmail('');
      setCodigocargo('');
      setDataadmissao('');
      setCodempresa('');
      setCodcentrodecustos('');
      setMatricula('');
    }
  }, [open, initialData]);

  const filteredCostCenters = (codempresa
    ? costCenters.filter(cc => cc.codempresa === codempresa)
    : costCenters
  ).sort((a, b) => (a.codcentrodecustos || '').localeCompare(b.codcentrodecustos || ''));

  const handleSave = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    try {
      const result = await onSave({
        nome: nome.trim(),
        email: email.trim() || undefined,
        codigocargo: codigocargo || undefined,
        dataadmissao: dataadmissao || undefined,
        codempresa: codempresa || undefined,
        codcentrodecustos: codcentrodecustos || undefined,
        matricula: matricula.trim() || undefined,
      });
      if (result.success) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div>
            <Label htmlFor="matricula">Matrícula</Label>
            <Input id="matricula" value={matricula} onChange={e => setMatricula(e.target.value)} placeholder="Código de matrícula" />
          </div>
          <div>
            <Label>Cargo</Label>
            <Select value={codigocargo} onValueChange={setCodigocargo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.codigocargo || role.id}>
                    {role.codigocargo ? `${role.codigocargo} - ${role.title}` : role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dataadmissao">Data de Admissão</Label>
            <Input id="dataadmissao" type="date" value={dataadmissao} onChange={e => setDataadmissao(e.target.value)} />
          </div>
          <div>
            <Label>Empresa</Label>
            <Select value={codempresa} onValueChange={(v) => { setCodempresa(v); setCodcentrodecustos(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map(emp => (
                  <SelectItem key={emp.id} value={emp.codempresa}>
                    {emp.codempresa} - {emp.nomeempresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Centro de Custos</Label>
            <Select value={codcentrodecustos} onValueChange={setCodcentrodecustos}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um centro de custos" />
              </SelectTrigger>
              <SelectContent>
                {filteredCostCenters.map(cc => (
                  <SelectItem key={cc.id} value={cc.codcentrodecustos}>
                    {cc.codcentrodecustos} - {cc.nomecentrodecustos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!nome.trim() || saving}>
              {saving ? 'Salvando...' : mode === 'edit' ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
