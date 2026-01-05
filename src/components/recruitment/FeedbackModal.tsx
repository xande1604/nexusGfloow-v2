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
import { MessageSquare, Star } from 'lucide-react';
import type { Candidatura, CandidaturaFeedback } from '@/types/recruitment';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatura?: Candidatura | null;
  onAddFeedback: (feedback: Partial<CandidaturaFeedback>) => Promise<any>;
}

export const FeedbackModal = ({
  open,
  onOpenChange,
  candidatura,
  onAddFeedback,
}: FeedbackModalProps) => {
  const [formData, setFormData] = useState({
    tipo: 'entrevista' as CandidaturaFeedback['tipo'],
    nota_geral: 3,
    avaliador_nome: '',
    pontos_fortes: '',
    pontos_melhoria: '',
    recomendacao: 'reavaliar' as CandidaturaFeedback['recomendacao'],
    comentarios: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidatura) return;

    setIsSubmitting(true);
    try {
      await onAddFeedback({
        candidatura_id: candidatura.id,
        tipo: formData.tipo,
        nota_geral: formData.nota_geral,
        avaliador_nome: formData.avaliador_nome || undefined,
        pontos_fortes: formData.pontos_fortes || undefined,
        pontos_melhoria: formData.pontos_melhoria || undefined,
        recomendacao: formData.recomendacao,
        comentarios: formData.comentarios || undefined,
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        tipo: 'entrevista',
        nota_geral: 3,
        avaliador_nome: '',
        pontos_fortes: '',
        pontos_melhoria: '',
        recomendacao: 'reavaliar',
        comentarios: '',
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
            <MessageSquare className="w-5 h-5" />
            Adicionar Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo de Feedback</Label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triagem">Triagem</SelectItem>
                <SelectItem value="entrevista">Entrevista</SelectItem>
                <SelectItem value="teste">Teste</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="avaliador">Nome do Avaliador</Label>
            <Input
              id="avaliador"
              value={formData.avaliador_nome}
              onChange={(e) => setFormData({ ...formData, avaliador_nome: e.target.value })}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <Label>Nota Geral</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData({ ...formData, nota_geral: n })}
                  className={cn(
                    "w-10 h-10 rounded-lg border flex items-center justify-center transition-colors",
                    formData.nota_geral >= n 
                      ? "bg-amber-100 border-amber-400 text-amber-600" 
                      : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  <Star className={cn("w-5 h-5", formData.nota_geral >= n && "fill-current")} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="pontos_fortes">Pontos Fortes</Label>
            <Textarea
              id="pontos_fortes"
              value={formData.pontos_fortes}
              onChange={(e) => setFormData({ ...formData, pontos_fortes: e.target.value })}
              rows={2}
              placeholder="O que o candidato fez bem..."
            />
          </div>

          <div>
            <Label htmlFor="pontos_melhoria">Pontos de Melhoria</Label>
            <Textarea
              id="pontos_melhoria"
              value={formData.pontos_melhoria}
              onChange={(e) => setFormData({ ...formData, pontos_melhoria: e.target.value })}
              rows={2}
              placeholder="O que pode melhorar..."
            />
          </div>

          <div>
            <Label htmlFor="recomendacao">Recomendação</Label>
            <Select
              value={formData.recomendacao}
              onValueChange={(v) => setFormData({ ...formData, recomendacao: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aprovar">Aprovar</SelectItem>
                <SelectItem value="reavaliar">Reavaliar</SelectItem>
                <SelectItem value="reprovar">Reprovar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="comentarios">Comentários Adicionais</Label>
            <Textarea
              id="comentarios"
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
