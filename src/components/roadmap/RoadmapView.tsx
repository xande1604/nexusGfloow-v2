import { useState, useRef, useCallback, useEffect } from 'react';
import { Route, Sparkles, ArrowRight, Clock, Target, ChevronRight, Plus, History, ArrowLeft, RefreshCw, Award, AlertTriangle, CheckCircle2, TrendingUp, Download, Image, FileText, Map, Play } from 'lucide-react';
import html2canvas from 'html2canvas';
import { JobRole, Employee, CareerRoadmap, Skill } from '@/types';
import { cn } from '@/lib/utils';
import { RoadmapUpdateModal, RoadmapProgressData, PrefilledTrainingData } from './RoadmapUpdateModal';
import { RoadmapProgressChart } from './RoadmapProgressChart';
import { RoadmapInfographic } from './RoadmapInfographic';
import { RoadmapJourneyMap } from './RoadmapJourneyMap';
import { RoadmapUpdateHistory } from './RoadmapUpdateHistory';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmapPDF } from '@/lib/generateRoadmapPDF';

interface RoadmapViewProps {
  roles: JobRole[];
  employees: Employee[];
  roadmaps: CareerRoadmap[];
  skills: Skill[];
  onGenerateRoadmap: (sourceRole: string, targetRole: string, employeeName?: string) => void;
  onUpdateProgress: (roadmapId: string, employeeId: string | undefined, data: RoadmapProgressData, roadmap: CareerRoadmap) => Promise<void>;
  prefilledUpdateData?: {
    employeeId: string;
    skills: string[];
    training: { name: string; date: string; institution?: string };
  };
  onClearPrefilledData?: () => void;
}

