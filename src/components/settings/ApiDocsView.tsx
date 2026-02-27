import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Copy, Download, ExternalLink, Key, CheckCircle, ChevronDown, ChevronRight, Code2, Table2, BookOpen, Upload, Plus, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DataImporter } from './DataImporter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'qashsyjrazmkhgeesglb';
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/data-api`;

// ─── CSV Templates ────────────────────────────────────────────
const CSV_TEMPLATES: Record<string, { label: string; headers: string[]; example: string[] }> = {
  colaboradores: {
    label: 'Colaboradores',
    headers: ['nome', 'chave_empresa', 'matricula', 'codigocargo', 'codempresa', 'codfilial', 'codcentrodecustos', 'dataadmissao', 'datanascimento', 'sexo', 'estadocivil', 'escolaridade', 'tipocontrato', 'codsituacao', 'valorsalario', 'email', 'cpf', 'pcd', 'racacor'],
    example: ['João da Silva', 'EMP001', '00123', 'CARGO001', '001', '01', 'CC001', '2023-01-15', '1990-05-20', 'M', 'S', 'SUP', 'CLT', 'A', '5000', 'joao@empresa.com', '12345678901', 'N', '01'],
  },
  cargos: {
    label: 'Cargos',
    headers: ['codigocargo', 'tituloreduzido', 'cbo2002', 'salary_min', 'salary_max', 'hard_skills', 'soft_skills', 'technical_knowledge', 'faz_parte_cota_aprendiz'],
    example: ['CARGO001', 'Analista RH', '2521-05', '3000', '6000', 'Excel;Power BI', 'Comunicação;Liderança', 'Gestão de pessoas', 'false'],
  },
  centros_de_custo: {
    label: 'Centros de Custo',
    headers: ['codcentrodecustos', 'nomecentrodecustos', 'codempresa'],
    example: ['CC001', 'Recursos Humanos', '001'],
  },
  empresas: {
    label: 'Empresas',
    headers: ['codempresa', 'nomeempresa', 'cnae', 'grau_risco', 'percentual_encargos'],
    example: ['001', 'Empresa XYZ Ltda', '7020400', '1', '80'],
  },
};

function downloadTemplate(entity: string, format: 'csv' | 'xlsx') {
  const tpl = CSV_TEMPLATES[entity];
  const ws = XLSX.utils.aoa_to_sheet([tpl.headers, tpl.example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tpl.label);

  if (format === 'xlsx') {
    XLSX.writeFile(wb, `template_${entity}.xlsx`);
  } else {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `template_${entity}.csv`;
    a.click();
  }
}

// ─── Endpoint docs ────────────────────────────────────────────
const ENDPOINTS = [
  { method: 'GET', path: '/{entity}', desc: 'Listar registros (paginado)', params: '?page=1&limit=100', badge: 'green' },
  { method: 'GET', path: '/{entity}/{id}', desc: 'Buscar registro por ID', params: '', badge: 'green' },
  { method: 'POST', path: '/{entity}', desc: 'Criar registro(s) — aceita array para importação em lote', params: '', badge: 'blue' },
  { method: 'PUT', path: '/{entity}/{id}', desc: 'Atualizar registro', params: '', badge: 'amber' },
  { method: 'PATCH', path: '/{entity}', desc: 'Upsert em lote (sync — cria ou atualiza por ID)', params: '', badge: 'purple' },
  { method: 'DELETE', path: '/{entity}/{id}', desc: 'Deletar registro', params: '', badge: 'red' },
];

const ENTITIES = ['colaboradores', 'cargos', 'centros_de_custo', 'empresas'];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-violet-100 text-violet-700',
  DELETE: 'bg-red-100 text-red-700',
};

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg bg-muted border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-muted-foreground/10 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{lang}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">{code}</pre>
    </div>
  );
}

// ─── Token Manager ────────────────────────────────────────────
interface ApiToken {
  id: string;
  name: string;
  token: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

function TokenManager() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('data_webhook_tokens')
      .select('*')
      .order('created_at', { ascending: false });
    setTokens((data as ApiToken[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTokens(); }, [user]);

  const createToken = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    const token = `dwt_${crypto.randomUUID().replace(/-/g, '')}`;
    const { error } = await supabase.from('data_webhook_tokens').insert({
      name: newName.trim(),
      token,
      owner_admin_id: user.id,
      is_active: true,
    });
    if (error) { toast.error('Erro ao criar token'); }
    else {
      toast.success('Token criado!');
      setNewName('');
      // Show the new token immediately
      setVisibleTokens(prev => new Set([...prev, token]));
      await fetchTokens();
    }
    setCreating(false);
  };

  const revokeToken = async (id: string) => {
    const { error } = await supabase.from('data_webhook_tokens').update({ is_active: false }).eq('id', id);
    if (error) toast.error('Erro ao revogar token');
    else { toast.success('Token revogado'); fetchTokens(); }
  };

  const deleteToken = async (id: string) => {
    const { error } = await supabase.from('data_webhook_tokens').delete().eq('id', id);
    if (error) toast.error('Erro ao deletar token');
    else { toast.success('Token removido'); fetchTokens(); }
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success('Token copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisible = (id: string) => {
    setVisibleTokens(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <div className="space-y-4">
      {/* Create new token */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Novo Token</h3>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createToken()}
            placeholder="Nome do token (ex: Integração n8n)"
            className="flex-1 h-9 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Button onClick={createToken} disabled={creating || !newName.trim()} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            {creating ? 'Criando...' : 'Criar'}
          </Button>
        </div>
      </div>

      {/* Token list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Tokens criados</h3>
          <button onClick={fetchTokens} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : tokens.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum token criado ainda.</div>
        ) : (
          <div className="divide-y divide-border">
            {tokens.map(t => (
              <div key={t.id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{t.name}</span>
                    <Badge variant={t.is_active ? 'default' : 'secondary'} className="text-xs">
                      {t.is_active ? 'Ativo' : 'Revogado'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-xs">
                      {visibleTokens.has(t.id) ? t.token : '•'.repeat(24)}
                    </code>
                    <button onClick={() => toggleVisible(t.id)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                      {visibleTokens.has(t.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => copyToken(t.token, t.id)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                      {copiedId === t.id ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Criado em {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    {t.last_used_at && ` · Último uso: ${new Date(t.last_used_at).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
          {t.is_active && (
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-warning hover:text-warning/80" onClick={() => revokeToken(t.id)}>
                      Revogar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteToken(t.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────
export const ApiDocsView = () => {
  const [openSection, setOpenSection] = useState<string | null>('overview');

  const toggleSection = (s: string) => setOpenSection(prev => prev === s ? null : s);

  const postExample = (entity: string) => {
    const tpl = CSV_TEMPLATES[entity];
    const obj: Record<string, string> = {};
    tpl.headers.forEach((h, i) => { obj[h] = tpl.example[i]; });
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <Code2 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">API & Importação</h2>
          <p className="text-sm text-muted-foreground">Documentação da API REST e templates de importação CSV</p>
        </div>
      </div>

      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="tokens" className="gap-2"><Key className="w-4 h-4" />Tokens de API</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><BookOpen className="w-4 h-4" />Documentação API</TabsTrigger>
          <TabsTrigger value="csv" className="gap-2"><Upload className="w-4 h-4" />Templates & Importação</TabsTrigger>
        </TabsList>

        {/* ── TOKENS ────────────────────────────────────── */}
        <TabsContent value="tokens" className="mt-4">
          <TokenManager />
        </TabsContent>

        {/* ── API DOCS ────────────────────────────────────── */}
        <TabsContent value="api" className="space-y-4 mt-4">

          {/* Base URL */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Base URL</h3>
            <CodeBlock code={BASE_URL} lang="url" />
          </div>

          {/* Auth */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection('auth')}
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-brand-600" />
                <span className="font-semibold text-foreground">Autenticação</span>
              </div>
              {openSection === 'auth' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSection === 'auth' && (
              <div className="px-5 pb-5 space-y-3 border-t border-border">
                <p className="text-sm text-muted-foreground pt-3">
                  Todas as requisições devem incluir um <strong>token de webhook</strong> no header Authorization.
                  Gere tokens em <strong>Configurações → Gestão de Equipe → Tokens de API</strong> ou via Master Admin.
                </p>
                <CodeBlock lang="bash" code={`curl ${BASE_URL}/colaboradores \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI"`} />
              </div>
            )}
          </div>

          {/* Entities */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection('entities')}
            >
              <div className="flex items-center gap-3">
                <Table2 className="w-5 h-5 text-brand-600" />
                <span className="font-semibold text-foreground">Entidades disponíveis</span>
              </div>
              {openSection === 'entities' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSection === 'entities' && (
              <div className="px-5 pb-5 border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-2">
                  {ENTITIES.map(e => (
                    <div key={e} className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg">
                      <code className="text-sm font-mono font-medium text-brand-600">/{e}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Endpoints */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection('endpoints')}
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-brand-600" />
                <span className="font-semibold text-foreground">Endpoints</span>
              </div>
              {openSection === 'endpoints' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSection === 'endpoints' && (
              <div className="px-5 pb-5 border-t border-border pt-3 space-y-2">
                {ENDPOINTS.map((ep, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5', METHOD_COLORS[ep.method])}>
                      {ep.method}
                    </span>
                    <div className="min-w-0">
                      <code className="text-sm font-mono text-foreground">{ep.path}{ep.params && <span className="text-muted-foreground">{ep.params}</span>}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{ep.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Examples per entity */}
          {ENTITIES.map(entity => (
            <div key={entity} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors"
                onClick={() => toggleSection(entity)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground capitalize">{CSV_TEMPLATES[entity].label}</span>
                  <code className="text-xs text-brand-600 font-mono bg-brand-50 dark:bg-brand-950/30 px-2 py-0.5 rounded">/{entity}</code>
                </div>
                {openSection === entity ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {openSection === entity && (
                <div className="px-5 pb-5 border-t border-border space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Campos obrigatórios:</strong>{' '}
                    {entity === 'colaboradores' && <code className="text-xs">chave_empresa</code>}
                    {entity === 'cargos' && <><code className="text-xs">codigocargo</code>, <code className="text-xs">tituloreduzido</code></>}
                    {entity === 'centros_de_custo' && <><code className="text-xs">codcentrodecustos</code>, <code className="text-xs">nomecentrodecustos</code>, <code className="text-xs">codempresa</code></>}
                    {entity === 'empresas' && <><code className="text-xs">codempresa</code>, <code className="text-xs">nomeempresa</code></>}
                  </p>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Criar (POST)</p>
                    <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/${entity} \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${postExample(entity)}'`} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Importação em lote (POST array)</p>
                    <CodeBlock lang="bash" code={`curl -X POST ${BASE_URL}/${entity} \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '[${postExample(entity)}, {...}]'`} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Listar (GET)</p>
                    <CodeBlock lang="bash" code={`curl "${BASE_URL}/${entity}?page=1&limit=100" \\
  -H "Authorization: Bearer SEU_TOKEN"`} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Upsert / Sync em lote (PATCH)</p>
                    <CodeBlock lang="bash" code={`curl -X PATCH ${BASE_URL}/${entity} \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '[{"id": "uuid-opcional", ...campos...}]'`} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Response format */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors"
              onClick={() => toggleSection('responses')}
            >
              <span className="font-semibold text-foreground">Formato de Resposta</span>
              {openSection === 'responses' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSection === 'responses' && (
              <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                <CodeBlock lang="json" code={`// Sucesso - lista
{ "data": [...], "total": 150, "page": 1, "limit": 100 }

// Sucesso - criação
{ "data": {...}, "inserted": 1 }

// Erro
{ "error": "Missing required field: chave_empresa", "required": ["chave_empresa"] }

// Códigos HTTP
// 200 OK | 201 Created | 400 Bad Request | 401 Unauthorized | 404 Not Found | 500 Internal Error`} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── CSV TEMPLATES ────────────────────────────────── */}
        <TabsContent value="csv" className="space-y-6 mt-4">
          {/* Download templates */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-1">Templates de importação</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe o template, preencha com seus dados e use o importador abaixo ou a API diretamente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENTITIES.map(entity => (
                <div key={entity} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{CSV_TEMPLATES[entity].label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{CSV_TEMPLATES[entity].headers.length} colunas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => downloadTemplate(entity, 'xlsx')}>
                      <Download className="w-3 h-3" />XLSX
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => downloadTemplate(entity, 'csv')}>
                      <Download className="w-3 h-3" />CSV
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live importer */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Importar arquivo</h3>
                <p className="text-xs text-muted-foreground">CSV ou XLSX — os dados são enviados direto para a API com isolamento por tenant</p>
              </div>
            </div>
            <DataImporter />
          </div>

          {/* Field reference per entity */}
          {ENTITIES.map(entity => (
            <div key={entity} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h4 className="font-semibold text-foreground">{CSV_TEMPLATES[entity].label} — Referência de campos</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Campo</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exemplo</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Obrigatório</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CSV_TEMPLATES[entity].headers.map((h, i) => {
                      const requiredFields: Record<string, string[]> = {
                        colaboradores: ['chave_empresa'],
                        cargos: ['codigocargo', 'tituloreduzido'],
                        centros_de_custo: ['codcentrodecustos', 'nomecentrodecustos', 'codempresa'],
                        empresas: ['codempresa', 'nomeempresa'],
                      };
                      const isRequired = requiredFields[entity]?.includes(h);
                      return (
                        <tr key={h} className={cn('border-t border-border', i % 2 === 0 ? '' : 'bg-secondary/20')}>
                          <td className="px-4 py-2.5">
                            <code className="text-xs font-mono text-brand-600">{h}</code>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{CSV_TEMPLATES[entity].example[i]}</td>
                          <td className="px-4 py-2.5">
                            {isRequired
                              ? <Badge className="text-xs bg-brand-100 text-brand-700 hover:bg-brand-100">Sim</Badge>
                              : <span className="text-xs text-muted-foreground">Não</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
