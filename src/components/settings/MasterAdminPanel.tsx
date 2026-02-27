import { useState } from 'react';
import { Users, Key, Building2, RefreshCw, CheckCircle, XCircle, Clock, Shield, Copy, FileText, Eye, Mail, Phone, Building, MessageSquare, Trash2, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { PricingResponse, PricingQuestion } from '@/hooks/useMasterAdminData';

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
  pricingResponses: PricingResponse[];
  pricingQuestions: PricingQuestion[];
  onRefresh: () => void;
}

const PROFILE_LABELS: Record<string, string> = {
  empresa_isolada: 'Empresa (Implementação Completa)',
  consultor_revenda: 'Consultor (Revenda)',
  consultor_proprio: 'Consultor (Entrega Própria)'
};

export const MasterAdminPanel = ({ users, accessKeys, environments, pricingResponses, pricingQuestions, onRefresh }: MasterAdminPanelProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<PricingResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'key'; id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'key') {
        const { error } = await supabase.from('access_keys').delete().eq('id', deleteTarget.id);
        if (error) throw error;
        toast.success('Chave excluída com sucesso');
      } else {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', deleteTarget.id);
        if (error) throw error;
        toast.success('Usuário removido com sucesso');
      }
      onRefresh();
    } catch (err: any) {
      toast.error('Erro ao excluir: ' + err.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditUser(user);
    setEditRole(user.role);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: editRole as any })
        .eq('user_id', editUser.id);
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso');
      onRefresh();
      setEditUser(null);
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getQuestionText = (questionId: string): string => {
    const question = pricingQuestions.find(q => q.id === questionId);
    return question?.question_text || `Pergunta #${questionId.slice(0, 8)}`;
  };

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

  const getProfileBadge = (profileType: string) => {
    const colors: Record<string, string> = {
      empresa_isolada: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      consultor_revenda: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      consultor_proprio: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
    };
    return <Badge className={colors[profileType] || 'bg-slate-500/20 text-slate-700'}>{PROFILE_LABELS[profileType] || profileType}</Badge>;
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
            <p className="text-sm text-muted-foreground">Gerencie usuários, chaves, ambientes e leads</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuários</span> ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Chaves</span> ({accessKeys?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="environments" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Ambientes</span> ({environments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Leads</span> ({pricingResponses?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Perfil</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Criado em</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(users || []).map((user) => {
                  const isMaster = user.created_by_admin_id === null && user.role === 'admin';
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role, isMaster)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        {!isMaster && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget({ type: 'user', id: user.id, label: user.name || user.email })}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Usada em</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Expira em</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Criada em</th>
                  <th className="px-4 py-3"></th>
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
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatDate(key.used_at)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{formatDate(key.expires_at)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{formatDate(key.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget({ type: 'key', id: key.id, label: key.key_code })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!accessKeys || accessKeys.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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

        {/* Pricing Responses Tab */}
        <TabsContent value="pricing">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Contato</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Perfil</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Data</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(pricingResponses || []).map((response) => (
                  <tr key={response.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground font-medium">{response.contact_name}</span>
                        <span className="text-xs text-muted-foreground">{response.contact_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{response.company_name || '-'}</td>
                    <td className="px-4 py-3">{getProfileBadge(response.profile_type)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(response.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedResponse(response)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!pricingResponses || pricingResponses.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma resposta de precificação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Detail Modal */}
      <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Lead de Precificação
            </DialogTitle>
            <DialogDescription>
              Detalhes do questionário enviado pelo potencial cliente
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 mt-2">
              {/* Contact Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedResponse.contact_name}</h3>
                    {selectedResponse.company_name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        {selectedResponse.company_name}
                      </p>
                    )}
                  </div>
                  {getProfileBadge(selectedResponse.profile_type)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href={`mailto:${selectedResponse.contact_email}`} 
                    className="flex items-center gap-2 bg-background/80 rounded-lg px-3 py-2.5 hover:bg-background transition-colors group"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm group-hover:text-primary transition-colors">{selectedResponse.contact_email}</span>
                  </a>
                  {selectedResponse.contact_phone && (
                    <a 
                      href={`tel:${selectedResponse.contact_phone}`}
                      className="flex items-center gap-2 bg-background/80 rounded-lg px-3 py-2.5 hover:bg-background transition-colors group"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-sm group-hover:text-primary transition-colors">{selectedResponse.contact_phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Responses */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Respostas do Questionário
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedResponse.responses || {}).map(([questionId, answer], index) => (
                    <div key={questionId} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {index + 1}. {getQuestionText(questionId)}
                      </p>
                      <p className="text-sm text-primary font-medium bg-primary/10 rounded-md px-3 py-2 inline-block">
                        {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                      </p>
                    </div>
                  ))}
                  {Object.keys(selectedResponse.responses || {}).length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm bg-muted/30 rounded-lg">
                      Nenhuma resposta registrada
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>Enviado em: {formatDate(selectedResponse.created_at)}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    const text = `${selectedResponse.contact_name}\n${selectedResponse.contact_email}\n${selectedResponse.contact_phone || ''}\n${selectedResponse.company_name || ''}`;
                    navigator.clipboard.writeText(text);
                    toast.success('Dados copiados!');
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar contato
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar usuário
            </DialogTitle>
            <DialogDescription>
              {editUser?.name} — {editUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Perfil / Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEditUser(null)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="w-full sm:w-auto">
              {isSavingEdit ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === 'key'
                ? `Tem certeza que deseja excluir a chave "${deleteTarget?.label}"? Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja remover o usuário "${deleteTarget?.label}"? O acesso dele será revogado.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full sm:w-auto">
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