export const RoadmapView = ({ roles, employees, roadmaps, skills, onGenerateRoadmap, onUpdateProgress, prefilledUpdateData, onClearPrefilledData }: RoadmapViewProps) => {
  const [sourceRole, setSourceRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showJourneyMap, setShowJourneyMap] = useState(false);
  const [journeyMapKey, setJourneyMapKey] = useState(0);
  const [prefilledModalData, setPrefilledModalData] = useState<PrefilledTrainingData | undefined>(undefined);
  const infographicRef = useRef<HTMLDivElement>(null);
  const journeyMapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle prefilled data from training skills suggestion
  useEffect(() => {
    if (prefilledUpdateData) {
      // Find roadmap for this employee
      const employeeRoadmap = roadmaps.find(r => r.employeeId === prefilledUpdateData.employeeId);
      if (employeeRoadmap) {
        setSelectedRoadmap(employeeRoadmap);
        setPrefilledModalData({
          skills: prefilledUpdateData.skills,
          training: prefilledUpdateData.training
        });
        setIsUpdateModalOpen(true);
        setActiveTab('history');
        toast({
          title: 'Roadmap encontrado',
          description: `Atualizando roadmap com as habilidades do treinamento "${prefilledUpdateData.training.name}".`
        });
      } else {
        toast({
          title: 'Roadmap não encontrado',
          description: 'Este colaborador não possui um roadmap de carreira. Crie um primeiro.',
          variant: 'destructive'
        });
      }
      onClearPrefilledData?.();
    }
  }, [prefilledUpdateData, roadmaps, onClearPrefilledData, toast]);

  const handleReplayAnimation = useCallback(() => {
    setJourneyMapKey(prev => prev + 1);
    toast({
      title: 'Animação reiniciada',
      description: 'A jornada está sendo reexibida.',
    });
  }, [toast]);

  const handleExportPNG = useCallback(async () => {
    if (!infographicRef.current || !selectedRoadmap) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(infographicRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `roadmap-${selectedRoadmap.sourceRoleTitle}-${selectedRoadmap.targetRoleTitle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: 'Infográfico exportado',
        description: 'O arquivo PNG foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o infográfico.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedRoadmap, toast]);

  const handleExportPDF = useCallback(() => {
    if (!selectedRoadmap) return;
    
    try {
      generateRoadmapPDF(selectedRoadmap);
      toast({
        title: 'PDF exportado',
        description: 'O arquivo PDF foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    }
  }, [selectedRoadmap, toast]);

  const handleExportJourneyMap = useCallback(async () => {
    if (!journeyMapRef.current || !selectedRoadmap) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(journeyMapRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `jornada-${selectedRoadmap.sourceRoleTitle}-${selectedRoadmap.targetRoleTitle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: 'Mapa da jornada exportado',
        description: 'O arquivo PNG foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o mapa.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedRoadmap, toast]);

  const handleGenerate = async () => {
    if (sourceRole && targetRole) {
      setIsGenerating(true);
      try {
        await onGenerateRoadmap(sourceRole, targetRole, employeeName);
        setSourceRole('');
        setTargetRole('');
        setEmployeeName('');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSelectRoadmap = (roadmap: CareerRoadmap) => {
    setSelectedRoadmap(roadmap);
  };

  const handleBackToHistory = () => {
    setSelectedRoadmap(null);
  };

  const handleUpdateProgress = async (data: RoadmapProgressData) => {
    if (selectedRoadmap) {
      await onUpdateProgress(selectedRoadmap.id, selectedRoadmap.employeeId, data, selectedRoadmap);
      // Refresh the selected roadmap
      const updatedRoadmap = roadmaps.find(r => r.id === selectedRoadmap.id);
      if (updatedRoadmap) {
        setSelectedRoadmap(updatedRoadmap);
      }
    }
  };

  // Calculate total duration from steps
  const calculateTotalDuration = (roadmap: CareerRoadmap) => {
    if (!roadmap.steps || roadmap.steps.length === 0) return 'N/A';
    return `${roadmap.steps.length} etapas`;
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-muted-foreground bg-secondary';
    }
  };

  // Render selected roadmap details
  if (selectedRoadmap) {
    const progress = selectedRoadmap.progress;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Back button */}
        <button
          onClick={handleBackToHistory}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao histórico
        </button>

        {/* Roadmap Header */}
        <div className="bg-card rounded-xl p-6 shadow-medium">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Route className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedRoadmap.sourceRoleTitle} → {selectedRoadmap.targetRoleTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedRoadmap.employeeName && `${selectedRoadmap.employeeName} • `}
                  Criado em {new Date(selectedRoadmap.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4" />
                {calculateTotalDuration(selectedRoadmap)}
              </div>
              <button
                onClick={() => setShowJourneyMap(!showJourneyMap)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  showJourneyMap 
                    ? "bg-brand-600 text-primary-foreground" 
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                <Map className="w-4 h-4" />
                Mapa
              </button>
              {showJourneyMap && (
                <button
                  onClick={handleReplayAnimation}
                  className="flex items-center gap-2 px-3 py-2 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-200 transition-colors"
                  title="Replay animação"
                >
                  <Play className="w-4 h-4" />
                  Replay
                </button>
              )}
              <button
                onClick={showJourneyMap ? handleExportJourneyMap : handleExportPNG}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                <Image className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progresso Geral</span>
                <span className="text-sm font-bold text-brand-600">{progress.progressPercentage}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
              {progress.summary && (
                <p className="mt-3 text-sm text-muted-foreground">{progress.summary}</p>
              )}
            </div>
          )}
        </div>

        {/* Progress Details */}
        {progress && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievements */}
            {progress.achievements.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                  <Award className="w-5 h-5 text-brand-600" />
                  Conquistas
                </h3>
                <div className="space-y-3">
                  {progress.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-brand-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {progress.gaps.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Áreas de Desenvolvimento
                </h3>
                <div className="space-y-3">
                  {progress.gaps.map((gap, index) => (
                    <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{gap.skill}</p>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getPriorityColor(gap.priority))}>
                          {gap.priority === 'high' ? 'Alta' : gap.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{gap.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Actions */}
            {progress.nextActions.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft lg:col-span-2">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  Próximos Passos Recomendados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {progress.nextActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm text-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Evolution Chart */}
            <RoadmapProgressChart progress={progress} />

            {/* Update History */}
            <div className="lg:col-span-2">
              <RoadmapUpdateHistory progress={progress} />
            </div>
          </div>
        )}

        {/* Journey Map View */}
        {showJourneyMap ? (
          <div className="overflow-x-auto">
            <RoadmapJourneyMap key={journeyMapKey} ref={journeyMapRef} roadmap={selectedRoadmap} />
          </div>
        ) : (
          /* Roadmap Steps (default view) */
          <div className="bg-card rounded-xl p-6 shadow-medium">
            <h3 className="text-lg font-semibold text-foreground mb-6">Plano de Desenvolvimento</h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-brand-200" />

              <div className="space-y-6">
                {selectedRoadmap.steps.map((step, index) => {
                  const isCompleted = progress?.completedSteps?.includes(index);
                  const isCurrent = progress?.currentStepIndex === index;

                  return (
                    <div key={index} className="relative flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 w-12 h-12 rounded-full border-4 border-card flex items-center justify-center flex-shrink-0 transition-all",
                        isCompleted ? "bg-brand-600" : isCurrent ? "bg-brand-100 ring-4 ring-brand-200" : "bg-brand-100"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                        ) : (
                          <span className={cn("text-sm font-bold", isCurrent ? "text-brand-700" : "text-brand-600")}>{index + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn(
                        "flex-1 rounded-xl p-4 transition-colors",
                        isCompleted ? "bg-brand-50 border border-brand-200" : isCurrent ? "bg-brand-50/50 border border-brand-300" : "bg-secondary/50 hover:bg-secondary"
                      )}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{step.title}</h4>
                            {isCompleted && <span className="px-2 py-0.5 bg-brand-600 text-primary-foreground rounded-full text-xs font-medium">Concluída</span>}
                            {isCurrent && <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">Em andamento</span>}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-background px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            {step.estimatedDuration}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {step.requiredSkills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Target */}
              <div className="relative flex gap-4 mt-6">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 bg-brand-50 rounded-xl p-4 border border-brand-200">
                  <h4 className="font-semibold text-brand-700">{selectedRoadmap.targetRoleTitle}</h4>
                  <p className="text-sm text-brand-600">
                    {progress && progress.progressPercentage === 100 ? 'Meta alcançada! 🎯' : 'Cargo alvo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Components for Export */}
        <div className="fixed left-[-9999px] top-0">
          <RoadmapInfographic ref={infographicRef} roadmap={selectedRoadmap} />
          <RoadmapJourneyMap ref={journeyMapRef} roadmap={selectedRoadmap} />
        </div>

        {/* Update Modal */}
        <RoadmapUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setPrefilledModalData(undefined);
          }}
          roadmap={selectedRoadmap}
          availableSkills={skills}
          onUpdate={handleUpdateProgress}
          prefilledData={prefilledModalData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'create'
              ? "bg-brand-600 text-primary-foreground shadow-soft"
              : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Plus className="w-4 h-4" />
          Criar Roadmap
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'history'
              ? "bg-brand-600 text-primary-foreground shadow-soft"
              : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="w-4 h-4" />
          Histórico ({roadmaps.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <>
          {/* Generator Card */}
          <div className="bg-card rounded-xl p-6 shadow-medium">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Gerador de Roadmap com IA</h3>
                <p className="text-sm text-muted-foreground">Crie planos de carreira personalizados automaticamente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Cargo Atual</label>
                <select
                  value={sourceRole}
                  onChange={(e) => setSourceRole(e.target.value)}
                  className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">Selecione...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.title}>{role.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end justify-center">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-brand-600" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Cargo Alvo</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">Selecione...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.title}>{role.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-1.5">Colaborador (opcional)</label>
              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Selecione um colaborador...</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.name}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!sourceRole || !targetRole || isGenerating}
              className={cn(
                "w-full h-12 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
                sourceRole && targetRole && !isGenerating
                  ? "bg-gradient-to-r from-brand-600 to-brand-700 text-primary-foreground hover:from-brand-700 hover:to-brand-800 shadow-medium"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Roadmap de Carreira
                </>
              )}
            </button>
          </div>

          {/* Recent Roadmaps Preview */}
          {roadmaps.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Roadmaps Recentes</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Ver todos →
                </button>
              </div>
              <div className="space-y-2">
                {roadmaps.slice(0, 3).map(roadmap => (
                  <div
                    key={roadmap.id}
                    onClick={() => handleSelectRoadmap(roadmap)}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                        <Route className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {roadmap.steps?.length || 0} etapas
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="bg-card rounded-xl p-6 shadow-medium">
          {roadmaps.length === 0 ? (
            <div className="text-center py-12">
              <Route className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum roadmap criado ainda</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Criar primeiro roadmap
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {roadmaps.map((roadmap, index) => (
                <div
                  key={roadmap.id}
                  onClick={() => handleSelectRoadmap(roadmap)}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                      <Route className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {roadmap.employeeName && `${roadmap.employeeName} • `}
                        {roadmap.steps?.length || 0} etapas • {new Date(roadmap.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
