import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTests } from '@/hooks/useTests';
import { useJobRoles } from '@/hooks/useJobRoles';
import { useCostCenters } from '@/hooks/useCostCenters';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Sparkles, Search, Trash2, Users, Clock, Loader2, FileCheck, Eye, Settings, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TestSimulationModal } from './TestSimulationModal';
import { Test } from '@/types/tests';

interface TestsTabProps {
  isDemoMode?: boolean;
}

export const TestsTab = ({ isDemoMode = false }: TestsTabProps) => {
  const { tests, loading, saveTest, deleteTest } = useTests();
  const { roles } = useJobRoles();
  const { costCenters } = useCostCenters();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationTest, setSimulationTest] = useState<Test | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cargoId: '',
    costCenterId: '',
    participationMode: 'cargo' as 'cargo' | 'selected' | 'self_enrollment',
    passingScore: 70,
    timeLimitMinutes: 60,
    isActive: true,
    questionCount: 10,
    multipleChoiceRatio: 0.7,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleGenerateQuestions = async () => {
    if (isDemoMode) {
      toast({ title: 'Modo demonstração', description: 'Esta função não está disponível.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-test', {
        body: {
          cargoId: formData.cargoId || null,
          costCenterId: formData.costCenterId || null,
          questionCount: formData.questionCount,
          multipleChoiceRatio: formData.multipleChoiceRatio,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedQuestions(data.questions || []);
      if (data.suggestedTitle && !formData.title) {
        setFormData(prev => ({ ...prev, title: data.suggestedTitle }));
      }
      if (data.suggestedDescription && !formData.description) {
        setFormData(prev => ({ ...prev, description: data.suggestedDescription }));
      }

      toast({
        title: 'Questões geradas!',
        description: `${data.questions?.length || 0} questões criadas com IA.`,
      });
    } catch (error: any) {
      console.error('Error generating test:', error);
      toast({
        title: 'Erro ao gerar questões',
        description: error.message || 'Não foi possível gerar as questões.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (isDemoMode) {
      toast({ title: 'Modo demonstração', description: 'Edição não disponível.', variant: 'destructive' });
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'O título é obrigatório.', variant: 'destructive' });
      return;
    }

    if (generatedQuestions.length === 0) {
      toast({ title: 'Erro', description: 'Gere as questões antes de salvar.', variant: 'destructive' });
      return;
    }

    await saveTest({
      title: formData.title,
      description: formData.description || undefined,
      cargoId: formData.cargoId || undefined,
      costCenterId: formData.costCenterId || undefined,
      participationMode: formData.participationMode,
      passingScore: formData.passingScore,
      timeLimitMinutes: formData.timeLimitMinutes || undefined,
      isActive: formData.isActive,
      questions: generatedQuestions,
    });

    setFormData({
      title: '',
      description: '',
      cargoId: '',
      costCenterId: '',
      participationMode: 'cargo',
      passingScore: 70,
      timeLimitMinutes: 60,
      isActive: true,
      questionCount: 10,
      multipleChoiceRatio: 0.7,
    });
    setGeneratedQuestions([]);
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemoMode) {
      toast({ title: 'Modo demonstração', description: 'Exclusão não disponível.', variant: 'destructive' });
      return;
    }
    await deleteTest(id);
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getParticipationModeLabel = (mode: string) => {
    switch (mode) {
      case 'cargo': return 'Por Cargo';
      case 'selected': return 'Selecionados';
      case 'self_enrollment': return 'Autoinscrição';
      default: return mode;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar testes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Teste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Teste com IA</DialogTitle>
              <DialogDescription>
                Configure os parâmetros e gere questões automaticamente com IA
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Configuration Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo Base</Label>
                  <Select
                    value={formData.cargoId || "none"}
                    onValueChange={value => setFormData(prev => ({ ...prev, cargoId: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geral (sem cargo específico)</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="costCenter">Centro de Custo</Label>
                  <Select
                    value={formData.costCenterId || "none"}
                    onValueChange={value => setFormData(prev => ({ ...prev, costCenterId: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {costCenters.map(cc => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.nomecentrodecustos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionCount">Número de Questões</Label>
                  <Input
                    id="questionCount"
                    type="number"
                    min={5}
                    max={30}
                    value={formData.questionCount}
                    onChange={e => setFormData(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="multipleChoiceRatio">% Múltipla Escolha</Label>
                  <Input
                    id="multipleChoiceRatio"
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(formData.multipleChoiceRatio * 100)}
                    onChange={e => setFormData(prev => ({ ...prev, multipleChoiceRatio: parseInt(e.target.value) / 100 || 0.7 }))}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="w-full"
                variant="secondary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando questões com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Questões com IA
                  </>
                )}
              </Button>

              {/* Generated Questions Preview */}
              {generatedQuestions.length > 0 && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Questões Geradas ({generatedQuestions.length})</h4>
                    <Badge variant="secondary">
                      {generatedQuestions.filter(q => q.type === 'multiple_choice').length} objetivas, {' '}
                      {generatedQuestions.filter(q => q.type === 'essay').length} dissertativas
                    </Badge>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {generatedQuestions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="text-sm p-2 bg-background rounded border">
                        <span className="font-medium">{idx + 1}.</span> {q.questionText.substring(0, 100)}...
                        <Badge variant="outline" className="ml-2 text-xs">{q.category}</Badge>
                      </div>
                    ))}
                    {generatedQuestions.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        + {generatedQuestions.length - 5} outras questões
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Test Details */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Detalhes do Teste</h4>
                
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Avaliação Semestral - Analista de RH"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do teste..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="participationMode">Modo de Participação</Label>
                    <Select
                      value={formData.participationMode}
                      onValueChange={value => setFormData(prev => ({ 
                        ...prev, 
                        participationMode: value as typeof formData.participationMode 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cargo">Por Cargo (todos do cargo)</SelectItem>
                        <SelectItem value="selected">Colaboradores Selecionados</SelectItem>
                        <SelectItem value="self_enrollment">Autoinscrição</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="passingScore">Nota Mínima (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min={0}
                      max={100}
                      value={formData.passingScore}
                      onChange={e => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeLimit">Tempo Limite (minutos)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min={10}
                      value={formData.timeLimitMinutes}
                      onChange={e => setFormData(prev => ({ ...prev, timeLimitMinutes: parseInt(e.target.value) || 60 }))}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <Label htmlFor="isActive">Ativar imediatamente</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={generatedQuestions.length === 0}>
                  Salvar Teste
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum teste encontrado</h3>
            <p className="text-muted-foreground text-center mt-1">
              {searchTerm ? 'Tente buscar por outros termos.' : 'Crie seu primeiro teste com IA para começar.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map(test => (
            <Card key={test.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{test.title}</CardTitle>
                    <Badge variant={test.isActive ? 'default' : 'secondary'} className="shrink-0">
                      {test.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {test.description && (
                    <CardDescription className="line-clamp-2">
                      {test.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    {test.questions.length} questões
                  </span>
                  {test.timeLimitMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {test.timeLimitMinutes}min
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {getParticipationModeLabel(test.participationMode)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Nota mínima: {test.passingScore}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Criado em {new Date(test.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSimulationTest(test)}
                    title="Simular teste"
                  >
                    <Play className="w-4 h-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Simulation Modal */}
      <TestSimulationModal
        isOpen={!!simulationTest}
        onClose={() => setSimulationTest(null)}
        test={simulationTest}
      />
    </div>
  );
};
