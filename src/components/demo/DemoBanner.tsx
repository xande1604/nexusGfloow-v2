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
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">
            <strong>Modo demonstração</strong> — Você está visualizando dados de exemplo. 
            Para gerenciar seus próprios dados, solicite uma chave de acesso.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRequestAccess}
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            <KeyRound className="w-4 h-4 mr-1" />
            Solicitar acesso
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};
