import { useState } from 'react';
import { Key, Loader2, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RedeemAccessKeyCardProps {
  onSuccess?: () => void;
}

export const RedeemAccessKeyCard = ({ onSuccess }: RedeemAccessKeyCardProps) => {
  const { user } = useAuth();
  const [accessKey, setAccessKey] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const handleRedeem = async () => {
    if (!accessKey.trim()) {
      toast.error('Digite uma chave de acesso');
      return;
    }

    if (!user?.id) {
      toast.error('Você precisa estar logado para resgatar uma chave');
      return;
    }

    setIsRedeeming(true);

    try {
      const { data, error } = await supabase.functions.invoke('validate-access-key', {
        body: { keyCode: accessKey.trim(), userId: user.id }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao validar chave');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setIsRedeemed(true);
      toast.success('Chave resgatada com sucesso! Você agora tem seu próprio ambiente.');
      
      // Reload page to apply new permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      onSuccess?.();
    } catch (error: any) {
      console.error('Error redeeming key:', error);
      toast.error(error.message || 'Erro ao resgatar chave de acesso');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isRedeemed) {
    return (
      <div className="bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ambiente Criado!</h3>
            <p className="text-sm text-muted-foreground">Recarregando para aplicar suas novas permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Criar Meu Ambiente</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Com uma chave de acesso, você pode criar seu próprio ambiente isolado com dados independentes para sua empresa ou equipe.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Resgate uma chave de acesso para criar seu ambiente isolado com dados independentes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                placeholder="RH-XXXXXXXX-XXXXXXXX"
                className="w-full h-10 pl-10 pr-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase font-mono"
                disabled={isRedeeming}
              />
            </div>
            <button
              onClick={handleRedeem}
              disabled={isRedeeming || !accessKey.trim()}
              className="h-10 px-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Resgatando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Resgatar Chave</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
