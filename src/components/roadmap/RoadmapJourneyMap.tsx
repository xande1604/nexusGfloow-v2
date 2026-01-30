import { forwardRef, useEffect, useState } from 'react';
import { Flag, Trophy, Star, Mountain } from 'lucide-react';
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

    const svgHeight = 300 + totalSteps * 120;
    const svgWidth = 800;
    
    // Mountain path points - zigzag climbing from bottom to top
    const getPathPoints = (index: number) => {
      const isEven = index % 2 === 0;
      const yBase = svgHeight - 180 - index * 110; // Start from bottom, go up
      return {
        x: isEven ? 280 : 520,
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

    // Stars background
    const stars = Array.from({ length: 50 }).map((_, i) => ({
      x: (i * 137.5 + 50) % svgWidth,
      y: (i * 89.3 + 30) % (svgHeight * 0.6),
      size: (i % 3) * 0.5 + 1,
      delay: (i % 10) * 0.2,
    }));

    // Mountain silhouette points
    const mountainPath = `
      M 0 ${svgHeight}
      L 0 ${svgHeight - 100}
      L 80 ${svgHeight - 180}
      L 150 ${svgHeight - 120}
      L 200 ${svgHeight - 200}
      L 280 ${svgHeight - 280}
      L 350 ${svgHeight - 220}
      L 400 ${svgHeight - totalSteps * 110 - 100}
      L 450 ${svgHeight - 220}
      L 520 ${svgHeight - 280}
      L 600 ${svgHeight - 200}
      L 650 ${svgHeight - 120}
      L 720 ${svgHeight - 180}
      L ${svgWidth} ${svgHeight - 100}
      L ${svgWidth} ${svgHeight}
      Z
    `;

    const mountainPath2 = `
      M 0 ${svgHeight}
      L 0 ${svgHeight - 60}
      L 100 ${svgHeight - 140}
      L 180 ${svgHeight - 90}
      L 250 ${svgHeight - 160}
      L 320 ${svgHeight - 200}
      L 400 ${svgHeight - totalSteps * 100 - 60}
      L 480 ${svgHeight - 200}
      L 550 ${svgHeight - 160}
      L 620 ${svgHeight - 90}
      L 700 ${svgHeight - 140}
      L ${svgWidth} ${svgHeight - 60}
      L ${svgWidth} ${svgHeight}
      Z
    `;

    // Starting point at the bottom
    const startPoint = { x: 400, y: svgHeight - 80 };
    // Summit point at the top
    const summitPoint = { x: 400, y: 100 };

    return (
      <div 
        ref={ref}
        key={animationKey}
        className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-800 p-8 min-w-[800px] rounded-2xl overflow-hidden"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mountain className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Escalada de Carreira</h1>
          </div>
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
            className="flex justify-center gap-8 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
              <div className="text-4xl font-bold text-indigo-400">{progress.progressPercentage}%</div>
              <div className="text-slate-400 text-sm">Altitude</div>
            </motion.div>
            <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
              <div className="text-4xl font-bold text-green-400">{progress.completedSteps?.length || 0}</div>
              <div className="text-slate-400 text-sm">Etapas Vencidas</div>
            </motion.div>
            <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
              <div className="text-4xl font-bold text-amber-400">{progress.achievements.length}</div>
              <div className="text-slate-400 text-sm">Conquistas</div>
            </motion.div>
          </motion.div>
        )}

        {/* Mountain Journey Map */}
        <div className="relative">
          <svg 
            width={svgWidth} 
            height={svgHeight} 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
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
              <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a5b4fc"/>
              </linearGradient>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a5f"/>
                <stop offset="100%" stopColor="#0f172a"/>
              </linearGradient>
              <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155"/>
                <stop offset="100%" stopColor="#1e293b"/>
              </linearGradient>
              <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="100%" stopColor="#e2e8f0"/>
              </linearGradient>
            </defs>

            {/* Background stars */}
            {stars.map((star, i) => (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="rgba(255,255,255,0.5)"
                className="animate-pulse"
                style={{ animationDelay: `${star.delay}s`, animationDuration: `${2 + (i % 3)}s` }}
              />
            ))}

            {/* Background mountains */}
            <motion.path
              d={mountainPath}
              fill="url(#mountainGradient)"
              opacity="0.6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1 }}
            />
            <motion.path
              d={mountainPath2}
              fill="url(#mountainGradient2)"
              opacity="0.8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            {/* Snow cap at summit */}
            <motion.ellipse
              cx="400"
              cy="80"
              rx="60"
              ry="25"
              fill="url(#snowGradient)"
              opacity="0.3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Start point at base */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <circle cx={startPoint.x} cy={startPoint.y} r="40" fill="#475569" stroke="#64748b" strokeWidth="4" />
              <circle cx={startPoint.x} cy={startPoint.y} r="30" fill="#334155" />
              <Flag x={startPoint.x - 12} y={startPoint.y - 12} width="24" height="24" stroke="#94a3b8" fill="none" strokeWidth="2" />
              <text x={startPoint.x} y={startPoint.y + 65} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
                PONTO DE PARTIDA
              </text>
              <text x={startPoint.x} y={startPoint.y + 82} textAnchor="middle" fill="#64748b" fontSize="11">
                {roadmap.sourceRoleTitle}
              </text>
            </motion.g>

            {/* Climbing path and steps */}
            {roadmap.steps.map((step, index) => {
              const status = getStepStatus(index);
              const colors = getStepColors(status);
              const point = getPathPoints(index);
              const prevPoint = index === 0 ? startPoint : getPathPoints(index - 1);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isActive = isCompleted || isCurrent;

              // Curved path climbing up
              const midX = (prevPoint.x + point.x) / 2;
              const midY = (prevPoint.y + point.y) / 2 - 20;
              const pathD = `M ${prevPoint.x} ${prevPoint.y - (index === 0 ? 40 : 30)} Q ${midX} ${midY} ${point.x} ${point.y + 30}`;

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

                  {/* Main climbing path */}
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

                  {/* Animated climber along path */}
                  {isCurrent && (
                    <motion.circle
                      r="6"
                      fill="#fbbf24"
                      filter="url(#glow)"
                      initial={{ offsetDistance: '0%' }}
                      animate={{ offsetDistance: '100%' }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{ offsetPath: `path("${pathD}")` }}
                    />
                  )}

                  {/* Step node - camp/checkpoint */}
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.4, type: 'spring' }}
                  >
                    {/* Pulse ring for current */}
                    {isCurrent && (
                      <>
                        <circle cx={point.x} cy={point.y} r="55" fill="rgba(99, 102, 241, 0.15)">
                          <animate attributeName="r" values="45;60;45" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={point.x} cy={point.y} r="45" fill="rgba(99, 102, 241, 0.25)">
                          <animate attributeName="r" values="38;50;38" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.2;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}

                    {/* Camp marker */}
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r="32" 
                      fill={colors.bg} 
                      stroke={colors.border} 
                      strokeWidth="4"
                      filter={isActive ? 'url(#glow)' : 'none'}
                    />

                    {/* Step number/check */}
                    <text
                      x={point.x}
                      y={point.y + 6}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {isCompleted ? '✓' : index + 1}
                    </text>

                    {/* Step label - alternating sides */}
                    <text
                      x={point.x < 400 ? point.x - 50 : point.x + 50}
                      y={point.y - 8}
                      textAnchor={point.x < 400 ? 'end' : 'start'}
                      fill={status === 'locked' ? '#64748b' : '#e2e8f0'}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {step.title.length > 22 ? step.title.slice(0, 22) + '...' : step.title}
                    </text>
                    <text
                      x={point.x < 400 ? point.x - 50 : point.x + 50}
                      y={point.y + 10}
                      textAnchor={point.x < 400 ? 'end' : 'start'}
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
                        <circle cx={point.x + 24} cy={point.y - 24} r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
                          <animate attributeName="r" values="14;16;14" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <Star x={point.x + 17} y={point.y - 31} width="14" height="14" fill="#ffffff" stroke="none" />
                      </motion.g>
                    )}
                  </motion.g>
                </g>
              );
            })}

            {/* Path to summit */}
            {totalSteps > 0 && (
              <motion.path
                d={`M ${getPathPoints(totalSteps - 1).x} ${getPathPoints(totalSteps - 1).y - 30} 
                    Q 400 ${getPathPoints(totalSteps - 1).y - 60} 
                    ${summitPoint.x} ${summitPoint.y + 50}`}
                fill="none"
                stroke={progress?.progressPercentage === 100 ? 'url(#pathGradient)' : '#475569'}
                strokeWidth="6"
                strokeDasharray={progress?.progressPercentage === 100 ? 'none' : '12,8'}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.8 + totalSteps * 0.4 }}
              />
            )}

            {/* Summit - Trophy */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 + totalSteps * 0.4 }}
            >
              {/* Summit glow when complete */}
              {progress?.progressPercentage === 100 && (
                <>
                  <circle cx={summitPoint.x} cy={summitPoint.y} r="70" fill="rgba(251, 191, 36, 0.15)">
                    <animate attributeName="r" values="60;75;60" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={summitPoint.x} cy={summitPoint.y} r="55" fill="rgba(251, 191, 36, 0.2)">
                    <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              <circle 
                cx={summitPoint.x} 
                cy={summitPoint.y} 
                r="50" 
                fill={progress?.progressPercentage === 100 ? '#fbbf24' : '#374151'}
                stroke={progress?.progressPercentage === 100 ? '#f59e0b' : '#4b5563'}
                strokeWidth="5"
                filter={progress?.progressPercentage === 100 ? 'url(#glow)' : 'none'}
              />
              <circle 
                cx={summitPoint.x} 
                cy={summitPoint.y} 
                r="38" 
                fill={progress?.progressPercentage === 100 ? '#f59e0b' : '#1f2937'}
              />
              <Trophy 
                x={summitPoint.x - 16}
                y={summitPoint.y - 16}
                width="32" 
                height="32" 
                stroke={progress?.progressPercentage === 100 ? '#ffffff' : '#6b7280'}
                fill="none"
                strokeWidth="2"
              />
              
              {/* Summit label */}
              <text x={summitPoint.x} y={summitPoint.y - 65} textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="700">
                🏔️ CUME
              </text>
              <text x={summitPoint.x} y={summitPoint.y + 70} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">
                {roadmap.targetRoleTitle}
              </text>
              <text x={summitPoint.x} y={summitPoint.y + 88} textAnchor="middle" fill="#94a3b8" fontSize="11">
                {progress?.progressPercentage === 100 ? '🎉 Meta Alcançada!' : 'Seu Objetivo'}
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
            <span className="text-slate-400">Conquistada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30 animate-pulse" />
            <span className="text-slate-400">Escalando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-500" />
            <span className="text-slate-400">Próxima Etapa</span>
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
