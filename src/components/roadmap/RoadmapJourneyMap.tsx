import { forwardRef, useEffect, useState } from 'react';
import { Flag, Trophy, Star, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerRoadmap } from '@/types';

interface RoadmapJourneyMapProps {
  roadmap: CareerRoadmap;
}

export const RoadmapJourneyMap = forwardRef<HTMLDivElement, RoadmapJourneyMapProps>(
  ({ roadmap }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const progress = roadmap.progress;
    const totalSteps = roadmap.steps.length;
    
    useEffect(() => {
      setIsVisible(true);
    }, []);

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

    const getStepColors = (status: string) => {
      switch (status) {
        case 'completed': return { bg: '#22c55e', border: '#16a34a', text: '#ffffff' };
        case 'current': return { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' };
        default: return { bg: '#e5e7eb', border: '#d1d5db', text: '#9ca3af' };
      }
    };

    // Generate random but consistent star positions
    const stars = Array.from({ length: 30 }).map((_, i) => ({
      x: (i * 137.5) % 800,
      y: (i * 89.3) % (180 + totalSteps * 100),
      size: (i % 3) * 0.5 + 1,
      delay: i * 0.1,
    }));

    return (
      <div 
        ref={ref}
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
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bold text-indigo-400">{progress.progressPercentage}%</div>
              <div className="text-slate-400 text-sm">Progresso</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bold text-green-400">{progress.completedSteps?.length || 0}</div>
              <div className="text-slate-400 text-sm">Concluídas</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bold text-amber-400">{progress.achievements.length}</div>
              <div className="text-slate-400 text-sm">Conquistas</div>
            </motion.div>
          </motion.div>
        )}

        {/* Journey Map SVG */}
        <div className="relative">
          <svg 
            width="800" 
            height={180 + totalSteps * 100} 
            viewBox={`0 0 800 ${180 + totalSteps * 100}`}
            className="mx-auto"
          >
            {/* Background stars with twinkle animation */}
            {stars.map((star, i) => (
              <motion.circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="rgba(255,255,255,0.5)"
                initial={{ opacity: 0.2 }}
                animate={{ 
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + (i % 3),
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Start point */}
            <motion.g 
              transform="translate(400, 40)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            >
              <motion.circle 
                r="35" 
                fill="#6366f1" 
                stroke="#818cf8" 
                strokeWidth="4"
                animate={{ 
                  boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0)", "0 0 0 10px rgba(99, 102, 241, 0.3)", "0 0 0 0 rgba(99, 102, 241, 0)"]
                }}
              />
              <circle r="25" fill="#4f46e5" />
              <Flag x="-12" y="-12" width="24" height="24" stroke="white" fill="none" strokeWidth="2" />
              <text y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                {roadmap.sourceRoleTitle}
              </text>
            </motion.g>

            {/* Path and steps */}
            {roadmap.steps.map((step, index) => {
              const status = getStepStatus(index);
              const colors = getStepColors(status);
              const point = getPathPoints(index, totalSteps);
              const prevPoint = index === 0 
                ? { x: 400, y: 40 } 
                : getPathPoints(index - 1, totalSteps);

              const pathD = `M ${prevPoint.x} ${prevPoint.y + (index === 0 ? 35 : 30)} 
                  Q ${(prevPoint.x + point.x) / 2} ${(prevPoint.y + point.y) / 2 + 30} 
                  ${point.x} ${point.y - 30}`;

              return (
                <g key={index}>
                  {/* Glowing effect for completed/current */}
                  {status !== 'locked' && (
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: index * 0.2 
                      }}
                    />
                  )}

                  {/* Connecting path with draw animation */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={status === 'locked' ? '#475569' : '#6366f1'}
                    strokeWidth="6"
                    strokeDasharray={status === 'locked' ? '10,10' : 'none'}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.5 + index * 0.3,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Animated particle along path for current/completed */}
                  {status !== 'locked' && (
                    <motion.circle
                      r="4"
                      fill="#ffffff"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "linear",
                      }}
                      style={{
                        offsetPath: `path("${pathD}")`,
                      }}
                    />
                  )}

                  {/* Step node */}
                  <motion.g 
                    transform={`translate(${point.x}, ${point.y})`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.8 + index * 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {/* Outer glow for current with pulse */}
                    {status === 'current' && (
                      <>
                        <motion.circle 
                          r="50" 
                          fill="rgba(99, 102, 241, 0.2)"
                          animate={{ 
                            r: [50, 60, 50],
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.circle 
                          r="40" 
                          fill="rgba(99, 102, 241, 0.3)"
                          animate={{ 
                            r: [40, 48, 40],
                            opacity: [0.3, 0.5, 0.3]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2
                          }}
                        />
                      </>
                    )}
                    
                    {/* Main circle with hover effect */}
                    <motion.circle 
                      r="30" 
                      fill={colors.bg} 
                      stroke={colors.border} 
                      strokeWidth="4"
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 400 }}
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
                    <motion.foreignObject
                      x={point.x < 400 ? 40 : -200}
                      y="-25"
                      width="160"
                      height="50"
                      initial={{ opacity: 0, x: point.x < 400 ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1 + index * 0.3 }}
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
                    </motion.foreignObject>

                    {/* Achievement badge with bounce */}
                    {status === 'completed' && (
                      <motion.g 
                        transform="translate(20, -20)"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: 1.2 + index * 0.3,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <motion.circle 
                          r="12" 
                          fill="#fbbf24" 
                          stroke="#f59e0b" 
                          strokeWidth="2"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <Star x="-6" y="-6" width="12" height="12" fill="#ffffff" stroke="none" />
                      </motion.g>
                    )}
                  </motion.g>
                </g>
              );
            })}

            {/* End point (Target role) */}
            <motion.g 
              transform={`translate(400, ${150 + totalSteps * 100})`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 1 + totalSteps * 0.3,
                type: "spring"
              }}
            >
              {/* Connecting path to finish */}
              <motion.path
                d={`M ${getPathPoints(totalSteps - 1, totalSteps).x} ${getPathPoints(totalSteps - 1, totalSteps).y + 30} 
                    Q 400 ${120 + totalSteps * 100} 
                    400 ${150 + totalSteps * 100 - 45}`}
                fill="none"
                stroke={progress?.progressPercentage === 100 ? '#6366f1' : '#475569'}
                strokeWidth="6"
                strokeDasharray={progress?.progressPercentage === 100 ? 'none' : '10,10'}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.8 + totalSteps * 0.3 }}
              />
              
              {/* Trophy circle with celebration animation when complete */}
              {progress?.progressPercentage === 100 ? (
                <>
                  <motion.circle 
                    r="45" 
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="5"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      filter: ["drop-shadow(0 0 0px #fbbf24)", "drop-shadow(0 0 20px #fbbf24)", "drop-shadow(0 0 0px #fbbf24)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.circle 
                    r="35" 
                    fill="#f59e0b"
                  />
                </>
              ) : (
                <>
                  <circle 
                    r="45" 
                    fill="#374151"
                    stroke="#4b5563"
                    strokeWidth="5"
                  />
                  <circle r="35" fill="#1f2937" />
                </>
              )}
              
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
            </motion.g>
          </svg>
        </div>

        {/* Legend */}
        <motion.div 
          className="flex justify-center gap-8 mt-6 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 + totalSteps * 0.3 }}
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-4 h-4 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-slate-400">Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30"
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.4)", "0 0 0 8px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-slate-400">Em andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-500" />
            <span className="text-slate-400">Bloqueada</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-6 pt-4 border-t border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <p className="text-slate-500 text-xs">
            Gerado em {new Date().toLocaleDateString('pt-BR')} • GFloow
          </p>
        </motion.div>
      </div>
    );
  }
);

RoadmapJourneyMap.displayName = 'RoadmapJourneyMap';
