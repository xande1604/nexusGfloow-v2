import { useState } from 'react';
import { Sparkles, Loader2, X, CheckCircle2, Award, Plus, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Treinamento } from '@/hooks/useTreinamentos';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SuggestedSkill {
  name: string;
  category: 'Technical' | 'Soft Skill' | 'Leadership' | 'Language';
  description: string;
  relevance: 'high' | 'medium' | 'low';
}

interface SuggestSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  treinamento: Treinamento | null;
  existingSkills: string[];
  onSkillsSelected: (skills: SuggestedSkill[]) => void;
}

export const SuggestSkillsModal = ({
  isOpen,
  onClose,
  treinamento,
  existingSkills,
  onSkillsSelected
}: SuggestSkillsModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!treinamento) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-training-skills', {
        body: {
          training: {
            nome_treinamento: treinamento.nome_treinamento,
            instituicao: treinamento.instituicao,
            carga_horaria: treinamento.carga_horaria,
            observacoes: treinamento.observacoes
          },
          existingSkills
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Erro na análise',
          description: data.error,
          variant: 'destructive'
        });
        return;
      }

      setSuggestedSkills(data.skills || []);
      setSummary(data.summary || '');
      setSelectedSkills(new Set(data.skills?.map((s: SuggestedSkill) => s.name) || []));
      setHasAnalyzed(true);

    } catch (error: any) {
      console.error('Error analyzing training:', error);
      toast({
        title: 'Erro ao analisar treinamento',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSkill = (skillName: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillName)) {
        next.delete(skillName);
      } else {
        next.add(skillName);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = suggestedSkills.filter(s => selectedSkills.has(s.name));
    onSkillsSelected(selected);
    handleClose();
  };

  const handleClose = () => {
    setSuggestedSkills([]);
    setSummary('');
    setSelectedSkills(new Set());
    setHasAnalyzed(false);
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-info/10 text-info border-info/20';
      case 'Soft Skill':
        return 'bg-success/10 text-success border-success/20';
      case 'Leadership':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Language':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-secondary text-foreground';
    }
  };

  const getRelevanceBadge = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return <Badge variant="default" className="bg-success/20 text-success text-xs">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-warning/20 text-warning text-xs">Média</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Baixa</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            Sugerir Habilidades com IA
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Training Info */}
          {treinamento && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium text-foreground mb-1">{treinamento.nome_treinamento}</h4>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {treinamento.instituicao && <span>{treinamento.instituicao}</span>}
                {treinamento.carga_horaria && <span>{treinamento.carga_horaria}h</span>}
              </div>
            </div>
          )}

          {/* Analyze Button - Show only if not analyzed yet */}
          {!hasAnalyzed && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  A IA irá analisar o treinamento e sugerir as habilidades desenvolvidas pelo colaborador.
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisar Treinamento
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results */}
          {hasAnalyzed && suggestedSkills.length > 0 && (
            <>
              {/* Summary */}
              {summary && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground">{summary}</p>
                </div>
              )}

              {/* Skills List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Habilidades Sugeridas
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {selectedSkills.size} selecionadas
                  </span>
                </div>

                {suggestedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedSkills.has(skill.name)
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-background border-border hover:border-primary/20'
                    }`}
                    onClick={() => handleToggleSkill(skill.name)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSkills.has(skill.name)}
                        onCheckedChange={() => handleToggleSkill(skill.name)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <Badge className={getCategoryColor(skill.category)}>
                            {skill.category}
                          </Badge>
                          {getRelevanceBadge(skill.relevance)}
                        </div>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {hasAnalyzed && suggestedSkills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Não foi possível identificar habilidades para este treinamento.
            </div>
          )}
        </div>

        {/* Footer */}
        {hasAnalyzed && suggestedSkills.length > 0 && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedSkills.size === 0}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Usar {selectedSkills.size} Habilidade{selectedSkills.size !== 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
