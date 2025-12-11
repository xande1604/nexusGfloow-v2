import { forwardRef, useEffect, useState } from 'react';
import { Flag, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { CareerRoadmap } from '@/types';

interface RoadmapJourneyMapProps {
  roadmap: CareerRoadmap;
}

export const RoadmapJourneyMap = forwardRef<HTMLDivElement, RoadmapJourneyMapProps>(
  ({ roadmap }, ref) => {
    const [animationKey, setAnimationKey] = useState(0);
    const progress = roadmap.progress;
    const totalSteps = roadmap.steps.length;
    
    useEffect(() => {
      setAnimationKey(prev => prev + 1);
    }, [roadmap.id]);

    const getPathPoints = (index: number) => {
      const isEven = index % 2 === 0;
      const yBase = 120 + index * 100;
      return {
        x: isEven ? 150 : 650,
        y: yBase,
      };
    };

    const getStepStatus = (index: number) => {
      if (progress?.completedSteps?.includes(index)) return 'completed';
      if (progress?.currentStepIndex === index) return 'current';
      return 'locked';
    };

    const getStepColors = (status: string) => {
      switch (status) {
        case 'completed': return { bg: '#22c55e', border: '#16a34a', text: '#ffffff' };
        case 'current': return { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' };
        default: return { bg: '#64748b', border: '#475569', text: '#94a3b8' };
      }
    };

    const stars = Array.from({ length: 40 }).map((_, i) => ({
      x: (i * 137.5 + 50) % 800,
      y: (i * 89.3 + 30) % (180 + totalSteps * 100),
      size: (i % 3) * 0.5 + 1,
      delay: (i % 10) * 0.2,
    }));

    const svgHeight = 220 + totalSteps * 100;

    return (
      <div 
        ref={ref}
        key={animationKey}
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 min-w-[800px] rounded-2xl overflow-hidden"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Jornada de Carreira</h1>
          <p className="text-indigo-300 text-lg">
            {roadmap.sourceRoleTitle} → {roadmap.targetRoleTitle}
          </p>
          {roadmap.employeeName && (
            <p className="text-slate-400 text-sm mt-1">{roadmap.employeeName}</p>
          )}
        </motion.div>

        {/* Progress Stats */}
        {progress && (
          <motion.div 
            className="flex justify-center gap-8 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-4xl font-bold text-indigo-400">{progress.progressPercentage}%</div>
              <div className="text-slate-400 text-sm">Progresso</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-4xl font-bold text-green-400">{progress.completedSteps?.length || 0}</div>
              <div className="text-slate-400 text-sm">Concluídas</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-4xl font-bold text-amber-400">{progress.achievements.length}</div>
              <div className="text-slate-400 text-sm">Conquistas</div>
            </motion.div>
          </motion.div>
        )}

        {/* Journey Map */}
        <div className="relative">
          <svg 
            width="800" 
            height={svgHeight} 
            viewBox={`0 0 800 ${svgHeight}`}
            className="mx-auto"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#818cf8"/>
              </linearGradient>
            </defs>

            {/* Background stars with twinkle */}
            {stars.map((star, i) => (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="rgba(255,255,255,0.4)"
                className="animate-pulse"
                style={{ animationDelay: `${star.delay}s`, animationDuration: `${2 + (i % 3)}s` }}
              />
            ))}

            {/* Start point */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <circle cx="400" cy="50" r="35" fill="#6366f1" stroke="#818cf8" strokeWidth="4" filter="url(#glow)" />
              <circle cx="400" cy="50" r="25" fill="#4f46e5" />
              <Flag x="388" y="38" width="24" height="24" stroke="white" fill="none" strokeWidth="2" />
              <text x="400" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                {roadmap.sourceRoleTitle}
              </text>
            </motion.g>

            {/* Path and steps */}
            {roadmap.steps.map((step, index) => {
              const status = getStepStatus(index);
              const colors = getStepColors(status);
              const point = getPathPoints(index);
              const prevPoint = index === 0 ? { x: 400, y: 50 } : getPathPoints(index - 1);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isActive = isCompleted || isCurrent;

              const pathD = `M ${prevPoint.x} ${prevPoint.y + (index === 0 ? 35 : 30)} 
                  Q ${(prevPoint.x + point.x) / 2} ${(prevPoint.y + point.y) / 2 + 30} 
                  ${point.x} ${point.y - 30}`;

              return (
                <g key={index}>
                  {/* Path glow for active */}
                  {isActive && (
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="14"
                      strokeLinecap="round"
                      opacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.4 }}
                    />
                  )}

                  {/* Main path */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={isActive ? 'url(#pathGradient)' : '#475569'}
                    strokeWidth="6"
                    strokeDasharray={status === 'locked' ? '12,8' : 'none'}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.4 }}
                  />

                  {/* Animated dot along path for active */}
                  {isActive && (
                    <motion.circle
                      r="5"
                      fill="#ffffff"
                      filter="url(#glow)"
                      initial={{ offsetDistance: '0%' }}
                      animate={{ offsetDistance: '100%' }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: index * 0.5 }}
                      style={{ offsetPath: `path("${pathD}")` }}
                    />
                  )}

                  {/* Step node */}
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.4, type: 'spring' }}
                  >
                    {/* Pulse ring for current */}
                    {isCurrent && (
                      <>
                        <circle cx={point.x} cy={point.y} r="50" fill="rgba(99, 102, 241, 0.15)">
                          <animate attributeName="r" values="40;55;40" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={point.x} cy={point.y} r="40" fill="rgba(99, 102, 241, 0.25)">
                          <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.2;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}

                    {/* Main node circle */}
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r="30" 
                      fill={colors.bg} 
                      stroke={colors.border} 
                      strokeWidth="4"
                      filter={isActive ? 'url(#glow)' : 'none'}
                    />

                    {/* Step number/check */}
                    <text
                      x={point.x}
                      y={point.y + 5}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {isCompleted ? '✓' : index + 1}
                    </text>

                    {/* Step label */}
                    <text
                      x={point.x < 400 ? point.x + 45 : point.x - 45}
                      y={point.y - 8}
                      textAnchor={point.x < 400 ? 'start' : 'end'}
                      fill={status === 'locked' ? '#64748b' : '#e2e8f0'}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {step.title.length > 20 ? step.title.slice(0, 20) + '...' : step.title}
                    </text>
                    <text
                      x={point.x < 400 ? point.x + 45 : point.x - 45}
                      y={point.y + 10}
                      textAnchor={point.x < 400 ? 'start' : 'end'}
                      fill="#64748b"
                      fontSize="11"
                    >
                      {step.estimatedDuration}
                    </text>

                    {/* Achievement star for completed */}
                    {isCompleted && (
                      <motion.g
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 1 + index * 0.4, type: 'spring' }}
                      >
                        <circle cx={point.x + 22} cy={point.y - 22} r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
                          <animate attributeName="r" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <Star x={point.x + 16} y={point.y - 28} width="12" height="12" fill="#ffffff" stroke="none" />
                      </motion.g>
                    )}
                  </motion.g>
                </g>
              );
            })}

            {/* End point - Trophy */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 + totalSteps * 0.4 }}
            >
              {/* Path to trophy */}
              <motion.path
                d={`M ${getPathPoints(totalSteps - 1).x} ${getPathPoints(totalSteps - 1).y + 30} 
                    Q 400 ${130 + totalSteps * 100} 
                    400 ${svgHeight - 70}`}
                fill="none"
                stroke={progress?.progressPercentage === 100 ? 'url(#pathGradient)' : '#475569'}
                strokeWidth="6"
                strokeDasharray={progress?.progressPercentage === 100 ? 'none' : '12,8'}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.8 + totalSteps * 0.4 }}
              />

              {/* Trophy glow when complete */}
              {progress?.progressPercentage === 100 && (
                <circle cx="400" cy={svgHeight - 60} r="55" fill="rgba(251, 191, 36, 0.2)">
                  <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              <circle 
                cx="400" 
                cy={svgHeight - 60} 
                r="45" 
                fill={progress?.progressPercentage === 100 ? '#fbbf24' : '#374151'}
                stroke={progress?.progressPercentage === 100 ? '#f59e0b' : '#4b5563'}
                strokeWidth="5"
                filter={progress?.progressPercentage === 100 ? 'url(#glow)' : 'none'}
              />
              <circle 
                cx="400" 
                cy={svgHeight - 60} 
                r="35" 
                fill={progress?.progressPercentage === 100 ? '#f59e0b' : '#1f2937'}
              />
              <Trophy 
                x={385}
                y={svgHeight - 75}
                width="30" 
                height="30" 
                stroke={progress?.progressPercentage === 100 ? '#ffffff' : '#6b7280'}
                fill="none"
                strokeWidth="2"
              />
              <text x="400" y={svgHeight + 5} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">
                {roadmap.targetRoleTitle}
              </text>
              <text x="400" y={svgHeight + 22} textAnchor="middle" fill="#94a3b8" fontSize="11">
                {progress?.progressPercentage === 100 ? '🎯 Meta Alcançada!' : 'Cargo Alvo'}
              </text>
            </motion.g>
          </svg>
        </div>

        {/* Legend */}
        <motion.div 
          className="flex justify-center gap-8 mt-6 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-400">Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30 animate-pulse" />
            <span className="text-slate-400">Em andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-500" />
            <span className="text-slate-400">Bloqueada</span>
          </div>
        </motion.div>

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
