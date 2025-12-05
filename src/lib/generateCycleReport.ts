import jsPDF from 'jspdf';
import { EvaluationCycle, EmployeeEvaluation } from '@/hooks/useEvaluationCycles';

export const generateCycleReport = (
  cycle: EvaluationCycle,
  evaluations: EmployeeEvaluation[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper function to add page break if needed
  const checkPageBreak = (neededSpace: number = 40) => {
    if (yPosition + neededSpace > 270) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Avaliações', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Cycle info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(cycle.title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  const statusText = cycle.status === 'active' ? 'Ativo' : 'Fechado';
  doc.text(`Status: ${statusText}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  
  if (cycle.description) {
    doc.text(cycle.description, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }

  const startDate = new Date(cycle.start_date).toLocaleDateString('pt-BR');
  const endDate = cycle.end_date ? new Date(cycle.end_date).toLocaleDateString('pt-BR') : 'Sem data limite';
  doc.text(`Período: ${startDate} - ${endDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary stats
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo', 20, yPosition);
  yPosition += 8;

  const pendingCount = evaluations.filter(e => e.status === 'pending').length;
  const selfDoneCount = evaluations.filter(e => e.status === 'self_assessment_done').length;
  const completedCount = evaluations.filter(e => e.status === 'completed').length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de colaboradores: ${evaluations.length}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Aguardando autoavaliação: ${pendingCount}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Aguardando gestor: ${selfDoneCount}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Concluídas: ${completedCount}`, 20, yPosition);
  yPosition += 15;

  // Individual evaluations
  const completedEvaluations = evaluations.filter(e => e.status === 'completed');

  if (completedEvaluations.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Avaliações Concluídas', 20, yPosition);
    yPosition += 10;

    completedEvaluations.forEach((evaluation, evalIndex) => {
      checkPageBreak(60);

      const employeeName = evaluation.employee?.nome || evaluation.employee?.name || 'Colaborador';
      
      // Employee header
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${evalIndex + 1}. ${employeeName}`, 20, yPosition);
      yPosition += 10;

      // Questions and responses
      evaluation.questions.forEach((q, qIndex) => {
        checkPageBreak(35);

        const selfResponse = evaluation.self_assessment_responses?.find(r => r.questionId === q.id);
        const managerResponse = evaluation.manager_evaluation_responses?.find(r => r.questionId === q.id);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${qIndex + 1}. ${q.question}`, 20, yPosition, { maxWidth: pageWidth - 40 });
        
        const questionLines = doc.splitTextToSize(q.question, pageWidth - 40);
        yPosition += questionLines.length * 5 + 2;

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Categoria: ${q.category}`, 20, yPosition);
        yPosition += 6;

        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        // Self assessment
        let selfText = 'Autoavaliação: ';
        if (selfResponse?.rating) {
          selfText += `Nota ${selfResponse.rating}/5`;
        }
        if (selfResponse?.response) {
          selfText += selfResponse.rating ? ' - ' : '';
          selfText += selfResponse.response;
        }
        if (!selfResponse?.rating && !selfResponse?.response) {
          selfText += 'Não respondido';
        }
        
        const selfLines = doc.splitTextToSize(selfText, pageWidth - 40);
        selfLines.forEach((line: string) => {
          checkPageBreak(10);
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 2;

        // Manager evaluation
        let managerText = 'Avaliação do Gestor: ';
        if (managerResponse?.rating) {
          managerText += `Nota ${managerResponse.rating}/5`;
        }
        if (managerResponse?.response) {
          managerText += managerResponse.rating ? ' - ' : '';
          managerText += managerResponse.response;
        }
        if (!managerResponse?.rating && !managerResponse?.response) {
          managerText += 'Não avaliado';
        }

        const managerLines = doc.splitTextToSize(managerText, pageWidth - 40);
        managerLines.forEach((line: string) => {
          checkPageBreak(10);
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 8;
      });

      // Manager feedback
      if (evaluation.manager_feedback) {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Feedback do Gestor:', 20, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        const feedbackLines = doc.splitTextToSize(evaluation.manager_feedback, pageWidth - 40);
        feedbackLines.forEach((line: string) => {
          checkPageBreak(8);
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
      }

      yPosition += 10;
    });
  }

  // Footer with generation date
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
  }

  // Download
  const fileName = `relatorio-${cycle.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
