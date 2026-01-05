import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import type { Candidatura, Entrevista } from '@/types/recruitment';

interface EntrevistaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatura?: Candidatura | null;
  onSchedule: (entrevista: Partial<Entrevista>) => Promise<any>;
}

export const EntrevistaModal = ({
  open,
  onOpenChange,
  candidatura,
  onSchedule,
}: EntrevistaModalProps) => {
  const [formData, setFormData] = useState({
    tipo: 'rh' as Entrevista['tipo'],
    data_hora: '',
    duracao_minutos: 60,
    local: '',
    link_online: '',
    notas: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidatura) return;

    setIsSubmitting(true);
    try {
      await onSchedule({
        candidatura_id: candidatura.id,
        tipo: formData.tipo,
        data_hora: new Date(formData.data_hora).toISOString(),
        duracao_minutos: formData.duracao_minutos,
        local: formData.local || undefined,
        link_online: formData.link_online || undefined,
        notas: formData.notas || undefined,
        status: 'agendada',
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        tipo: 'rh',
        data_hora: '',
        duracao_minutos: 60,
        local: '',
        link_online: '',
        notas: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendar Entrevista
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo de Entrevista</Label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rh">Entrevista RH</SelectItem>
                <SelectItem value="tecnica">Técnica</SelectItem>
                <SelectItem value="gestor">Com Gestor</SelectItem>
                <SelectItem value="cultura">Fit Cultural</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_hora">Data e Hora *</Label>
            <Input
              id="data_hora"
              type="datetime-local"
              value={formData.data_hora}
              onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="duracao">Duração (minutos)</Label>
            <Select
              value={formData.duracao_minutos.toString()}
              onValueChange={(v) => setFormData({ ...formData, duracao_minutos: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="local">Local (presencial)</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData({ ...formData, local: e.target.value })}
              placeholder="Sala de reunião, escritório..."
            />
          </div>

          <div>
            <Label htmlFor="link">Link (online)</Label>
            <Input
              id="link"
              value={formData.link_online}
              onChange={(e) => setFormData({ ...formData, link_online: e.target.value })}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div>
            <Label htmlFor="notas">Observações</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
