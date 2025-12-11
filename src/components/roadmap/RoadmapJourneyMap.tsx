import { forwardRef } from 'react';
import { Flag, Trophy, Star, Zap, Target, Lock, CheckCircle2, Circle } from 'lucide-react';
import { CareerRoadmap } from '@/types';
import { cn } from '@/lib/utils';

interface RoadmapJourneyMapProps {
  roadmap: CareerRoadmap;
}

export const RoadmapJourneyMap = forwardRef<HTMLDivElement, RoadmapJourneyMapProps>(
  ({ roadmap }, ref) => {
    const progress = roadmap.progress;
    const totalSteps = roadmap.steps.length;
    
    // Generate path points for the winding road
    const getPathPoints = (index: number, total: number) => {
      const isEven = index % 2 === 0;
      const yBase = 120 + index * 100;
      return {
        x: isEven ? 150 : 650,
        y: yBase,
        curveX: isEven ? 650 : 150,
      };
    };

    const getStepStatus = (index: number) => {
      if (progress?.completedSteps?.includes(index)) return 'completed';
      if (progress?.currentStepIndex === index) return 'current';
      return 'locked';
    };

    const getStepIcon = (status: string) => {
      switch (status) {
        case 'completed': return CheckCircle2;
        case 'current': return Zap;
        default: return Lock;
      }
    };

    const getStepColors = (status: string) => {
      switch (status) {
        case 'completed': return { bg: '#22c55e', border: '#16a34a', text: '#ffffff' };
        case 'current': return { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' };
        default: return { bg: '#e5e7eb', border: '#d1d5db', text: '#9ca3af' };
      }
    };

    return (
      <div 
        ref={ref}
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 min-w-[800px] rounded-2xl"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Jornada de Carreira</h1>
          <p className="text-indigo-300 text-lg">
            {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
          </p>
          {roadmap.employeeName && (
            <p className="text-slate-400 text-sm mt-1">{roadmap.employeeName}</p>
          )}
        </div>

        {/* Progress Stats */}
        {progress && (
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400">{progress.progressPercentage}%</div>
              <div className="text-slate-400 text-sm">Progresso</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">{progress.completedSteps?.length || 0}</div>
              <div className="text-slate-400 text-sm">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">{progress.achievements.length}</div>
              <div className="text-slate-400 text-sm">Conquistas</div>
            </div>
          </div>
        )}

        {/* Journey Map SVG */}
        <div className="relative">
          <svg 
            width="800" 
            height={180 + totalSteps * 100} 
            viewBox={`0 0 800 ${180 + totalSteps * 100}`}
            className="mx-auto"
          >
            {/* Background stars */}
            {Array.from({ length: 30 }).map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 800}
                cy={Math.random() * (180 + totalSteps * 100)}
                r={Math.random() * 2 + 0.5}
                fill="rgba(255,255,255,0.3)"
              />
            ))}

            {/* Start point */}
            <g transform="translate(400, 40)">
              <circle r="35" fill="#6366f1" stroke="#818cf8" strokeWidth="4" />
              <circle r="25" fill="#4f46e5" />
              <Flag x="-12" y="-12" width="24" height="24" stroke="white" fill="none" strokeWidth="2" />
              <text y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                {roadmap.sourceRoleTitle}
              </text>
            </g>

            {/* Path and steps */}
            {roadmap.steps.map((step, index) => {
              const status = getStepStatus(index);
              const colors = getStepColors(status);
              const point = getPathPoints(index, totalSteps);
              const prevPoint = index === 0 
                ? { x: 400, y: 40 } 
                : getPathPoints(index - 1, totalSteps);
              
              const Icon = getStepIcon(status);

              return (
                <g key={index}>
                  {/* Connecting path */}
                  <path
                    d={`M ${prevPoint.x} ${prevPoint.y + (index === 0 ? 35 : 30)} 
                        Q ${(prevPoint.x + point.x) / 2} ${(prevPoint.y + point.y) / 2 + 30} 
                        ${point.x} ${point.y - 30}`}
                    fill="none"
                    stroke={status === 'locked' ? '#475569' : '#6366f1'}
                    strokeWidth="6"
                    strokeDasharray={status === 'locked' ? '10,10' : 'none'}
                    strokeLinecap="round"
                  />
                  
                  {/* Glowing effect for completed/current */}
                  {status !== 'locked' && (
                    <path
                      d={`M ${prevPoint.x} ${prevPoint.y + (index === 0 ? 35 : 30)} 
                          Q ${(prevPoint.x + point.x) / 2} ${(prevPoint.y + point.y) / 2 + 30} 
                          ${point.x} ${point.y - 30}`}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="12"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  )}

                  {/* Step node */}
                  <g transform={`translate(${point.x}, ${point.y})`}>
                    {/* Outer glow for current */}
                    {status === 'current' && (
                      <>
                        <circle r="50" fill="rgba(99, 102, 241, 0.2)" />
                        <circle r="40" fill="rgba(99, 102, 241, 0.3)" />
                      </>
                    )}
                    
                    {/* Main circle */}
                    <circle 
                      r="30" 
                      fill={colors.bg} 
                      stroke={colors.border} 
                      strokeWidth="4"
                    />
                    
                    {/* Step number or icon */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={colors.text}
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {status === 'completed' ? '✓' : index + 1}
                    </text>

                    {/* Step title */}
                    <foreignObject
                      x={point.x < 400 ? 40 : -200}
                      y="-25"
                      width="160"
                      height="50"
                    >
                      <div 
                        style={{ 
                          textAlign: point.x < 400 ? 'left' : 'right',
                          color: status === 'locked' ? '#64748b' : '#e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>
                          {step.estimatedDuration}
                        </div>
                      </div>
                    </foreignObject>

                    {/* Achievement badge */}
                    {status === 'completed' && (
                      <g transform="translate(20, -20)">
                        <circle r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                        <Star x="-6" y="-6" width="12" height="12" fill="#ffffff" stroke="none" />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}

            {/* End point (Target role) */}
            <g transform={`translate(400, ${150 + totalSteps * 100})`}>
              {/* Connecting path to finish */}
              <path
                d={`M ${getPathPoints(totalSteps - 1, totalSteps).x} ${getPathPoints(totalSteps - 1, totalSteps).y + 30} 
                    Q 400 ${120 + totalSteps * 100} 
                    400 ${150 + totalSteps * 100 - 45}`}
                fill="none"
                stroke={progress?.progressPercentage === 100 ? '#6366f1' : '#475569'}
                strokeWidth="6"
                strokeDasharray={progress?.progressPercentage === 100 ? 'none' : '10,10'}
                strokeLinecap="round"
              />
              
              {/* Trophy circle */}
              <circle 
                r="45" 
                fill={progress?.progressPercentage === 100 ? '#fbbf24' : '#374151'}
                stroke={progress?.progressPercentage === 100 ? '#f59e0b' : '#4b5563'}
                strokeWidth="5"
              />
              <circle 
                r="35" 
                fill={progress?.progressPercentage === 100 ? '#f59e0b' : '#1f2937'}
              />
              <Trophy 
                x="-15" 
                y="-15" 
                width="30" 
                height="30" 
                stroke={progress?.progressPercentage === 100 ? '#ffffff' : '#6b7280'}
                fill="none"
                strokeWidth="2"
              />
              <text y="65" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">
                {roadmap.targetRoleTitle}
              </text>
              <text y="82" textAnchor="middle" fill="#94a3b8" fontSize="11">
                {progress?.progressPercentage === 100 ? '🎯 Meta Alcançada!' : 'Cargo Alvo'}
              </text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-slate-400">Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30" />
            <span className="text-slate-400">Em andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-500" />
            <span className="text-slate-400">Bloqueada</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs">
            Gerado em {new Date().toLocaleDateString('pt-BR')} • GFloow
          </p>
        </div>
      </div>
    );
  }
);

RoadmapJourneyMap.displayName = 'RoadmapJourneyMap';
