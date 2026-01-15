import { 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  Route, 
  ClipboardCheck, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileCheck,
  UserSearch
} from 'lucide-react';
import { AppView } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuItems = [
  { view: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { view: AppView.ROLES, label: 'Cargos e Salários', icon: Briefcase },
  { view: AppView.SKILLS, label: 'Habilidades', icon: Sparkles },
  { view: AppView.EMPLOYEES, label: 'Colaboradores', icon: Users },
  { view: AppView.COST_CENTERS, label: 'Centros de Custos', icon: Building2 },
  { view: AppView.ROADMAP, label: 'Roadmap de Carreira', icon: Route },
  { view: AppView.PERFORMANCE, label: 'Avaliações', icon: ClipboardCheck },
  { view: AppView.TRAININGS, label: 'Treinamentos', icon: GraduationCap },
  { view: AppView.TESTS, label: 'Testes e Certificações', icon: FileCheck },
  { view: AppView.RECRUITMENT, label: 'Recrutamento', icon: UserSearch },
  { view: AppView.TUTORIALS, label: 'Tutoriais', icon: HelpCircle },
  { view: AppView.SETTINGS, label: 'Configurações', icon: Settings },
];

const SidebarContent = ({ 
  activeView, 
  onViewChange, 
  collapsed, 
  setCollapsed,
  onItemClick 
}: { 
  activeView: AppView; 
  onViewChange: (view: AppView) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onItemClick?: () => void;
}) => {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-medium">
          <Layers className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex items-center gap-2">
            <div>
              <h1 className="text-lg font-bold text-foreground">GFloow</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Talentos</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-full uppercase tracking-wide">
              Nexus
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => {
                onViewChange(item.view);
                onItemClick?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-brand-600" : "group-hover:text-brand-500"
                )} 
              />
              {!collapsed && (
                <span className={cn(
                  "text-sm font-medium animate-fade-in truncate",
                  isActive && "text-brand-700"
                )}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button - only on desktop */}
      {setCollapsed && (
        <div className="p-3 border-t border-border hidden md:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Recolher</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export const Sidebar = ({ activeView, onViewChange, mobileOpen, onMobileClose }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Mobile: use Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="p-0 w-[280px] flex flex-col">
          <SidebarContent 
            activeView={activeView} 
            onViewChange={onViewChange}
            collapsed={false}
            setCollapsed={() => {}}
            onItemClick={onMobileClose}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex-col transition-all duration-300 z-50 hidden md:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <SidebarContent 
        activeView={activeView} 
        onViewChange={onViewChange}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
    </aside>
  );
};
