import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Building2, Mail, User } from 'lucide-react';

interface DemoLeadFormProps {
  onSuccess: () => void;
}

export const DemoLeadForm = ({ onSuccess }: DemoLeadFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha nome e email.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('contatos').insert({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        empresa: formData.empresa.trim() || null,
        mensagem: 'Solicitação de acesso à demonstração da plataforma',
      });

      if (error) throw error;

      toast({
        title: 'Acesso liberado!',
        description: 'Aproveite para explorar a plataforma.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: 'Erro ao registrar',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Experimente o GFloow</CardTitle>
          <CardDescription className="text-base mt-2">
            Preencha seus dados para acessar uma demonstração completa da plataforma de gestão de talentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nome completo *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Seu nome"
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email corporativo *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@empresa.com"
                maxLength={255}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="empresa" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Empresa
              </Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Nome da sua empresa"
                maxLength={100}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Acessar demonstração'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Ao continuar, você concorda em receber informações sobre o GFloow.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
