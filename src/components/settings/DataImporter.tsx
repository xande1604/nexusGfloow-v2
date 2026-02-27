import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'qashsyjrazmkhgeesglb';
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/data-api`;

const ENTITY_LABELS: Record<string, string> = {
  colaboradores: 'Colaboradores',
  cargos: 'Cargos',
  centros_de_custo: 'Centros de Custo',
  empresas: 'Empresas',
};

interface ImportResult {
  inserted: number;
  errors: { row: number; message: string }[];
}

interface DataToken {
  id: string;
  name: string;
  token: string;
}

export const DataImporter = () => {
  const [entity, setEntity] = useState('colaboradores');
  const [tokens, setTokens] = useState<DataToken[]>([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadTokens = useCallback(async () => {
    if (tokensLoaded) return;
    setLoadingTokens(true);
    const { data } = await supabase
      .from('data_webhook_tokens')
      .select('id, name, token')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setTokens((data as DataToken[]) || []);
    if (data && data.length > 0) setSelectedToken((data[0] as DataToken).token);
    setLoadingTokens(false);
    setTokensLoaded(true);
  }, [tokensLoaded]);

  const parseFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
      setPreview(rows);
      setResult(null);
    };
    reader.readAsArrayBuffer(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); parseFile(f); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); parseFile(f); }
  };

  const BATCH_SIZE = 100;

  const handleImport = async () => {
    if (!selectedToken || !preview.length) return;
    setImporting(true);
    setResult(null);

    let totalInserted = 0;
    const errors: { row: number; message: string }[] = [];

    // Send in batches of BATCH_SIZE
    for (let i = 0; i < preview.length; i += BATCH_SIZE) {
      const batch = preview.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch(`${BASE_URL}/${entity}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${selectedToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });
        const json = await res.json();
        if (!res.ok) {
          // Mark entire batch as error
          batch.forEach((_, idx) => {
            errors.push({ row: i + idx + 2, message: json.error || `HTTP ${res.status}` });
          });
        } else {
          totalInserted += json.inserted || 0;
        }
      } catch (err: unknown) {
        batch.forEach((_, idx) => {
          errors.push({ row: i + idx + 2, message: err instanceof Error ? err.message : 'Erro de rede' });
        });
      }
    }

    setResult({ inserted: totalInserted, errors });
    setImporting(false);

    if (errors.length === 0) {
      toast.success(`${totalInserted} registro(s) importado(s) com sucesso!`);
    } else {
      toast.warning(`${totalInserted} importado(s), ${errors.length} com erro.`);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setShowPreview(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Select entity + token */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Entidade</label>
          <Select value={entity} onValueChange={(v) => { setEntity(v); reset(); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Token de API</label>
          <Select
            value={selectedToken}
            onValueChange={setSelectedToken}
            onOpenChange={(open) => { if (open) loadTokens(); }}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingTokens ? 'Carregando...' : 'Selecione um token'} />
            </SelectTrigger>
            <SelectContent>
              {tokens.length === 0 && !loadingTokens && (
                <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum token ativo encontrado</div>
              )}
              {tokens.map((t) => (
                <SelectItem key={t.id} value={t.token}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tokensLoaded && tokens.length === 0 && (
            <p className="text-xs text-destructive mt-1">Crie um token em Gestão de Equipe → Tokens de API primeiro.</p>
          )}
        </div>
      </div>

      {/* Step 2: Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/50'
        )}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            <p className="font-medium text-sm text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{preview.length} linha(s) detectada(s)</p>
            <Button size="sm" variant="ghost" className="text-xs" onClick={(e) => { e.stopPropagation(); reset(); }}>
              Remover arquivo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium text-sm text-foreground">Arraste ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground">Aceita .csv, .xlsx, .xls — máx. 20MB</p>
          </div>
        )}
      </div>

      {/* Preview toggle */}
      {preview.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            onClick={() => setShowPreview(v => !v)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Pré-visualização</span>
              <Badge variant="secondary" className="text-xs">{preview.length} linhas</Badge>
            </div>
            {showPreview ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {showPreview && (
            <div className="overflow-x-auto border-t border-border max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-secondary/50 sticky top-0">
                  <tr>
                    {Object.keys(preview[0]).map(col => (
                      <th key={col} className="px-3 py-2 text-left font-mono text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-3 py-1.5 text-foreground whitespace-nowrap max-w-[200px] truncate">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr className="border-t border-border">
                      <td colSpan={Object.keys(preview[0]).length} className="px-3 py-2 text-center text-muted-foreground">
                        + {preview.length - 5} linha(s) não exibidas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Import button */}
      {preview.length > 0 && (
        <Button
          className="w-full gap-2"
          onClick={handleImport}
          disabled={importing || !selectedToken}
        >
          {importing ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Importando {preview.length} registro(s)...</>
          ) : (
            <><Upload className="w-4 h-4" />Importar {preview.length} registro(s) — {ENTITY_LABELS[entity]}</>
          )}
        </Button>
      )}

      {/* Result */}
      {result && (
        <div className={cn(
          'rounded-xl p-4 border space-y-2',
          result.errors.length === 0
            ? 'bg-success/10 border-success/30'
            : 'bg-warning/10 border-warning/30'
        )}>
          <div className="flex items-center gap-2">
            {result.errors.length === 0
              ? <CheckCircle2 className="w-5 h-5 text-success" />
              : <AlertTriangle className="w-5 h-5 text-warning" />
            }
            <span className="font-medium text-sm text-foreground">
              {result.inserted} registro(s) importado(s)
              {result.errors.length > 0 && `, ${result.errors.length} com erro`}
            </span>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {result.errors.slice(0, 20).map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Linha {e.row}: <span className="text-foreground">{e.message}</span></span>
                </div>
              ))}
              {result.errors.length > 20 && (
                <p className="text-xs text-muted-foreground">+ {result.errors.length - 20} erros adicionais</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Security note */}
      <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
        🔒 O isolamento de dados é garantido pelo token selecionado — todos os registros são gravados com o <code className="font-mono">owner_admin_id</code> do token, visível apenas para o seu tenant.
      </p>
    </div>
  );
};
