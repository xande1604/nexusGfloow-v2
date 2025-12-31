import { useState } from 'react';
import { Users, Key, Building2, RefreshCw, CheckCircle, XCircle, Clock, Shield, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  created_by_admin_id: string | null;
}

interface AccessKey {
  id: string;
  key_code: string;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface Environment {
  id: string;
  nomeempresa: string;
  codempresa: string;
  owner_admin_id: string | null;
  created_at: string;
  employeeCount?: number;
}

interface MasterAdminPanelProps {
  users: UserWithRole[];
  accessKeys: AccessKey[];
  environments: Environment[];
  onRefresh: () => void;
}

export const MasterAdminPanel = ({ users, accessKeys, environments, onRefresh }: MasterAdminPanelProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getRoleBadge = (role: string, isMaster: boolean) => {
    if (isMaster) {
      return <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">Master Admin</Badge>;
    }
    const colors: Record<string, string> = {
      admin: 'bg-brand-500/20 text-brand-700 border-brand-500/30',
      gestor: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      analista: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      visualizador: 'bg-slate-500/20 text-slate-700 border-slate-500/30'
    };
    return <Badge className={colors[role] || colors.visualizador}>{role}</Badge>;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-medium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Painel Master Admin</h3>
            <p className="text-sm text-muted-foreground">Gerencie usuários, chaves e ambientes</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Chaves ({accessKeys?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="environments" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Ambientes ({environments?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Perfil</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(users || []).map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role, user.created_by_admin_id === null && user.role === 'admin')}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Access Keys Tab */}
        <TabsContent value="keys">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Chave</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Usada em</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Expira em</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Criada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(accessKeys || []).map((key) => (
                  <tr key={key.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{key.key_code}</code>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyToClipboard(key.key_code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {key.is_used ? (
                        <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Usada
                        </Badge>
                      ) : key.expires_at && new Date(key.expires_at) < new Date() ? (
                        <Badge className="bg-red-500/20 text-red-700 border-red-500/30 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          Expirada
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Disponível
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(key.used_at)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(key.expires_at)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(key.created_at)}</td>
                  </tr>
                ))}
                {(!accessKeys || accessKeys.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma chave de acesso encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Environments Tab */}
        <TabsContent value="environments">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Código</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Colaboradores</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Criada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(environments || []).map((env) => (
                  <tr key={env.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{env.nomeempresa}</td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{env.codempresa}</code>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{env.employeeCount || 0} colaboradores</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(env.created_at)}</td>
                  </tr>
                ))}
                {(!environments || environments.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum ambiente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
