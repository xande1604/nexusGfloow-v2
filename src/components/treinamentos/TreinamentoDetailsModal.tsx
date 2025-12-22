import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Treinamento } from '@/hooks/useTreinamentos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface TreinamentoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  treinamento: Treinamento | null;
  employeeName: string;
}

export const TreinamentoDetailsModal = ({ 
  isOpen, 
  onClose, 
  treinamento,
  employeeName 
}: TreinamentoDetailsModalProps) => {
  if (!treinamento) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-sm py-1 px-3">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Concluído
          </Badge>
        );
      case 'em_andamento':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-0 text-sm py-1 px-3">
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Em Andamento
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-700 border-0 text-sm py-1 px-3">
            <XCircle className="w-4 h-4 mr-1.5" /> Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            Detalhes do Treinamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título e Status */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {treinamento.nome_treinamento}
            </h3>
            {getStatusBadge(treinamento.status)}
          </div>

          <Separator />

          {/* Informações do Colaborador */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Colaborador</p>
              <p className="font-medium text-foreground">{employeeName}</p>
            </div>
          </div>

          {/* Instituição */}
          {treinamento.instituicao && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instituição</p>
                <p className="font-medium text-foreground">{treinamento.instituicao}</p>
              </div>
            </div>
          )}

          {/* Datas e Carga Horária */}
          <div className="grid grid-cols-2 gap-4">
            {treinamento.data_inicio && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium text-foreground">{formatDate(treinamento.data_inicio)}</p>
                </div>
              </div>
            )}

            {treinamento.data_conclusao && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                  <p className="font-medium text-foreground">{formatDate(treinamento.data_conclusao)}</p>
                </div>
              </div>
            )}
          </div>

          {treinamento.carga_horaria && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carga Horária</p>
                <p className="font-medium text-foreground">{treinamento.carga_horaria} horas</p>
              </div>
            </div>
          )}

          {/* Observações */}
          {treinamento.observacoes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Observações</span>
                </div>
                <p className="text-foreground bg-secondary/50 rounded-lg p-3 text-sm">
                  {treinamento.observacoes}
                </p>
              </div>
            </>
          )}

          {/* Certificado */}
          {treinamento.certificado_url && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Certificado</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(treinamento.certificado_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Certificado
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
