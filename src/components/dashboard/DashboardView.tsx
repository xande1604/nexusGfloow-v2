import { Briefcase, Users, Sparkles, Route, TrendingUp, Award, ClipboardCheck } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { DemoDashboardBanner } from './DemoDashboardBanner';
import { JobRole, Skill, Employee } from '@/types';
import { useDemo } from '@/contexts/DemoContext';

interface DashboardViewProps {
  roles: JobRole[];
  skills: Skill[];
  employees: Employee[];
  onNavigate?: (view: string) => void;
}

export const DashboardView = ({ roles, skills, employees, onNavigate }: DashboardViewProps) => {
  const { hasOwnData, isCheckingData, isDemoMode } = useDemo();
  
  const avgSalary = roles.length > 0 
    ? Math.round(roles.reduce((acc, r) => acc + (r.salaryRange.min + r.salaryRange.max) / 2, 0) / roles.length)
    : 0;

  const departments = [...new Set(roles.map(r => r.department))];
  const skillsByCategory = {
    technical: skills.filter(s => s.category === 'Technical').length,
    soft: skills.filter(s => s.category === 'Soft Skill').length,
    language: skills.filter(s => s.category === 'Language').length,
    leadership: skills.filter(s => s.category === 'Leadership').length,
  };

  // Show demo banner only if actively in demo mode (no role assigned)
  const showDemoBanner = !isCheckingData && isDemoMode;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo Mode Banner */}
      {showDemoBanner && <DemoDashboardBanner />}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Cargos"
          value={roles.length}
          subtitle={`${departments.length} departamentos`}
          icon={Briefcase}
          variant="primary"
        />
        <StatsCard
          title="Habilidades Mapeadas"
          value={skills.length}
          subtitle={`${skillsByCategory.technical} técnicas`}
          icon={Sparkles}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Colaboradores"
          value={employees.length}
          subtitle="Ativos no sistema"
          icon={Users}
        />
        <StatsCard
          title="Salário Médio"
          value={`R$ ${avgSalary.toLocaleString('pt-BR')}`}
          subtitle="Base dos cargos"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Roles */}
        <div className="bg-card rounded-xl p-4 md:p-5 shadow-medium">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-base md:text-lg font-semibold text-foreground">Cargos Recentes</h3>
            <span className="text-[10px] md:text-xs text-muted-foreground">Últimos adicionados</span>
          </div>
          <div className="space-y-2 md:space-y-3">
            {roles.slice(0, 5).map((role, index) => (
              <div 
                key={role.id} 
                className="flex items-center justify-between p-2 md:p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-foreground truncate">{role.title}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{role.department} • {role.level}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs md:text-sm font-semibold text-foreground">
                    R$ {role.salaryRange.min.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">a R$ {role.salaryRange.max.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
            {roles.length === 0 && (
              <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">
                Nenhum cargo cadastrado ainda
              </p>
            )}
          </div>
        </div>

        {/* Skills Overview */}
        <div className="bg-card rounded-xl p-4 md:p-5 shadow-medium">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-base md:text-lg font-semibold text-foreground">Habilidades por Categoria</h3>
            <span className="text-[10px] md:text-xs text-muted-foreground">{skills.length} total</span>
          </div>
          <div className="space-y-3 md:space-y-4">
            {[
              { label: 'Técnicas', value: skillsByCategory.technical, color: 'bg-brand-500' },
              { label: 'Comportamentais', value: skillsByCategory.soft, color: 'bg-emerald-500' },
              { label: 'Idiomas', value: skillsByCategory.language, color: 'bg-amber-500' },
              { label: 'Liderança', value: skillsByCategory.leadership, color: 'bg-violet-500' },
            ].map((item) => {
              const percentage = skills.length > 0 ? (item.value / skills.length) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-xs md:text-sm text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 mt-4 md:mt-6 pt-4 border-t border-border">
            <div className="text-center p-2 md:p-3 bg-brand-50 rounded-lg">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-brand-600 mx-auto mb-1" />
              <p className="text-base md:text-lg font-bold text-brand-700">{roles.filter(r => r.requiredSkillIds.length > 0).length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">Cargos com skills</p>
            </div>
            <div className="text-center p-2 md:p-3 bg-emerald-50 rounded-lg">
              <Route className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-base md:text-lg font-bold text-emerald-700">0</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">Roadmaps criados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Card - Tests */}
      <div 
        onClick={() => onNavigate?.('tests')}
        className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 md:p-6 shadow-medium cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              <ClipboardCheck className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">Testes e Certificações</h3>
              <p className="text-sm md:text-base text-white/80">Gerencie provas, simulações e certificados</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
            <span className="text-sm font-medium">Acessar</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
