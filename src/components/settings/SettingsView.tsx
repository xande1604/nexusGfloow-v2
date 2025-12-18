import { useState } from 'react';
import { Save, Building2, Target, Heart, Plus, X, CheckCircle, Loader2 } from 'lucide-react';
import { CompanyContext } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MasterAdminPanel } from './MasterAdminPanel';
import { useMasterAdminData } from '@/hooks/useMasterAdminData';

interface SettingsViewProps {
  companyContext: CompanyContext;
  onSaveContext: (context: CompanyContext) => void;
}

export const SettingsView = ({ companyContext, onSaveContext }: SettingsViewProps) => {
  const [localContext, setLocalContext] = useState<CompanyContext>(companyContext);
  const [newValue, setNewValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { isMasterAdmin, users, accessKeys, environments, loading: masterLoading, refreshData } = useMasterAdminData();

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveContext(localContext);
      setIsSaving(false);
      toast.success('Configurações salvas com sucesso!');
    }, 500);
  };

  const addValue = () => {
    if (newValue.trim() && !localContext.values.includes(newValue.trim())) {
      setLocalContext(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const removeValue = (valueToRemove: string) => {
    setLocalContext(prev => ({
      ...prev,
      values: prev.values.filter(v => v !== valueToRemove)
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Master Admin Panel */}
      {masterLoading ? (
        <div className="bg-card rounded-xl p-6 shadow-medium flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : isMasterAdmin && (
        <MasterAdminPanel 
          users={users} 
          accessKeys={accessKeys} 
          environments={environments}
          onRefresh={refreshData}
        />
      )}

      {/* Company Context */}
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Contexto da Empresa</h3>
            <p className="text-sm text-muted-foreground">Informações usadas para personalizar avaliações e roadmaps</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Mission */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
              <Target className="w-4 h-4 text-brand-600" />
              Missão
            </label>
            <textarea
              value={localContext.mission}
              onChange={(e) => setLocalContext(prev => ({ ...prev, mission: e.target.value }))}
              className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              placeholder="Qual é a missão da sua empresa?"
            />
          </div>

          {/* Vision */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              Visão
            </label>
            <textarea
              value={localContext.vision}
              onChange={(e) => setLocalContext(prev => ({ ...prev, vision: e.target.value }))}
              className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              placeholder="Onde sua empresa quer chegar?"
            />
          </div>

          {/* Values */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              Valores ({localContext.values.length})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addValue()}
                placeholder="Ex: Inovação contínua"
                className="flex-1 h-10 px-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                onClick={addValue}
                className="h-10 px-4 bg-brand-600 text-primary-foreground rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localContext.values.map((value, idx) => (
                <span
                  key={idx}
                  className="group flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-medium"
                >
                  {value}
                  <button
                    onClick={() => removeValue(value)}
                    className="w-4 h-4 rounded-full bg-brand-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {localContext.values.length === 0 && (
                <span className="text-sm text-muted-foreground">Nenhum valor adicionado</span>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium transition-all",
              isSaving
                ? "bg-success text-success-foreground"
                : "bg-brand-600 text-primary-foreground hover:bg-brand-700"
            )}
          >
            {isSaving ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-soft">
          <h4 className="font-semibold text-foreground mb-2">Por que configurar?</h4>
          <p className="text-sm text-muted-foreground">
            Essas informações são utilizadas pela IA para gerar avaliações de desempenho e 
            roadmaps de carreira alinhados com a cultura e objetivos da sua empresa.
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-soft">
          <h4 className="font-semibold text-foreground mb-2">Dicas</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Seja específico na missão e visão</li>
            <li>• Adicione de 3 a 7 valores principais</li>
            <li>• Atualize conforme a empresa evolui</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
