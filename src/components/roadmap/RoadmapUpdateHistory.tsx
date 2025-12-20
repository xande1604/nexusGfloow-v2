import { History, Award, GraduationCap, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { RoadmapProgress } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RoadmapUpdateHistoryProps {
  progress: RoadmapProgress;
}

export const RoadmapUpdateHistory = ({ progress }: RoadmapUpdateHistoryProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const updateHistory = progress.updateHistory || [];

  if (updateHistory.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-soft">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <History className="w-5 h-5 text-brand-600" />
          Histórico de Atualizações
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma atualização registrada ainda.</p>
          <p className="text-sm">Use o botão "Atualizar" para registrar o progresso.</p>
        </div>
      </div>
    );
  }

  // Calculate cumulative skills acquired over time
  const cumulativeSkills: { date: string; skills: string[] }[] = [];
  let allSkills = new Set<string>();
  
  updateHistory.forEach((entry, index) => {
    entry.acquiredSkills.forEach(skill => allSkills.add(skill));
    cumulativeSkills.push({
      date: entry.date,
      skills: Array.from(allSkills)
    });
  });

  // Get all unique skills
  const totalUniqueSkills = Array.from(allSkills);

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <History className="w-5 h-5 text-brand-600" />
          Histórico de Atualizações
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{updateHistory.length}</span>
          {updateHistory.length === 1 ? 'atualização' : 'atualizações'}
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Total de Habilidades</span>
          </div>
          <p className="text-2xl font-bold text-brand-700">{totalUniqueSkills.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">Treinamentos</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {updateHistory.reduce((acc, entry) => acc + (entry.completedTrainings?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Última Atualização</span>
          </div>
          <p className="text-lg font-bold text-violet-700">
            {new Date(updateHistory[0]?.date || '').toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* All Acquired Skills */}
      {totalUniqueSkills.length > 0 && (
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium text-foreground mb-3">Todas as Habilidades Adquiridas:</p>
          <div className="flex flex-wrap gap-2">
            {totalUniqueSkills.map((skill, index) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {updateHistory.map((entry, index) => {
            const isExpanded = expandedIndex === index;
            const entryDate = new Date(entry.date);
            
            return (
              <div 
                key={index} 
                className="relative pl-10 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-2 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center",
                  index === 0 ? "bg-brand-600" : "bg-brand-200"
                )}>
                  {index === 0 && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>

                {/* Card */}
                <div 
                  className={cn(
                    "bg-secondary/50 rounded-lg overflow-hidden transition-all cursor-pointer hover:bg-secondary/70",
                    isExpanded && "ring-2 ring-brand-500/20"
                  )}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        index === 0 ? "bg-brand-100" : "bg-secondary"
                      )}>
                        <Calendar className={cn(
                          "w-5 h-5",
                          index === 0 ? "text-brand-600" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {entryDate.toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.acquiredSkills.length} {entry.acquiredSkills.length === 1 ? 'habilidade' : 'habilidades'}
                          {(entry.completedTrainings?.length || 0) > 0 && (
                            <> • {entry.completedTrainings?.length} {entry.completedTrainings?.length === 1 ? 'treinamento' : 'treinamentos'}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 animate-fade-in">
                      {/* Skills */}
                      {entry.acquiredSkills.length > 0 && (
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                            <Award className="w-4 h-4 text-brand-600" />
                            Habilidades Adquiridas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.acquiredSkills.map(skill => (
                              <span
                                key={skill}
                                className="px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trainings */}
                      {entry.completedTrainings && entry.completedTrainings.length > 0 && (
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                            Treinamentos Realizados
                          </p>
                          <div className="space-y-2">
                            {entry.completedTrainings.map((training, tIndex) => (
                              <div 
                                key={tIndex}
                                className="flex items-center gap-3 p-2 bg-card rounded-lg"
                              >
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-sm truncate">{training.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {training.institution && `${training.institution} • `}
                                    {training.date && new Date(training.date).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {entry.additionalNotes && (
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Observações
                          </p>
                          <p className="text-sm text-muted-foreground bg-card p-3 rounded-lg">
                            {entry.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
