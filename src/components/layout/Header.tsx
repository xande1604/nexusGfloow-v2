import { Bell, Search, User, LogOut, ChevronDown, Menu, BarChart3, ExternalLink, Loader2 } from 'lucide-react';
import { AppView } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
interface HeaderProps {
  activeView: AppView;
  onMenuClick?: () => void;
}

const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
  [AppView.DASHBOARD]: { title: 'Dashboard', subtitle: 'Visão geral do módulo de talentos' },
  [AppView.ROLES]: { title: 'Cargos e Salários', subtitle: 'Gerencie posições e faixas salariais' },
  [AppView.SKILLS]: { title: 'Repositório de Habilidades', subtitle: 'Catálogo de competências técnicas e comportamentais' },
  [AppView.EMPLOYEES]: { title: 'Colaboradores', subtitle: 'Gerencie emails para autoavaliação' },
  [AppView.EMPRESAS]: { title: 'Empresas', subtitle: 'Cadastre e gerencie as empresas do grupo' },
  [AppView.COST_CENTERS]: { title: 'Centros de Custos', subtitle: 'Gerencie centros de custos por empresa' },
  [AppView.ROADMAP]: { title: 'Roadmap de Carreira', subtitle: 'Planos de desenvolvimento profissional com IA' },
  [AppView.PERFORMANCE]: { title: 'Avaliações de Desempenho', subtitle: 'Ciclos de feedback e reviews' },
  [AppView.TRAININGS]: { title: 'Treinamentos', subtitle: 'Registre e acompanhe treinamentos dos colaboradores' },
  [AppView.TESTS]: { title: 'Testes e Certificações', subtitle: 'Avaliações geradas por IA e certificações' },
  [AppView.RECRUITMENT]: { title: 'Recrutamento e Seleção', subtitle: 'Gerencie vagas, candidatos e processo seletivo com IA' },
  [AppView.TUTORIALS]: { title: 'Tutoriais', subtitle: 'Aprenda a usar todas as funcionalidades' },
  [AppView.SETTINGS]: { title: 'Configurações', subtitle: 'Contexto da empresa e preferências' },
  [AppView.API_DOCS]: { title: 'API & Importação', subtitle: 'Documentação da API REST e templates de importação' },
  [AppView.MY_DASHBOARD]: { title: 'Meu Painel', subtitle: 'Seus dados de desenvolvimento e carreira' },
};

export const Header = ({ activeView, onMenuClick }: HeaderProps) => {
  const { title, subtitle } = viewTitles[activeView] || { title: 'Carregando...', subtitle: '' };
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    // Ignore "Auth session missing" error - user is already logged out
    if (error && !error.message?.includes('Auth session missing')) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive',
      });
    }
    // Always redirect to auth page
    navigate('/auth');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  const handleAnalyticsClick = async () => {
    if (!user) {
      // If not logged in, just open Analytics normally
      window.open('https://gfloow.com.br', '_blank');
      return;
    }

    setIsSsoLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sso-token');
      
      if (error) {
        console.error('SSO token generation failed:', error);
        toast({
          title: 'Erro ao gerar token SSO',
          description: 'Abrindo Analytics normalmente...',
          variant: 'destructive',
        });
        window.open('https://gfloow.com.br', '_blank');
        return;
      }

      const ssoToken = data?.sso_token;
      if (ssoToken) {
        window.open(`https://gfloow.com.br?sso_token=${ssoToken}`, '_blank');
      } else {
        window.open('https://gfloow.com.br', '_blank');
      }
    } catch (err) {
      console.error('SSO error:', err);
      window.open('https://gfloow.com.br', '_blank');
    } finally {
      setIsSsoLoading(false);
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        
        <div className="animate-fade-in">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-xs md:text-sm text-muted-foreground -mt-0.5 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Analytics Link with SSO */}
        <button
          onClick={handleAnalyticsClick}
          disabled={isSsoLoading}
          className="flex items-center gap-2 h-9 px-3 rounded-lg bg-brand-600 text-primary-foreground hover:bg-brand-700 transition-colors disabled:opacity-70"
        >
          {isSsoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BarChart3 className="w-4 h-4" />
          )}
          {!isMobile && (
            <>
              <span className="text-sm font-medium">Analytics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Search - hidden on mobile */}
        <div className="relative hidden md:block">
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

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 h-9 pl-2 pr-2 md:pr-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground max-w-[80px] md:max-w-[120px] truncate hidden sm:block">{userName}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
