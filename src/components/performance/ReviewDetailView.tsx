import { useState } from 'react';
import {
  ArrowLeft, Star, Calendar, User, CheckCircle, Clock, Save, Loader2,
  Download, Mail, TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3,
} from 'lucide-react';
import { PerformanceReview, ReviewResponse } from '@/hooks/usePerformanceReviews';
import { Employee } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReviewDetailViewProps {
  review: PerformanceReview;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
  employees?: Employee[];
}

export const ReviewDetailView = ({ review, onBack, onUpdate, employees = [] }: ReviewDetailViewProps) => {
  const [responses, setResponses] = useState<ReviewResponse[]>(review.responses || []);
  const [managerResponses, setManagerResponses] = useState<ReviewResponse[]>(review.managerResponses || []);
  const [overallFeedback, setOverallFeedback] = useState(review.overallFeedback || '');
  const [managerOverallFeedback, setManagerOverallFeedback] = useState(review.managerOverallFeedback || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Default tab based on status
  const defaultTab =
    review.status === 'PendingManager' ? 'gestor'
    : review.status === 'Completed' ? 'diagnostico'
    : 'autoavaliacao';

  // ── helpers ──────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':   return { label: 'Concluído',                  className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
      case 'PendingManager': return { label: 'Aguardando Gestor',       className: 'bg-amber-100 text-amber-700',    icon: Clock };
      case 'PendingSelf': return { label: 'Aguardando Auto-avaliação',  className: 'bg-brand-100 text-brand-700',    icon: Clock };
      default:            return { label: status,                        className: 'bg-secondary text-muted-foreground', icon: Clock };
    }
  };

  const getResponse        = (qid: string) => responses.find(r => r.questionId === qid);
  const getManagerResponse = (qid: string) => managerResponses.find(r => r.questionId === qid);

  const setResp = (questionId: string, value: number | string, type: 'rating' | 'text', setter: React.Dispatch<React.SetStateAction<ReviewResponse[]>>) => {
    setter(prev => {
      const idx = prev.findIndex(r => r.questionId === questionId);
      const entry: ReviewResponse = { questionId, ...(type === 'rating' ? { rating: value as number } : { text: value as string }) };
      if (idx >= 0) { const u = [...prev]; u[idx] = entry; return u; }
      return [...prev, entry];
    });
  };

  const avgRatings = (arr: ReviewResponse[]) => {
    const nums = arr.filter(r => r.rating).map(r => r.rating!);
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : null;
  };

  const empAvg = avgRatings(responses);
  const mgrAvg = avgRatings(managerResponses);
  const empAvgStr = empAvg ? empAvg.toFixed(1) : null;
  const mgrAvgStr = mgrAvg ? mgrAvg.toFixed(1) : null;

  // ── save / complete ───────────────────────────────────────────
  const handleSave = async (newStatus?: PerformanceReview['status']) => {
    setIsSaving(true);
    try {
      await onUpdate(review.id, {
        responses,
        managerResponses,
        overallFeedback: overallFeedback || null,
        managerOverallFeedback: managerOverallFeedback || null,
        status: newStatus || review.status,
      });
      if (newStatus) toast.success('Avaliação salva com sucesso!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await onUpdate(review.id, {
        responses,
        managerResponses,
        overallFeedback: overallFeedback || null,
        managerOverallFeedback: managerOverallFeedback || null,
        status: 'Completed',
      });

      // Notify HR (current logged-in admin)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          await supabase.functions.invoke('send-evaluation-invite', {
            body: {
              type: 'hr_completion',
              reviewType: 'standalone',
              employeeName: review.employeeName || 'Colaborador',
              employeeEmail: review.employeeName || '',      // used in email body
              managerName: user.email,
              managerEmail: user.email,                      // HR = current admin
              performanceReviewId: review.id,
              empAvg: empAvgStr,
              mgrAvg: mgrAvgStr,
              managerFeedback: managerOverallFeedback || '',
            },
          });
        }
      } catch (emailErr) {
        console.warn('Could not send HR notification:', emailErr);
      }

      toast.success('Avaliação concluída! Relatório enviado ao RH.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── invites ───────────────────────────────────────────────────
  const handleSendInvite = async () => {
    const employee = employees.find(e => e.id === review.employeeId);
    if (!employee?.email) { toast.error('Colaborador sem email cadastrado.'); return; }
    setIsSendingInvite(true);
    try {
      const { error } = await supabase.functions.invoke('send-evaluation-invite', {
        body: { type: 'self_assessment', reviewType: 'standalone', employeeName: review.employeeName || employee.name, employeeEmail: employee.email, performanceReviewId: review.id },
      });
      if (error) throw error;
      toast.success(`Convite enviado para ${employee.email}`);
    } catch { toast.error('Erro ao enviar convite.'); }
    finally { setIsSendingInvite(false); }
  };

  const handleNotifyManager = async () => {
    const employee = employees.find(e => e.id === review.employeeId);
    if (!employee) { toast.error('Colaborador não encontrado.'); return; }
    setIsSendingInvite(true);
    try {
      const { data: empData } = await supabase.from('nexus_employees').select('gestor_id').eq('id', review.employeeId!).maybeSingle();
      if (!empData?.gestor_id) { toast.warning('Colaborador sem gestor cadastrado.'); return; }
      const { data: manager } = await supabase.from('nexus_employees').select('nome, email').eq('id', empData.gestor_id).maybeSingle();
      if (!manager?.email) { toast.warning('Gestor sem e-mail cadastrado.'); return; }
      const { error } = await supabase.functions.invoke('send-evaluation-invite', {
        body: { type: 'manager_evaluation', reviewType: 'standalone', employeeName: review.employeeName || employee.name, employeeEmail: employee.email, managerName: manager.nome, managerEmail: manager.email, performanceReviewId: review.id },
      });
      if (error) throw error;
      toast.success(`Aviso enviado para ${manager.nome} (${manager.email})`);
    } catch { toast.error('Erro ao notificar gestor.'); }
    finally { setIsSendingInvite(false); }
  };

  // ── export PDF ────────────────────────────────────────────────
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Avaliação de Desempenho', margin, 28);
    yPos = 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(review.employeeName || 'Colaborador', margin, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Data: ${new Date(review.date).toLocaleDateString('pt-BR')}`, margin, yPos);
    if (empAvgStr) doc.text(`Colaborador: ${empAvgStr}/5`, margin + 70, yPos);
    if (mgrAvgStr) doc.text(`Gestor: ${mgrAvgStr}/5`, margin + 120, yPos);
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Autoavaliação do Colaborador', margin, yPos);
    yPos += 10;
    review.questions.forEach((q, idx) => {
      const resp = getResponse(q.id);
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${idx + 1}.`, margin, yPos);
      doc.setTextColor(0, 0, 0);
      const qLines = doc.splitTextToSize(q.question, pageWidth - margin * 2 - 10);
      doc.text(qLines, margin + 8, yPos);
      yPos += qLines.length * 6 + 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      if (q.type === 'rating') {
        const r = resp?.rating || 0;
        doc.text(`Colaborador: ${'★'.repeat(r)}${'☆'.repeat(5 - r)} (${r}/5)`, margin + 8, yPos);
        const mr = getManagerResponse(q.id)?.rating || 0;
        if (mr) doc.text(`Gestor: ${'★'.repeat(mr)}${'☆'.repeat(5 - mr)} (${mr}/5)`, margin + 80, yPos);
      } else {
        const lines = doc.splitTextToSize(`Resposta: ${resp?.text || 'Sem resposta'}`, pageWidth - margin * 2 - 10);
        doc.text(lines, margin + 8, yPos);
        yPos += (lines.length - 1) * 6;
      }
      yPos += 12;
    });
    if (managerOverallFeedback) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Feedback do Gestor', margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const fbLines = doc.splitTextToSize(managerOverallFeedback, pageWidth - margin * 2);
      doc.text(fbLines, margin, yPos);
    }
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
    }
    doc.save(`avaliacao_${review.employeeName?.replace(/\s+/g, '_') || 'colaborador'}_${review.date}.pdf`);
  };

  const statusBadge = getStatusBadge(review.status);
  const StatusIcon = statusBadge.icon;

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar às avaliações
      </button>

      {/* Header card */}
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{review.employeeName}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </span>
                <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', statusBadge.className)}>
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {empAvgStr && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xl font-bold text-foreground">{empAvgStr}</span>
                </div>
                <p className="text-xs text-muted-foreground">Colaborador</p>
              </div>
            )}
            {mgrAvgStr && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-500 fill-brand-500" />
                  <span className="text-xl font-bold text-foreground">{mgrAvgStr}</span>
                </div>
                <p className="text-xs text-muted-foreground">Gestor</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="autoavaliacao" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Autoavaliação
          </TabsTrigger>
          <TabsTrigger value="gestor" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Avaliação do Gestor
          </TabsTrigger>
          <TabsTrigger value="diagnostico" className="flex items-center gap-2" disabled={review.status !== 'Completed'}>
            <BarChart3 className="w-4 h-4" />
            Diagnóstico
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Autoavaliação (read-only) ── */}
        <TabsContent value="autoavaliacao" className="mt-4 space-y-4">
          {review.status === 'PendingSelf' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Aguardando autoavaliação do colaborador</p>
                <p className="text-xs text-amber-700 mt-0.5">O colaborador ainda não respondeu. Envie o convite abaixo caso necessário.</p>
              </div>
            </div>
          )}

          {review.questions.map((q, index) => {
            const resp = getResponse(q.id);
            const hasAnswer = resp?.rating || resp?.text;
            return (
              <div key={q.id} className={cn('p-5 rounded-xl border transition-all', hasAnswer ? 'bg-emerald-50/50 border-emerald-200' : 'bg-secondary/30 border-border')}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold', hasAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700')}>
                    {index + 1}
                  </div>
                  <p className="text-foreground font-medium pt-1">{q.question}</p>
                </div>

                {q.type === 'rating' ? (
                  <div className="flex items-center gap-3 pl-11">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn('w-6 h-6', (resp?.rating || 0) >= s ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30')} />
                    ))}
                    <span className="text-sm text-muted-foreground">{resp?.rating ? `${resp.rating}/5` : 'Sem resposta'}</span>
                  </div>
                ) : (
                  <p className="pl-11 text-sm text-muted-foreground italic">
                    {resp?.text ? `"${resp.text}"` : 'Sem resposta'}
                  </p>
                )}
              </div>
            );
          })}

          {overallFeedback && (
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Observações do Colaborador</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{overallFeedback}</p>
            </div>
          )}

          {review.status === 'PendingSelf' && (
            <div className="flex justify-end">
              <button onClick={handleSendInvite} disabled={isSendingInvite}
                className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50">
                {isSendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Enviar Convite
              </button>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Avaliação do Gestor ── */}
        <TabsContent value="gestor" className="mt-4 space-y-4">
          {review.status === 'PendingManager' && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-brand-800">Autoavaliação do colaborador recebida</p>
                <p className="text-xs text-brand-700 mt-0.5">Avalie cada critério abaixo e adicione seu feedback. As respostas do colaborador aparecem como referência.</p>
              </div>
            </div>
          )}

          {review.questions.map((q, index) => {
            const empResp = getResponse(q.id);
            const mgrResp = getManagerResponse(q.id);
            const isEditable = review.status === 'PendingManager';
            return (
              <div key={q.id} className="p-5 rounded-xl border bg-card border-border">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-foreground font-medium pt-1">{q.question}</p>
                </div>

                {/* Employee's response for reference */}
                {empResp && (q.type === 'rating' ? empResp.rating : empResp.text) && (
                  <div className="pl-11 mb-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                    <User className="w-3 h-3" />
                    <span className="font-medium">Colaborador:</span>
                    {q.type === 'rating' ? (
                      <span className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={cn('w-3.5 h-3.5', (empResp.rating||0) >= s ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30')} />)}
                        <span className="ml-1">{empResp.rating}/5</span>
                      </span>
                    ) : (
                      <span className="italic">"{empResp.text}"</span>
                    )}
                  </div>
                )}

                {/* Manager input */}
                {q.type === 'rating' ? (
                  <div className="pl-11 flex items-center gap-3">
                    <span className="text-xs font-medium text-foreground">Sua nota:</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button key={star}
                          onClick={() => isEditable && setResp(q.id, star, 'rating', setManagerResponses)}
                          disabled={!isEditable}
                          className={cn('p-1 focus:outline-none rounded transition-transform', isEditable ? 'hover:scale-110' : 'cursor-default')}>
                          <Star className={cn('w-6 h-6 transition-colors', (mgrResp?.rating||0) >= star ? 'text-brand-500 fill-brand-500' : 'text-muted-foreground/40')} />
                        </button>
                      ))}
                    </div>
                    {mgrResp?.rating && <span className="text-sm font-semibold text-brand-600">{mgrResp.rating}/5</span>}
                  </div>
                ) : (
                  <div className="pl-11">
                    <textarea
                      value={mgrResp?.text || ''}
                      onChange={(e) => isEditable && setResp(q.id, e.target.value, 'text', setManagerResponses)}
                      readOnly={!isEditable}
                      placeholder={isEditable ? 'Seu comentário como gestor...' : '(sem comentário)'}
                      className={cn('w-full h-20 px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none transition-all',
                        isEditable ? 'bg-background focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500' : 'bg-secondary/50 text-muted-foreground cursor-default'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Manager overall feedback */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Feedback Geral do Gestor
            </label>
            <textarea
              value={managerOverallFeedback}
              onChange={(e) => review.status === 'PendingManager' && setManagerOverallFeedback(e.target.value)}
              readOnly={review.status !== 'PendingManager'}
              placeholder={review.status === 'PendingManager' ? 'Adicione observações gerais sobre o desempenho do colaborador...' : '(sem feedback registrado)'}
              className={cn('w-full h-28 px-4 py-3 border border-border rounded-lg text-sm resize-none focus:outline-none transition-all',
                review.status === 'PendingManager' ? 'bg-background focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500' : 'bg-secondary/50 text-muted-foreground cursor-default'
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 flex-wrap">
            {review.status === 'PendingManager' && (
              <>
                <button onClick={handleNotifyManager} disabled={isSendingInvite}
                  className="flex items-center gap-2 h-10 px-4 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50">
                  {isSendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Reenviar ao Gestor
                </button>
                <button onClick={() => handleSave()} disabled={isSaving}
                  className="flex items-center gap-2 h-10 px-4 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Rascunho
                </button>
                <button onClick={handleComplete} disabled={isSaving}
                  className="flex items-center gap-2 h-10 px-5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Concluir Avaliação
                </button>
              </>
            )}
            {review.status === 'Completed' && (
              <button onClick={exportToPDF}
                className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 3: Diagnóstico (only Completed) ── */}
        <TabsContent value="diagnostico" className="mt-4 space-y-6">
          {review.status === 'Completed' && (() => {
            const diff = empAvg && mgrAvg ? Math.abs(empAvg - mgrAvg) : null;
            const alignment = diff === null ? null : diff <= 0.5 ? 'aligned' : diff <= 1.5 ? 'moderate' : 'divergent';
            const alignmentConfig = {
              aligned:   { label: 'Alta convergência',      className: 'bg-emerald-100 text-emerald-700', icon: TrendingUp,   desc: 'Colaborador e gestor têm percepções muito similares.' },
              moderate:  { label: 'Convergência moderada',  className: 'bg-amber-100 text-amber-700',    icon: Minus,        desc: 'Há diferença pequena de percepção — vale uma conversa.' },
              divergent: { label: 'Divergência significativa', className: 'bg-red-100 text-red-700',    icon: TrendingDown, desc: 'Percepções bem diferentes. Priorize um feedback 1:1.' },
            };
            const cfg = alignment ? alignmentConfig[alignment] : null;
            const AlignIcon = cfg?.icon;

            return (
              <>
                {/* Score cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card rounded-xl p-5 border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-2">Nota Colaborador</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-3xl font-bold text-foreground">{empAvgStr || '–'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">média /5</p>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-2">Nota Gestor</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-brand-500 fill-brand-500" />
                      <span className="text-3xl font-bold text-foreground">{mgrAvgStr || '–'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">média /5</p>
                  </div>
                  {cfg && AlignIcon && (
                    <div className={cn('rounded-xl p-5 border text-center', cfg.className.replace('text-', 'border-').replace('bg-', 'bg-'))}>
                      <p className="text-xs font-medium mb-2">Alinhamento</p>
                      <AlignIcon className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-sm font-semibold">{cfg.label}</p>
                    </div>
                  )}
                </div>

                {cfg && (
                  <div className={cn('rounded-xl p-4 border flex items-start gap-3', cfg.className)}>
                    {AlignIcon && <AlignIcon className="w-5 h-5 shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium">{cfg.desc}</p>
                  </div>
                )}

                {/* Per-question comparison */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-base font-semibold text-foreground mb-4">Comparativo por Critério</h3>
                  <div className="space-y-4">
                    {review.questions.filter(q => q.type === 'rating').map((q, idx) => {
                      const empR = getResponse(q.id)?.rating || 0;
                      const mgrR = getManagerResponse(q.id)?.rating || 0;
                      const delta = mgrR - empR;
                      return (
                        <div key={q.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground">{idx + 1}. {q.question}</span>
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', delta > 0 ? 'bg-emerald-100 text-emerald-700' : delta < 0 ? 'bg-red-100 text-red-700' : 'bg-secondary text-muted-foreground')}>
                              {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '='}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-24">
                              {[1,2,3,4,5].map(s => <Star key={s} className={cn('w-3.5 h-3.5', empR >= s ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />)}
                              <span className="text-xs text-muted-foreground ml-1">{empR}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">vs</span>
                            <div className="flex items-center gap-1 w-24">
                              {[1,2,3,4,5].map(s => <Star key={s} className={cn('w-3.5 h-3.5', mgrR >= s ? 'text-brand-500 fill-brand-500' : 'text-muted-foreground/20')} />)}
                              <span className="text-xs text-muted-foreground ml-1">{mgrR}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Colaborador</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-brand-500 fill-brand-500" /> Gestor</span>
                  </div>
                </div>

                {/* Feedback do gestor */}
                {managerOverallFeedback && (
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <h3 className="text-base font-semibold text-foreground mb-3">Feedback do Gestor</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{managerOverallFeedback}</p>
                  </div>
                )}

                {/* Text responses comparison */}
                {review.questions.filter(q => q.type === 'text').length > 0 && (
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Respostas Discursivas</h3>
                    <div className="space-y-5">
                      {review.questions.filter(q => q.type === 'text').map((q) => {
                        const empT = getResponse(q.id)?.text;
                        const mgrT = getManagerResponse(q.id)?.text;
                        return (
                          <div key={q.id} className="space-y-2">
                            <p className="text-sm font-medium text-foreground">{q.question}</p>
                            {empT && (
                              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                <p className="text-xs font-medium text-amber-700 mb-1">Colaborador</p>
                                <p className="text-sm text-foreground">{empT}</p>
                              </div>
                            )}
                            {mgrT && (
                              <div className="bg-brand-50 border border-brand-100 rounded-lg p-3">
                                <p className="text-xs font-medium text-brand-700 mb-1">Gestor</p>
                                <p className="text-sm text-foreground">{mgrT}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={exportToPDF}
                    className="flex items-center gap-2 h-10 px-4 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Exportar PDF completo
                  </button>
                </div>
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
