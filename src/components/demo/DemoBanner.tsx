import { Info, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DemoBannerProps {
  onRequestAccess: () => void;
}

export const DemoBanner = ({ onRequestAccess }: DemoBannerProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 md:px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 text-amber-700 dark:text-amber-400">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-xs sm:text-sm">
            <strong>Modo demonstração</strong>
            <span className="hidden sm:inline"> — Você está visualizando dados de exemplo. 
            Para gerenciar seus próprios dados, solicite uma chave de acesso.</span>
            <span className="sm:hidden"> — Dados de exemplo apenas.</span>
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRequestAccess}
            className="border-amber-500/30 hover:bg-amber-500/10 flex-1 sm:flex-initial text-xs sm:text-sm"
          >
            <KeyRound className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Solicitar acesso
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-xs sm:text-sm"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};
