import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, ChevronLeft, User, Sparkles, Calendar, 
  MessageSquare, MoreVertical, Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ETAPAS_PIPELINE, type Candidato, type Vaga, type Candidatura, type EtapaCandidatura } from '@/types/recruitment';
import { MatchModal } from './MatchModal';
import { EntrevistaModal } from './EntrevistaModal';
import { FeedbackModal } from './FeedbackModal';
import { cn } from '@/lib/utils';

interface PipelineTabProps {
  candidatos: Candidato[];
  vagas: Vaga[];
  candidaturas: Candidatura[];
  onUpdateEtapa: (candidaturaId: string, etapa: EtapaCandidatura, status?: string) => Promise<void>;
  onUpdateMatchScore: (candidaturaId: string, matchScore: number, matchDetalhes: any) => Promise<void>;
  onScheduleEntrevista: (entrevista: any) => Promise<any>;
  onAddFeedback: (feedback: any) => Promise<any>;
  isDemoMode?: boolean;
}

export const PipelineTab = ({
  candidatos,
  vagas,
  candidaturas,
  onUpdateEtapa,
  onUpdateMatchScore,
  onScheduleEntrevista,
  onAddFeedback,
  isDemoMode,
}: PipelineTabProps) => {
  const [selectedVagaId, setSelectedVagaId] = useState<string>('all');
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isEntrevistaModalOpen, setIsEntrevistaModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const filteredCandidaturas = useMemo(() => {
    if (selectedVagaId === 'all') return candidaturas;
    return candidaturas.filter(c => c.vaga_id === selectedVagaId);
  }, [candidaturas, selectedVagaId]);

  const getCandidato = (candidatoId: string) => candidatos.find(c => c.id === candidatoId);
  const getVaga = (vagaId: string) => vagas.find(v => v.id === vagaId);

  const getEtapaIndex = (etapa: EtapaCandidatura) => 
    ETAPAS_PIPELINE.findIndex(e => e.key === etapa);

  const canMoveForward = (etapa: EtapaCandidatura) => {
    const index = getEtapaIndex(etapa);
    return index < ETAPAS_PIPELINE.length - 3; // Exclude contratado, reprovado, desistencia
  };

  const canMoveBack = (etapa: EtapaCandidatura) => {
    const index = getEtapaIndex(etapa);
    return index > 0 && index < ETAPAS_PIPELINE.length - 2;
  };

  const moveToNextEtapa = async (candidatura: Candidatura) => {
    const currentIndex = getEtapaIndex(candidatura.etapa);
    if (currentIndex < ETAPAS_PIPELINE.length - 3) {
      const nextEtapa = ETAPAS_PIPELINE[currentIndex + 1].key;
      await onUpdateEtapa(candidatura.id, nextEtapa);
    }
  };

  const moveToPreviousEtapa = async (candidatura: Candidatura) => {
    const currentIndex = getEtapaIndex(candidatura.etapa);
    if (currentIndex > 0) {
      const prevEtapa = ETAPAS_PIPELINE[currentIndex - 1].key;
      await onUpdateEtapa(candidatura.id, prevEtapa);
    }
  };

  const handleApprove = async (candidatura: Candidatura) => {
    await onUpdateEtapa(candidatura.id, 'contratado', 'aprovado');
  };

  const handleReject = async (candidatura: Candidatura) => {
    await onUpdateEtapa(candidatura.id, 'reprovado', 'reprovado');
  };

  const openMatchModal = (candidatura: Candidatura) => {
    setSelectedCandidatura(candidatura);
    setIsMatchModalOpen(true);
  };

  const openEntrevistaModal = (candidatura: Candidatura) => {
    setSelectedCandidatura(candidatura);
    setIsEntrevistaModalOpen(true);
  };

  const openFeedbackModal = (candidatura: Candidatura) => {
    setSelectedCandidatura(candidatura);
    setIsFeedbackModalOpen(true);
  };

  // Group by etapa for Kanban view
  const candidaturasByEtapa = useMemo(() => {
    const grouped: Record<string, Candidatura[]> = {};
    ETAPAS_PIPELINE.forEach(etapa => {
      grouped[etapa.key] = filteredCandidaturas.filter(c => c.etapa === etapa.key);
    });
    return grouped;
  }, [filteredCandidaturas]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedVagaId} onValueChange={setSelectedVagaId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Filtrar por vaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as vagas</SelectItem>
            {vagas.filter(v => v.status === 'aberta' || v.status === 'em_analise').map(vaga => (
              <SelectItem key={vaga.id} value={vaga.id}>{vaga.titulo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ETAPAS_PIPELINE.slice(0, 6).map((etapa) => (
          <div key={etapa.key} className="flex-shrink-0 w-72">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", etapa.color)} />
                    {etapa.label}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {candidaturasByEtapa[etapa.key]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2 min-h-[200px]">
                {candidaturasByEtapa[etapa.key]?.map((candidatura) => {
                  const candidato = getCandidato(candidatura.candidato_id);
                  const vaga = getVaga(candidatura.vaga_id);
                  
                  return (
                    <Card key={candidatura.id} className="bg-secondary/50 hover:bg-secondary transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{candidato?.nome || 'Candidato'}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {vaga?.titulo || 'Vaga'}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openMatchModal(candidatura)}>
                                <Zap className="w-4 h-4 mr-2" />
                                Match IA
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEntrevistaModal(candidatura)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar Entrevista
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openFeedbackModal(candidatura)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Adicionar Feedback
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Match Score */}
                        {candidatura.match_score != null && (
                          <div className="mt-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  candidatura.match_score >= 70 ? 'bg-green-500' :
                                  candidatura.match_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                )}
                                style={{ width: `${candidatura.match_score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{candidatura.match_score}%</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={!canMoveBack(candidatura.etapa) || isDemoMode}
                            onClick={() => moveToPreviousEtapa(candidatura)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          
                          <div className="flex gap-1">
                            {etapa.key === 'proposta' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-green-600 hover:text-green-700 hover:bg-green-100"
                                  onClick={() => handleApprove(candidatura)}
                                  disabled={isDemoMode}
                                >
                                  Contratar
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
                              onClick={() => handleReject(candidatura)}
                              disabled={isDemoMode}
                            >
                              Reprovar
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={!canMoveForward(candidatura.etapa) || isDemoMode}
                            onClick={() => moveToNextEtapa(candidatura)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {(!candidaturasByEtapa[etapa.key] || candidaturasByEtapa[etapa.key].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum candidato
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Modals */}
      <MatchModal
        open={isMatchModalOpen}
        onOpenChange={setIsMatchModalOpen}
        candidatura={selectedCandidatura}
        candidato={selectedCandidatura ? getCandidato(selectedCandidatura.candidato_id) : undefined}
        vaga={selectedCandidatura ? getVaga(selectedCandidatura.vaga_id) : undefined}
        onUpdateMatchScore={onUpdateMatchScore}
      />

      <EntrevistaModal
        open={isEntrevistaModalOpen}
        onOpenChange={setIsEntrevistaModalOpen}
        candidatura={selectedCandidatura}
        onSchedule={onScheduleEntrevista}
      />

      <FeedbackModal
        open={isFeedbackModalOpen}
        onOpenChange={setIsFeedbackModalOpen}
        candidatura={selectedCandidatura}
        onAddFeedback={onAddFeedback}
      />
    </div>
  );
};
