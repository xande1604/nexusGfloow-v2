import { Route, GraduationCap, FileCheck, Sparkles, ClipboardCheck, User } from 'lucide-react';
import { LinkedEmployee } from '@/hooks/useUserRole';
import { AppView } from '@/types';

interface MyDashboardViewProps {
  linkedEmployee: LinkedEmployee | null;
  onNavigate?: (view: AppView) => void;
}

export const MyDashboardView = ({ linkedEmployee, onNavigate }: MyDashboardViewProps) => {
  if (!linkedEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <User className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Perfil não vinculado</h2>
          <p className="text-muted-foreground max-w-md">
            Seu usuário ainda não está vinculado a um colaborador. Solicite ao administrador que cadastre seu email no sistema.
          </p>
        </div>
      </div>
    );
  }

  const quickAccess = [
    { view: AppView.ROADMAP, label: 'Meu Roadmap', description: 'Veja seu plano de carreira e progresso', icon: Route, color: 'from-brand-500 to-brand-700' },
    { view: AppView.TRAININGS, label: 'Meus Treinamentos', description: 'Treinamentos concluídos e pendentes', icon: GraduationCap, color: 'from-emerald-500 to-emerald-700' },
    { view: AppView.TESTS, label: 'Meus Testes', description: 'Avaliações e certificações', icon: FileCheck, color: 'from-violet-500 to-purple-700' },
    { view: AppView.SKILLS, label: 'Minhas Habilidades', description: 'Competências adquiridas', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
    { view: AppView.PERFORMANCE, label: 'Autoavaliação', description: 'Ciclos de avaliação de desempenho', icon: ClipboardCheck, color: 'from-rose-500 to-pink-700' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center">
            <User className="w-7 h-7 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Olá, {linkedEmployee.nome}!</h1>
            <p className="text-muted-foreground">Bem-vindo ao seu painel de desenvolvimento profissional</p>
            {linkedEmployee.email && (
              <p className="text-sm text-muted-foreground mt-1">{linkedEmployee.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickAccess.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.view}
              onClick={() => onNavigate?.(item.view)}
              className={`bg-gradient-to-br ${item.color} rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.label}</h3>
              </div>
              <p className="text-sm text-white/80">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
