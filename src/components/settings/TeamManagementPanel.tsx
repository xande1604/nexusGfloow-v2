import { useState } from 'react';
import { Users, Key, Plus, Copy, Trash2, CheckCircle, Clock, Shield, RefreshCw, UserCheck, UserX, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useUserRole } from '@/hooks/useUserRole';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  analista: 'Analista',
  visualizador: 'Visualizador',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700',
  gestor: 'bg-blue-100 text-blue-700',
  analista: 'bg-emerald-100 text-emerald-700',
  visualizador: 'bg-muted text-muted-foreground',
};

export const TeamManagementPanel = () => {
  const { role } = useUserRole();
  const isAdmin = role === 'admin';
  const { members, pendingMembers, accessKeys, loading, generateKey, deleteKey, approveMember, rejectMember, removeMember, updateMemberRole, refresh } = useTeamManagement(isAdmin);

  const [showGenerateKey, setShowGenerateKey] = useState(false);
  const [keyRole, setKeyRole] = useState('gestor');
  const [keyExpiry, setKeyExpiry] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [approveDialog, setApproveDialog] = useState<{ userId: string; name: string } | null>(null);
  const [approveRole, setApproveRole] = useState('gestor');
  const [editRoleDialog, setEditRoleDialog] = useState<{ userId: string; name: string; currentRole: string } | null>(null);
  const [editRole, setEditRole] = useState('gestor');

  if (!isAdmin) return null;

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    const days = keyExpiry === 'never' ? undefined : parseInt(keyExpiry);
    const key = await generateKey(keyRole, days);
    setIsGenerating(false);
    if (key) {
      setGeneratedKey(key);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const unusedKeys = accessKeys.filter(k => !k.is_used);
  const usedKeys = accessKeys.filter(k => k.is_used);

  return (
    <div className="bg-card rounded-xl p-6 shadow-medium">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Gestão de Equipe</h3>
            <p className="text-sm text-muted-foreground">Gerencie membros e acessos do seu ambiente</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Membros
            {members.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{members.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingMembers.length > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs bg-amber-500">{pendingMembers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Chaves
            {unusedKeys.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{unusedKeys.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhum membro na equipe ainda. Gere uma chave de acesso para convidar.
              </p>
            ) : (
              members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[member.role] || ROLE_COLORS.visualizador}`}>
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <div className="space-y-2">
            {pendingMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhuma solicitação pendente de aprovação.
              </p>
            ) : (
              pendingMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                      {member.requested_at && (
                        <p className="text-xs text-muted-foreground">
                          Solicitado {format(new Date(member.requested_at), "d 'de' MMM", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setApproveDialog({ userId: member.id, name: member.name })}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Aprovar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-destructive hover:bg-destructive/10"
                      onClick={() => rejectMember(member.id)}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Recusar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Keys Tab */}
        <TabsContent value="keys">
          <div className="space-y-3">
            <Button
              size="sm"
              onClick={() => { setShowGenerateKey(true); setGeneratedKey(null); }}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Gerar Nova Chave de Acesso
            </Button>

            {unusedKeys.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Chaves Disponíveis</p>
                <div className="space-y-2">
                  {unusedKeys.map(key => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <div>
                        <code className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">{key.key_code}</code>
                        {key.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expira em {format(new Date(key.expires_at), "d/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleCopy(key.key_code)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => deleteKey(key.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {usedKeys.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Chaves Utilizadas</p>
                <div className="space-y-2">
                  {usedKeys.slice(0, 5).map(key => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg opacity-60">
                      <div>
                        <code className="text-sm font-mono text-muted-foreground">{key.key_code}</code>
                        {key.used_at && (
                          <p className="text-xs text-muted-foreground">
                            Usado em {format(new Date(key.used_at), "d/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Key Dialog */}
      <Dialog open={showGenerateKey} onOpenChange={setShowGenerateKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Chave de Acesso</DialogTitle>
          </DialogHeader>
          {generatedKey ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Chave gerada! Compartilhe com o novo membro:</p>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <code className="flex-1 text-lg font-mono font-bold text-emerald-700">{generatedKey}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedKey)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O membro deve acessar <strong>Configurações → Resgatar chave de acesso</strong> e inserir esta chave.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Papel do novo membro</Label>
                <Select value={keyRole} onValueChange={setKeyRole}>
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
              <div className="space-y-2">
                <Label>Validade da chave</Label>
                <Select value={keyExpiry} onValueChange={setKeyExpiry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="never">Sem validade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            {generatedKey ? (
              <Button onClick={() => setShowGenerateKey(false)}>Fechar</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowGenerateKey(false)}>Cancelar</Button>
                <Button onClick={handleGenerateKey} disabled={isGenerating}>
                  {isGenerating ? 'Gerando...' : 'Gerar Chave'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Member Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar {approveDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Selecione o papel para este membro:</p>
            <Select value={approveRole} onValueChange={setApproveRole}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>Cancelar</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (approveDialog) {
                  approveMember(approveDialog.userId, approveRole);
                  setApproveDialog(null);
                }
              }}
            >
              Aprovar Membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
