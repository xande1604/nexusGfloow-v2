import { useState, useMemo } from 'react';
import { Search, X, GitCompare, DollarSign, Users, Briefcase, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { JobRole, Skill, Employee } from '@/types';
import { cn } from '@/lib/utils';

interface RoleComparisonViewProps {
  roles: JobRole[];
  skills: Skill[];
  employees?: Employee[];
}

const MAX_COMPARE = 6;

const levelOrder = ['Estagiário', 'Trainee', 'Júnior', 'Pleno', 'Sênior', 'Master', 'Especialista', 'Tech Lead', 'Coordenador', 'Gerente', 'Diretor', 'C-Level'];

// ── Helpers ──────────────────────────────────────────────────────

function salaryBar(value: number, min: number, max: number) {
  if (max === min) return 100;
  return Math.round(((value - min) / (max - min)) * 100);
}

function DiffBadge({ current, prev, type }: { current: string | number; prev?: string | number; type: 'salary' | 'text' }) {
  if (prev === undefined) return null;
  if (type === 'salary') {
    const diff = Number(current) - Number(prev);
    if (diff === 0) return <Minus className="w-3 h-3 text-muted-foreground inline ml-1" />;
    return diff > 0
      ? <ChevronUp className="w-3 h-3 text-emerald-500 inline ml-1" />
      : <ChevronDown className="w-3 h-3 text-red-500 inline ml-1" />;
  }
  if (String(current).trim() !== String(prev).trim()) {
    return <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 align-middle" title="Diferente do nível anterior" />;
  }
  return null;
}

function TextCell({ value, prev }: { value?: string; prev?: string }) {
  if (!value) return <span className="text-muted-foreground/40 text-xs italic">—</span>;
  const changed = prev !== undefined && value.trim() !== prev.trim();
  return (
    <div className={cn('text-xs leading-relaxed text-foreground', changed && 'border-l-2 border-amber-400 pl-2')}>
      {value.split('\n').map((line, i) => (
        <p key={i} className="mb-0.5 last:mb-0">{line}</p>
      ))}
    </div>
  );
}

function TagsCell({ tags, prev }: { tags?: string[]; prev?: string[] }) {
  if (!tags || tags.length === 0) return <span className="text-muted-foreground/40 text-xs italic">—</span>;
  const prevSet = new Set(prev || []);
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => {
        const isNew = prev !== undefined && !prevSet.has(tag);
        return (
          <span
            key={tag}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border',
              isNew
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-brand-50 text-brand-700 border-brand-200'
            )}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}

// ── Section header row ────────────────────────────────────────────
function SectionRow({ label, colCount }: { label: string; colCount: number }) {
  return (
    <tr className="bg-muted/60">
      <td
        colSpan={colCount + 1}
        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────
export const RoleComparisonView = ({ roles, skills, employees = [] }: RoleComparisonViewProps) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(true);

  // Employee count per role codigocargo
  const empCountMap = useMemo(() => {
    const m = new Map<string, number>();
    employees.forEach(e => { if (e.roleId) m.set(e.roleId, (m.get(e.roleId) || 0) + 1); });
    return m;
  }, [employees]);

  const skillMap = useMemo(() => new Map(skills.map(s => [s.id, s.name])), [skills]);

  // Selected roles in order
  const selectedRoles = useMemo(
    () => selectedIds.map(id => roles.find(r => r.id === id)).filter(Boolean) as JobRole[],
    [selectedIds, roles]
  );

  // Filtered roles for picker
  const pickerRoles = useMemo(() => {
    const q = search.toLowerCase();
    return roles.filter(r =>
      (r.title + ' ' + (r.titulolongocargo || '') + ' ' + (r.codigocargo || '')).toLowerCase().includes(q)
    );
  }, [roles, search]);

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < MAX_COMPARE ? [...prev, id] : prev
    );
  };

  // Global salary range for the bar chart
  const globalMin = useMemo(() => Math.min(...selectedRoles.map(r => r.salaryRange.min)), [selectedRoles]);
  const globalMax = useMemo(() => Math.max(...selectedRoles.map(r => r.salaryRange.max)), [selectedRoles]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Picker ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
          onClick={() => setShowPicker(v => !v)}
        >
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-semibold text-foreground">Selecionar cargos para comparar</span>
            {selectedIds.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-brand-600 text-white rounded-full">
                {selectedIds.length}/{MAX_COMPARE}
              </span>
            )}
          </div>
          <ChevronUp className={cn('w-4 h-4 text-muted-foreground transition-transform', !showPicker && 'rotate-180')} />
        </button>

        {showPicker && (
          <div className="border-t border-border p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cargos por código ou título..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Selected pills */}
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(role => (
                  <span
                    key={role.id}
                    className="flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium"
                  >
                    {role.codigocargo ? `${role.codigocargo} - ` : ''}{role.title}
                    <button onClick={() => toggle(role.id)} className="hover:text-brand-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1 text-xs text-muted-foreground hover:text-destructive border border-dashed border-border rounded-full"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Role list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {pickerRoles.map(role => {
                const selected = selectedIds.includes(role.id);
                const disabled = !selected && selectedIds.length >= MAX_COMPARE;
                return (
                  <button
                    key={role.id}
                    onClick={() => !disabled && toggle(role.id)}
                    disabled={disabled}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all',
                      selected
                        ? 'bg-brand-50 border-brand-400 text-brand-700'
                        : disabled
                        ? 'opacity-40 cursor-not-allowed border-border bg-background'
                        : 'border-border bg-background hover:border-brand-300 hover:bg-brand-50/50 text-foreground'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center',
                      selected ? 'bg-brand-600 border-brand-600' : 'border-muted-foreground/40'
                    )}>
                      {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {role.codigocargo ? <span className="text-muted-foreground font-mono mr-1">{role.codigocargo}</span> : null}
                        {role.titulolongocargo || role.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{role.level} · {role.department}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {pickerRoles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum cargo encontrado</p>
            )}
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {selectedRoles.length === 0 && (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
          <GitCompare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Selecione 2 ou mais cargos acima para ver o comparativo</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Máximo de {MAX_COMPARE} cargos simultaneamente</p>
        </div>
      )}

      {selectedRoles.length === 1 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">Selecione pelo menos mais um cargo para comparar</p>
        </div>
      )}

      {/* ── Matrix ── */}
      {selectedRoles.length >= 2 && (
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-muted/40">
                  {/* Sticky label column */}
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider sticky left-0 bg-muted/40 z-10 min-w-[160px] border-r border-border">
                    Atributo
                  </th>
                  {selectedRoles.map((role, i) => (
                    <th key={role.id} className="px-4 py-3 min-w-[200px] max-w-[260px] text-left border-l border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {role.titulolongocargo || role.title}
                          </p>
                          {role.codigocargo && (
                            <p className="text-xs font-mono text-muted-foreground">{role.codigocargo}</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggle(role.id)}
                          className="ml-auto p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
                          title="Remover do comparativo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">

                {/* ── IDENTIFICAÇÃO ── */}
                <SectionRow label="Identificação" colCount={selectedRoles.length} />

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border">Nível</td>
                  {selectedRoles.map((role, i) => {
                    const prev = selectedRoles[i - 1];
                    const orderIdx = levelOrder.indexOf(role.level);
                    const prevOrderIdx = prev ? levelOrder.indexOf(prev.level) : -1;
                    const isHigher = prev && orderIdx > prevOrderIdx;
                    return (
                      <td key={role.id} className="px-4 py-3 border-l border-border/30">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-semibold',
                          'bg-brand-100 text-brand-700'
                        )}>
                          {role.level}
                        </span>
                        {prev && isHigher && <ChevronUp className="w-3 h-3 text-emerald-500 inline ml-1" />}
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border">Departamento</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 text-sm text-foreground border-l border-border/30">
                      {role.department}
                      <DiffBadge current={role.department} prev={selectedRoles[i - 1]?.department} type="text" />
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border">CBO</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 text-sm font-mono text-muted-foreground border-l border-border/30">
                      {role.cbo || '—'}
                      <DiffBadge current={role.cbo || ''} prev={selectedRoles[i - 1]?.cbo || ''} type="text" />
                    </td>
                  ))}
                </tr>

                {/* ── REMUNERAÇÃO ── */}
                <SectionRow label="Remuneração" colCount={selectedRoles.length} />

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-success" />Faixa Salarial</span>
                  </td>
                  {selectedRoles.map((role, i) => {
                    const prev = selectedRoles[i - 1];
                    const pctMin = globalMax > globalMin ? salaryBar(role.salaryRange.min, globalMin, globalMax) : 50;
                    const pctMax = globalMax > globalMin ? salaryBar(role.salaryRange.max, globalMin, globalMax) : 50;
                    return (
                      <td key={role.id} className="px-4 py-3 border-l border-border/30">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>R$ {role.salaryRange.min.toLocaleString('pt-BR')}</span>
                            <DiffBadge current={role.salaryRange.min} prev={prev?.salaryRange.min} type="salary" />
                            <span className="text-muted-foreground/50">—</span>
                            <span className="font-semibold text-foreground">R$ {role.salaryRange.max.toLocaleString('pt-BR')}</span>
                            <DiffBadge current={role.salaryRange.max} prev={prev?.salaryRange.max} type="salary" />
                          </div>
                          {/* Visual bar */}
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                              style={{ left: `${pctMin}%`, width: `${Math.max(pctMax - pctMin, 4)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Colaboradores</span>
                  </td>
                  {selectedRoles.map(role => {
                    const count = empCountMap.get(role.codigocargo || '') || 0;
                    return (
                      <td key={role.id} className="px-4 py-3 border-l border-border/30">
                        <span className={cn(
                          'text-sm font-semibold',
                          count > 0 ? 'text-brand-600' : 'text-muted-foreground'
                        )}>
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">colaborador{count !== 1 ? 'es' : ''}</span>
                      </td>
                    );
                  })}
                </tr>

                {/* ── CONHECIMENTOS ── */}
                <SectionRow label="Conhecimentos Técnicos" colCount={selectedRoles.length} />

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Formação / Técnico</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                      <TextCell value={role.technicalKnowledge} prev={selectedRoles[i - 1]?.technicalKnowledge} />
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Hard Skills</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                      <TextCell value={role.hardSkills} prev={selectedRoles[i - 1]?.hardSkills} />
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Soft Skills</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                      <TextCell value={role.softSkills} prev={selectedRoles[i - 1]?.softSkills} />
                    </td>
                  ))}
                </tr>

                {/* ── ENTREGAS ── */}
                <SectionRow label="Responsabilidades e Entregas" colCount={selectedRoles.length} />

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Descrição</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                      <TextCell value={role.description} prev={selectedRoles[i - 1]?.description} />
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Principais Entregas</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                      <TextCell value={role.keyDeliverables} prev={selectedRoles[i - 1]?.keyDeliverables} />
                    </td>
                  ))}
                </tr>

                {/* ── ROADMAP ── */}
                <SectionRow label="Roadmap e Skills" colCount={selectedRoles.length} />

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Tags</td>
                  {selectedRoles.map((role, i) => (
                    <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                      <TagsCell tags={role.tags} prev={selectedRoles[i - 1]?.tags} />
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-muted-foreground sticky left-0 bg-card border-r border-border align-top pt-4">Skills Requeridas</td>
                  {selectedRoles.map((role, i) => {
                    const prev = selectedRoles[i - 1];
                    const prevSet = new Set(prev?.requiredSkillIds || []);
                    const skillNames = role.requiredSkillIds.map(id => skillMap.get(id) || id);
                    const prevSkillNames = (prev?.requiredSkillIds || []).map(id => skillMap.get(id) || id);
                    return (
                      <td key={role.id} className="px-4 py-3 border-l border-border/30 align-top">
                        {skillNames.length === 0 ? (
                          <span className="text-xs text-muted-foreground/40 italic">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {skillNames.map((name, idx) => {
                              const isNew = prev && !prevSkillNames.includes(name);
                              return (
                                <span
                                  key={idx}
                                  className={cn(
                                    'text-xs px-2 py-0.5 rounded-full border',
                                    isNew
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-secondary text-foreground border-border'
                                  )}
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              Valor diferente do nível anterior
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-300" />
              Item novo em relação ao anterior
            </span>
            <span className="flex items-center gap-1.5">
              <ChevronUp className="w-3 h-3 text-emerald-500" />
              Salário maior que o anterior
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
