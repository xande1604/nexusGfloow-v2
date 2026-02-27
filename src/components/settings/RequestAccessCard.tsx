import { useState } from 'react';
import { UserPlus, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const RequestAccessCard = () => {
  const { user } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [requestedRole, setRequestedRole] = useState('gestor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequest = async () => {
    if (!adminEmail.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // Look up admin profile by email
      const { data: adminProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', adminEmail.trim().toLowerCase())
        .maybeSingle();

      if (error || !adminProfile) {
        toast.error('Administrador não encontrado com este e-mail');
        return;
      }

      // Check that this user is actually an admin
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', adminProfile.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!adminRole) {
        toast.error('Este usuário não é um administrador');
        return;
      }

      // Set pending fields on own profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          pending_admin_id: adminProfile.id,
          pending_role: requestedRole,
          requested_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSubmitted(true);
      toast.success('Solicitação enviada! Aguarde aprovação do administrador.');
    } catch (err) {
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <div className="flex items-center gap-3 text-emerald-600">
          <CheckCircle className="w-8 h-8" />
          <div>
            <p className="font-semibold">Solicitação enviada com sucesso!</p>
            <p className="text-sm text-muted-foreground">O administrador receberá sua solicitação e poderá aprovar seu acesso.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-medium">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Solicitar acesso a um ambiente</h3>
          <p className="text-sm text-muted-foreground">Informe o e-mail do administrador para solicitar acesso</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>E-mail do administrador</Label>
          <Input
            type="email"
            placeholder="admin@empresa.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Papel desejado</Label>
          <Select value={requestedRole} onValueChange={setRequestedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gestor">Gestor</SelectItem>
              <SelectItem value="analista">Analista</SelectItem>
              <SelectItem value="visualizador">Visualizador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full gap-2"
          onClick={handleRequest}
          disabled={isSubmitting || !adminEmail.trim()}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Enviando...' : 'Solicitar Acesso'}
        </Button>
      </div>
    </div>
  );
};
