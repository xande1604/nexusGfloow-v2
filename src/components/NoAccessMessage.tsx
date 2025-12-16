import { KeyRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const NoAccessMessage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Sessão encerrada',
      description: 'Você foi desconectado com sucesso.',
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl">Acesso Pendente</CardTitle>
          <CardDescription className="text-base mt-2">
            Sua conta foi criada, mas você ainda não possui acesso à plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              Para utilizar o GFloow, você precisa de uma <strong className="text-foreground">chave de acesso</strong> fornecida por um administrador.
            </p>
            <p>
              Entre em contato com o responsável pela sua organização para obter sua chave de acesso.
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair e tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
