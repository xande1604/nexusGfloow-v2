import { Bell, Search, User } from 'lucide-react';
import { AppView } from '@/types';

interface HeaderProps {
  activeView: AppView;
}

const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
  [AppView.DASHBOARD]: { title: 'Dashboard', subtitle: 'Visão geral do módulo de talentos' },
  [AppView.ROLES]: { title: 'Cargos e Salários', subtitle: 'Gerencie posições e faixas salariais' },
  [AppView.SKILLS]: { title: 'Repositório de Habilidades', subtitle: 'Catálogo de competências técnicas e comportamentais' },
  [AppView.ROADMAP]: { title: 'Roadmap de Carreira', subtitle: 'Planos de desenvolvimento profissional com IA' },
  [AppView.PERFORMANCE]: { title: 'Avaliações de Desempenho', subtitle: 'Ciclos de feedback e reviews' },
  [AppView.SETTINGS]: { title: 'Configurações', subtitle: 'Contexto da empresa e preferências' },
};

export const Header = ({ activeView }: HeaderProps) => {
  const { title, subtitle } = viewTitles[activeView];

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="animate-fade-in">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground -mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 h-9 pl-9 pr-4 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg hover:bg-secondary transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Admin</span>
        </button>
      </div>
    </header>
  );
};
