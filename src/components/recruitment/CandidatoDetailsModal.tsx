import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  ExternalLink, FileText, Edit, Plus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import type { Candidato, Vaga, Candidatura } from '@/types/recruitment';

interface CandidatoDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidato?: Candidato | null;
  vagas: Vaga[];
  candidaturas: Candidatura[];
  onCreateCandidatura: (candidatoId: string, vagaId: string) => Promise<any>;
  onEdit: () => void;
}

export const CandidatoDetailsModal = ({
  open,
  onOpenChange,
  candidato,
  vagas,
  candidaturas,
  onCreateCandidatura,
  onEdit,
}: CandidatoDetailsModalProps) => {
  const [selectedVagaId, setSelectedVagaId] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);

  if (!candidato) return null;

  const candidatoCandidaturas = candidaturas.filter(c => c.candidato_id === candidato.id);
  const vagasAplicadas = candidatoCandidaturas.map(c => c.vaga_id);
  const vagasDisponiveis = vagas.filter(v => 
    v.status === 'aberta' && !vagasAplicadas.includes(v.id)
  );

  const handleApply = async () => {
    if (!selectedVagaId) return;
    setIsApplying(true);
    try {
      await onCreateCandidatura(candidato.id, selectedVagaId);
      setSelectedVagaId('');
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'inativo': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'contratado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'arquivado': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Candidato</DialogTitle>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              {candidato.foto_url ? (
                <img src={candidato.foto_url} alt={candidato.nome} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{candidato.nome}</h2>
              <Badge className={getStatusColor(candidato.status)}>
                {candidato.status}
              </Badge>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{candidato.email}</span>
                </div>
                {candidato.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{candidato.telefone}</span>
                  </div>
                )}
                {candidato.cidade && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{candidato.cidade}{candidato.estado ? `, ${candidato.estado}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-2">
            {candidato.linkedin_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={candidato.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {candidato.curriculo_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={candidato.curriculo_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-2" />
                  Currículo
                </a>
              </Button>
            )}
          </div>

          {/* Resumo */}
          {candidato.resumo_profissional && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resumo Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{candidato.resumo_profissional}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {candidato.skills && candidato.skills.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Competências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidato.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.skill_name}
                      {skill.nivel && (
                        <span className="ml-1 opacity-70">({skill.nivel})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidaturas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Candidaturas ({candidatoCandidaturas.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidatoCandidaturas.map((cand) => {
                const vaga = vagas.find(v => v.id === cand.vaga_id);
                return (
                  <div key={cand.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{vaga?.titulo || 'Vaga'}</p>
                      <p className="text-xs text-muted-foreground">{cand.etapa}</p>
                    </div>
                    {cand.match_score != null && (
                      <Badge variant={cand.match_score >= 70 ? 'default' : 'secondary'}>
                        {cand.match_score}% match
                      </Badge>
                    )}
                  </div>
                );
              })}

              {/* Apply to new vaga */}
              {vagasDisponiveis.length > 0 && (
                <div className="flex gap-2 pt-2 border-t">
                  <Select value={selectedVagaId} onValueChange={setSelectedVagaId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Inscrever em vaga..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vagasDisponiveis.map(vaga => (
                        <SelectItem key={vaga.id} value={vaga.id}>{vaga.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleApply} 
                    disabled={!selectedVagaId || isApplying}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Inscrever
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info adicional */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {candidato.pretensao_salarial && (
              <div>
                <span className="text-muted-foreground">Pretensão:</span>{' '}
                <span className="font-medium">R$ {candidato.pretensao_salarial.toLocaleString()}</span>
              </div>
            )}
            {candidato.disponibilidade && (
              <div>
                <span className="text-muted-foreground">Disponibilidade:</span>{' '}
                <span className="font-medium">{candidato.disponibilidade}</span>
              </div>
            )}
            {candidato.fonte && (
              <div>
                <span className="text-muted-foreground">Fonte:</span>{' '}
                <span className="font-medium">{candidato.fonte}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
