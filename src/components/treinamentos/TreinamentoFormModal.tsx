import { useState, useEffect } from 'react';
import { X, BookOpen, Building2, Calendar, Clock, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Treinamento, TreinamentoInput } from '@/hooks/useTreinamentos';

interface Employee {
  id: string;
  name: string;
}

interface TreinamentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TreinamentoInput) => Promise<{ success: boolean }>;
  onUpdate: (id: string, data: Partial<TreinamentoInput>) => Promise<{ success: boolean }>;
  editingTreinamento: Treinamento | null;
  employees: Employee[];
}

export const TreinamentoFormModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingTreinamento,
  employees,
}: TreinamentoFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TreinamentoInput>({
    employee_id: null,
    nome_treinamento: '',
    instituicao: '',
    data_inicio: '',
    data_conclusao: '',
    carga_horaria: null,
    status: 'concluido',
    observacoes: '',
  });

  useEffect(() => {
    if (editingTreinamento) {
      setFormData({
        employee_id: editingTreinamento.employee_id,
        nome_treinamento: editingTreinamento.nome_treinamento,
        instituicao: editingTreinamento.instituicao || '',
        data_inicio: editingTreinamento.data_inicio || '',
        data_conclusao: editingTreinamento.data_conclusao || '',
        carga_horaria: editingTreinamento.carga_horaria,
        status: editingTreinamento.status,
        observacoes: editingTreinamento.observacoes || '',
      });
    } else {
      setFormData({
        employee_id: null,
        nome_treinamento: '',
        instituicao: '',
        data_inicio: '',
        data_conclusao: '',
        carga_horaria: null,
        status: 'concluido',
        observacoes: '',
      });
    }
  }, [editingTreinamento, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_treinamento.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSave: TreinamentoInput = {
        ...formData,
        carga_horaria: formData.carga_horaria ? Number(formData.carga_horaria) : null,
        data_inicio: formData.data_inicio || null,
        data_conclusao: formData.data_conclusao || null,
      };

      let result;
      if (editingTreinamento) {
        result = await onUpdate(editingTreinamento.id, dataToSave);
      } else {
        result = await onSave(dataToSave);
      }

      if (result.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            {editingTreinamento ? 'Editar Treinamento' : 'Registrar Treinamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Nome do Treinamento */}
          <div className="space-y-2">
            <Label htmlFor="nome_treinamento" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Nome do Treinamento *
            </Label>
            <Input
              id="nome_treinamento"
              value={formData.nome_treinamento}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_treinamento: e.target.value }))}
              placeholder="Ex: Gestão de Projetos com Scrum"
              required
              className="bg-background border-input"
            />
          </div>

          {/* Colaborador */}
          <div className="space-y-2">
            <Label htmlFor="employee_id" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Colaborador
            </Label>
            <Select 
              value={formData.employee_id || 'none'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value === 'none' ? null : value }))}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não vincular a colaborador</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name || 'Sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instituição */}
          <div className="space-y-2">
            <Label htmlFor="instituicao" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Instituição
            </Label>
            <Input
              id="instituicao"
              value={formData.instituicao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, instituicao: e.target.value }))}
              placeholder="Ex: Udemy, Coursera, SENAC..."
              className="bg-background border-input"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data de Início
              </Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_conclusao" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data de Conclusão
              </Label>
              <Input
                id="data_conclusao"
                type="date"
                value={formData.data_conclusao || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_conclusao: e.target.value }))}
                className="bg-background border-input"
              />
            </div>
          </div>

          {/* Carga Horária e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carga_horaria" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Carga Horária (horas)
              </Label>
              <Input
                id="carga_horaria"
                type="number"
                min="0"
                value={formData.carga_horaria || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, carga_horaria: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Ex: 40"
                className="bg-background border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'em_andamento' | 'concluido' | 'cancelado') => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o treinamento..."
              rows={3}
              className="bg-background border-input resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.nome_treinamento.trim()}>
              {isSubmitting ? 'Salvando...' : (editingTreinamento ? 'Salvar Alterações' : 'Registrar Treinamento')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
