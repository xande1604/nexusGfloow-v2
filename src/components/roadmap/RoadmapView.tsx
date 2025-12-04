import { useState } from 'react';
import { Route, Sparkles, ArrowRight, Clock, Target, ChevronRight, Plus, History } from 'lucide-react';
import { JobRole, Employee, CareerRoadmap } from '@/types';
import { cn } from '@/lib/utils';

interface RoadmapViewProps {
  roles: JobRole[];
  employees: Employee[];
  roadmaps: CareerRoadmap[];
  onGenerateRoadmap: (sourceRole: string, targetRole: string, employeeName?: string) => void;
}

export const RoadmapView = ({ roles, employees, roadmaps, onGenerateRoadmap }: RoadmapViewProps) => {
  const [sourceRole, setSourceRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  const handleGenerate = async () => {
    if (sourceRole && targetRole) {
      setIsGenerating(true);
      // Simulate AI generation
      setTimeout(() => {
        onGenerateRoadmap(sourceRole, targetRole, employeeName);
        setIsGenerating(false);
      }, 2000);
    }
  };

  // Sample roadmap for demo
  const demoRoadmap: CareerRoadmap = {
    id: 'demo',
    sourceRoleTitle: 'Desenvolvedor Júnior',
    targetRoleTitle: 'Tech Lead',
    steps: [
      { title: 'Fundamentos Sólidos', description: 'Domine padrões de projeto e arquitetura de software', estimatedDuration: '6 meses', requiredSkills: ['Design Patterns', 'Clean Code'] },
      { title: 'Especialização Técnica', description: 'Aprofunde em uma stack específica e tecnologias modernas', estimatedDuration: '12 meses', requiredSkills: ['React', 'Node.js', 'TypeScript'] },
      { title: 'Liderança Técnica', description: 'Desenvolva habilidades de mentoria e code review', estimatedDuration: '6 meses', requiredSkills: ['Mentoring', 'Code Review'] },
      { title: 'Gestão de Projetos', description: 'Aprenda metodologias ágeis e gestão de equipes', estimatedDuration: '6 meses', requiredSkills: ['Scrum', 'Kanban', 'Team Management'] },
    ],
    createdAt: new Date().toISOString(),
  };

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
                    <option key={role.id} value={role.title}>{role.title} ({role.level})</option>
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
                    <option key={role.id} value={role.title}>{role.title} ({role.level})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-1.5">Colaborador (opcional)</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Nome do colaborador para personalização"
                className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
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

          {/* Demo Roadmap */}
          <div className="bg-card rounded-xl p-6 shadow-medium">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exemplo de Roadmap</h3>
                <p className="text-sm text-muted-foreground">
                  {demoRoadmap.sourceRoleTitle} → {demoRoadmap.targetRoleTitle}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                ~30 meses
              </div>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-brand-200" />

              <div className="space-y-6">
                {demoRoadmap.steps.map((step, index) => (
                  <div key={index} className="relative flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Timeline dot */}
                    <div className="relative z-10 w-12 h-12 rounded-full bg-brand-100 border-4 border-card flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-brand-600">{index + 1}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
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
                ))}
              </div>

              {/* Target */}
              <div className="relative flex gap-4 mt-6">
                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 bg-brand-50 rounded-xl p-4 border border-brand-200">
                  <h4 className="font-semibold text-brand-700">{demoRoadmap.targetRoleTitle}</h4>
                  <p className="text-sm text-brand-600">Meta alcançada! 🎯</p>
                </div>
              </div>
            </div>
          </div>
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
              {roadmaps.map(roadmap => (
                <div
                  key={roadmap.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
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
                        {new Date(roadmap.createdAt).toLocaleDateString('pt-BR')}
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
