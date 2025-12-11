import { forwardRef } from 'react';
import { Route, Award, Target, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { CareerRoadmap } from '@/types';
import { cn } from '@/lib/utils';

interface RoadmapInfographicProps {
  roadmap: CareerRoadmap;
}

export const RoadmapInfographic = forwardRef<HTMLDivElement, RoadmapInfographicProps>(
  ({ roadmap }, ref) => {
    const progress = roadmap.progress;
    
    const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-700';
        case 'medium': return 'bg-amber-100 text-amber-700';
        case 'low': return 'bg-slate-100 text-slate-600';
      }
    };

    return (
      <div 
        ref={ref}
        className="bg-white p-8 min-w-[800px]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
              <Route className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Roadmap de Carreira</h1>
              <p className="text-lg text-indigo-600 font-medium">
                {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
              </p>
              {roadmap.employeeName && (
                <p className="text-sm text-slate-500 mt-1">{roadmap.employeeName}</p>
              )}
            </div>
          </div>
          
          {progress && (
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">{progress.progressPercentage}%</div>
              <div className="text-sm text-slate-500">Progresso Total</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mb-8">
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {progress && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{progress.completedSteps?.length || 0}</div>
              <div className="text-sm text-slate-600">Etapas Concluídas</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{progress.achievements.length}</div>
              <div className="text-sm text-slate-600">Conquistas</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{progress.gaps.length}</div>
              <div className="text-sm text-slate-600">Áreas a Desenvolver</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">{roadmap.steps.length}</div>
              <div className="text-sm text-slate-600">Total de Etapas</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Plano de Desenvolvimento
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-indigo-200" />
            {roadmap.steps.map((step, index) => {
              const isCompleted = progress?.completedSteps?.includes(index);
              const isCurrent = progress?.currentStepIndex === index;
              
              return (
                <div key={index} className="relative flex gap-4 mb-4">
                  <div className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white",
                    isCompleted ? "bg-indigo-600" : isCurrent ? "bg-indigo-100 ring-4 ring-indigo-200" : "bg-slate-100"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span className={cn("text-sm font-bold", isCurrent ? "text-indigo-700" : "text-slate-500")}>{index + 1}</span>
                    )}
                  </div>
                  <div className={cn(
                    "flex-1 rounded-xl p-4",
                    isCompleted ? "bg-indigo-50 border border-indigo-200" : isCurrent ? "bg-indigo-50/50 border border-indigo-300" : "bg-slate-50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.estimatedDuration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {step.requiredSkills.slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {step.requiredSkills.length > 4 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                          +{step.requiredSkills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements & Gaps */}
        {progress && (
          <div className="grid grid-cols-2 gap-6">
            {progress.achievements.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Conquistas
                </h2>
                <div className="space-y-2">
                  {progress.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-3">
                      <p className="font-medium text-slate-900 text-sm">{achievement.title}</p>
                      <p className="text-xs text-slate-600">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {progress.gaps.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Áreas de Desenvolvimento
                </h2>
                <div className="space-y-2">
                  {progress.gaps.slice(0, 3).map((gap, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-900 text-sm">{gap.skill}</p>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getPriorityColor(gap.priority))}>
                          {gap.priority === 'high' ? 'Alta' : gap.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{gap.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>Gerado em {new Date().toLocaleDateString('pt-BR')}</span>
          <span>GFloow • Gestão de Talentos</span>
        </div>
      </div>
    );
  }
);

RoadmapInfographic.displayName = 'RoadmapInfographic';
