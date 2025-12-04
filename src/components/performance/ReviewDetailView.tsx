import { useState } from 'react';
import { ArrowLeft, Star, Calendar, User, CheckCircle, Clock, Save, Loader2, Download } from 'lucide-react';
import { PerformanceReview, ReviewResponse } from '@/hooks/usePerformanceReviews';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

interface ReviewDetailViewProps {
  review: PerformanceReview;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
}

export const ReviewDetailView = ({ review, onBack, onUpdate }: ReviewDetailViewProps) => {
  const [responses, setResponses] = useState<ReviewResponse[]>(review.responses || []);
  const [overallFeedback, setOverallFeedback] = useState(review.overallFeedback || '');
  const [isSaving, setIsSaving] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return { label: 'Concluído', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
      case 'PendingManager':
        return { label: 'Aguardando Gestor', className: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'PendingSelf':
        return { label: 'Aguardando Auto-avaliação', className: 'bg-brand-100 text-brand-700', icon: Clock };
      default:
        return { label: status, className: 'bg-secondary text-muted-foreground', icon: Clock };
    }
  };

  const handleResponseChange = (questionId: string, value: number | string, type: 'rating' | 'text') => {
    const existingIndex = responses.findIndex(r => r.questionId === questionId);
    const newResponse: ReviewResponse = {
      questionId,
      ...(type === 'rating' ? { rating: value as number } : { text: value as string }),
    };

    if (existingIndex >= 0) {
      const updated = [...responses];
      updated[existingIndex] = newResponse;
      setResponses(updated);
    } else {
      setResponses([...responses, newResponse]);
    }
  };

  const getResponse = (questionId: string) => {
    return responses.find(r => r.questionId === questionId);
  };

  const calculateProgress = () => {
    const totalQuestions = review.questions.length;
    const answeredQuestions = responses.filter(r => r.rating || r.text).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const calculateAverageScore = () => {
    const ratings = responses.filter(r => r.rating).map(r => r.rating!);
    if (ratings.length === 0) return null;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  const handleSave = async (newStatus?: PerformanceReview['status']) => {
    setIsSaving(true);
    try {
      await onUpdate(review.id, {
        responses,
        overallFeedback: overallFeedback || null,
        status: newStatus || review.status,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = () => {
    handleSave('Completed');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFillColor(79, 70, 229); // brand color
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Avaliação de Desempenho', margin, 28);

    // Employee info
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
    doc.text(`Status: ${statusBadge.label}`, margin + 60, yPos);
    
    if (averageScore) {
      doc.text(`Média: ${averageScore}/5`, margin + 130, yPos);
    }

    // Divider
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Questions and Responses
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Perguntas e Respostas', margin, yPos);

    yPos += 10;
    review.questions.forEach((q, index) => {
      const response = getResponse(q.id);
      
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Question number and text
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${index + 1}.`, margin, yPos);
      
      doc.setTextColor(0, 0, 0);
      const questionLines = doc.splitTextToSize(q.question, pageWidth - margin * 2 - 10);
      doc.text(questionLines, margin + 8, yPos);
      yPos += questionLines.length * 6 + 4;

      // Response
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      if (q.type === 'rating') {
        const rating = response?.rating || 0;
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        doc.text(`Resposta: ${stars} (${rating}/5)`, margin + 8, yPos);
      } else {
        const answerText = response?.text || 'Sem resposta';
        const answerLines = doc.splitTextToSize(`Resposta: ${answerText}`, pageWidth - margin * 2 - 10);
        doc.text(answerLines, margin + 8, yPos);
        yPos += (answerLines.length - 1) * 6;
      }
      yPos += 12;
    });

    // Overall Feedback
    if (overallFeedback) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Feedback Geral', margin, yPos);

      yPos += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const feedbackLines = doc.splitTextToSize(overallFeedback, pageWidth - margin * 2);
      doc.text(feedbackLines, margin, yPos);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
    }

    // Save PDF
    const fileName = `avaliacao_${review.employeeName?.replace(/\s+/g, '_') || 'colaborador'}_${review.date}.pdf`;
    doc.save(fileName);
  };

  const statusBadge = getStatusBadge(review.status);
  const StatusIcon = statusBadge.icon;
  const progress = calculateProgress();
  const averageScore = calculateAverageScore();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar às avaliações
      </button>

      {/* Header */}
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{review.employeeName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </span>
                <span className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                  statusBadge.className
                )}>
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {averageScore && (
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-foreground">{averageScore}</span>
                </div>
                <p className="text-xs text-muted-foreground">Média</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{progress}%</p>
              <p className="text-xs text-muted-foreground">Progresso</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <h3 className="text-lg font-semibold text-foreground mb-6">Perguntas da Avaliação</h3>

        <div className="space-y-6">
          {review.questions.map((q, index) => {
            const response = getResponse(q.id);
            return (
              <div
                key={q.id}
                className={cn(
                  "p-5 rounded-xl border transition-all",
                  response?.rating || response?.text
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-secondary/30 border-border"
                )}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                    response?.rating || response?.text
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-brand-100 text-brand-700"
                  )}>
                    {index + 1}
                  </div>
                  <p className="text-foreground font-medium pt-1">{q.question}</p>
                </div>

                {q.type === 'rating' ? (
                  <div className="flex items-center gap-3 pl-11">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleResponseChange(q.id, star, 'rating')}
                          className="p-1.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded"
                        >
                          <Star
                            className={cn(
                              "w-7 h-7 transition-colors",
                              (response?.rating || 0) >= star
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/40"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {response?.rating || 0}/5
                    </span>
                  </div>
                ) : (
                  <div className="pl-11">
                    <textarea
                      value={response?.text || ''}
                      onChange={(e) => handleResponseChange(q.id, e.target.value, 'text')}
                      placeholder="Digite sua resposta..."
                      className="w-full h-24 px-4 py-3 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="bg-card rounded-xl p-6 shadow-medium">
        <h3 className="text-lg font-semibold text-foreground mb-4">Feedback Geral</h3>
        <textarea
          value={overallFeedback}
          onChange={(e) => setOverallFeedback(e.target.value)}
          placeholder="Adicione comentários gerais sobre o desempenho do colaborador..."
          className="w-full h-32 px-4 py-3 bg-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {review.status === 'Completed' && (
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 h-11 px-5 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        )}
        
        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="flex items-center gap-2 h-11 px-5 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Rascunho
        </button>
        
        {review.status !== 'Completed' && (
          <button
            onClick={handleComplete}
            disabled={isSaving || progress < 100}
            className={cn(
              "flex items-center gap-2 h-11 px-6 rounded-lg font-semibold text-sm transition-all",
              progress >= 100
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Concluir Avaliação
          </button>
        )}
      </div>
    </div>
  );
};
