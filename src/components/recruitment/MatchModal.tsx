import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Candidato, Vaga, Candidatura } from '@/types/recruitment';
import { cn } from '@/lib/utils';

interface MatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatura?: Candidatura | null;
  candidato?: Candidato;
  vaga?: Vaga;
  onUpdateMatchScore: (candidaturaId: string, matchScore: number, matchDetalhes: any) => Promise<void>;
}

export const MatchModal = ({
  open,
  onOpenChange,
  candidatura,
  candidato,
  vaga,
  onUpdateMatchScore,
}: MatchModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const { toast } = useToast();

  const runMatch = async () => {
    if (!candidato || !vaga || !candidatura) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-candidato', {
        body: {
          candidato: {
            nome: candidato.nome,
            resumo_profissional: candidato.resumo_profissional,
            pretensao_salarial: candidato.pretensao_salarial,
            curriculo_url: candidato.curriculo_url,
            skills: candidato.skills || [],
            experiencias: candidato.experiencias || [],
            formacoes: candidato.formacoes || [],
          },
          vaga: {
            titulo: vaga.titulo,
            descricao: vaga.descricao,
            requisitos: vaga.requisitos,
            salario_min: vaga.salario_min,
            salario_max: vaga.salario_max,
            skills: vaga.skills || [],
          },
        },
      });

      if (error) throw error;

      setMatchResult(data);
      
      // Save match score
      await onUpdateMatchScore(candidatura.id, data.match_score, data);

      toast({
        title: 'Match realizado',
        description: `Score: ${data.match_score}%`,
      });
    } catch (error: any) {
      console.error('Error running match:', error);
      toast({
        title: 'Erro ao realizar match',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use existing match data if available
  const displayResult = matchResult || (candidatura?.match_detalhes ? candidatura.match_detalhes : null);
  const displayScore = matchResult?.match_score ?? candidatura?.match_score;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Match com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Header info */}
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-medium">{candidato?.nome || 'Candidato'}</p>
            <p className="text-sm text-muted-foreground">{vaga?.titulo || 'Vaga'}</p>
          </div>

          {/* Run Match Button */}
          {!displayResult && (
            <Button 
              onClick={runMatch} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Executar Match IA
                </>
              )}
            </Button>
          )}

          {/* Results */}
          {displayResult && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="text-center py-4">
                <div className={cn("text-5xl font-bold", getScoreColor(displayScore))}>
                  {displayScore}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Score de Compatibilidade</p>
              </div>

              {/* Score breakdown */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Skills</span>
                    <span>{displayResult.score_skills}%</span>
                  </div>
                  <Progress value={displayResult.score_skills} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Experiência</span>
                    <span>{displayResult.score_experiencia}%</span>
                  </div>
                  <Progress value={displayResult.score_experiencia} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Formação</span>
                    <span>{displayResult.score_formacao}%</span>
                  </div>
                  <Progress value={displayResult.score_formacao} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Salário</span>
                    <span>{displayResult.score_salario}%</span>
                  </div>
                  <Progress value={displayResult.score_salario} className="h-2" />
                </div>
              </div>

              {/* Skills Match */}
              {displayResult.skills_match && displayResult.skills_match.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {displayResult.skills_match.map((sm: any, i: number) => (
                      <Badge 
                        key={i} 
                        variant={sm.match ? 'default' : 'outline'}
                        className={cn(
                          sm.match ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        )}
                      >
                        {sm.match ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        {sm.skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pontos fortes */}
              {displayResult.pontos_fortes && displayResult.pontos_fortes.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-600" />
                    Pontos Fortes
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {displayResult.pontos_fortes.map((p: string, i: number) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {displayResult.gaps && displayResult.gaps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Gaps
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {displayResult.gaps.map((g: string, i: number) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Summary */}
              {displayResult.resumo_ia && (
                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                  <p className="text-sm">{displayResult.resumo_ia}</p>
                </div>
              )}

              {/* Recommendation */}
              {displayResult.recomendacao && (
                <div className="text-center">
                  <Badge 
                    className={cn(
                      "text-base py-1 px-4",
                      displayResult.recomendacao === 'aprovar' ? 'bg-green-500' :
                      displayResult.recomendacao === 'reprovar' ? 'bg-red-500' : 'bg-amber-500'
                    )}
                  >
                    {displayResult.recomendacao === 'aprovar' ? 'Recomendado' :
                     displayResult.recomendacao === 'reprovar' ? 'Não Recomendado' : 'Reavaliar'}
                  </Badge>
                </div>
              )}

              {/* Re-run button */}
              <Button 
                onClick={runMatch} 
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Executar Novamente'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
