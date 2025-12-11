import jsPDF from 'jspdf';
import { CareerRoadmap } from '@/types';

export const generateRoadmapPDF = (roadmap: CareerRoadmap) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Roadmap de Carreira', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${roadmap.sourceRoleTitle} → ${roadmap.targetRoleTitle}`, margin, 35);

  yPos = 55;

  // Employee and date info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  if (roadmap.employeeName) {
    doc.text(`Colaborador: ${roadmap.employeeName}`, margin, yPos);
    yPos += 6;
  }
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos);
  yPos += 15;

  const progress = roadmap.progress;

  // Progress Overview
  if (progress) {
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Progresso Geral', margin, yPos);
    yPos += 10;

    // Progress bar background
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
    
    // Progress bar fill
    doc.setFillColor(79, 70, 229);
    const progressWidth = (contentWidth * progress.progressPercentage) / 100;
    if (progressWidth > 0) {
      doc.roundedRect(margin, yPos, progressWidth, 8, 2, 2, 'F');
    }
    
    // Progress percentage
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${progress.progressPercentage}%`, margin + contentWidth + 5, yPos + 6);
    yPos += 18;

    // Summary
    if (progress.summary) {
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(progress.summary, contentWidth);
      doc.text(summaryLines, margin, yPos);
      yPos += summaryLines.length * 5 + 10;
    }

    // Stats boxes
    const boxWidth = (contentWidth - 15) / 4;
    const stats = [
      { label: 'Etapas Concluídas', value: progress.completedSteps?.length || 0 },
      { label: 'Conquistas', value: progress.achievements.length },
      { label: 'Áreas a Desenvolver', value: progress.gaps.length },
      { label: 'Total de Etapas', value: roadmap.steps.length },
    ];

    addNewPageIfNeeded(30);
    
    stats.forEach((stat, index) => {
      const xPos = margin + index * (boxWidth + 5);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(xPos, yPos, boxWidth, 25, 2, 2, 'F');
      
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(String(stat.value), xPos + boxWidth / 2, yPos + 12, { align: 'center' });
      
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, xPos + boxWidth / 2, yPos + 20, { align: 'center' });
    });
    yPos += 35;
  }

  // Development Plan
  addNewPageIfNeeded(20);
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Plano de Desenvolvimento', margin, yPos);
  yPos += 12;

  roadmap.steps.forEach((step, index) => {
    addNewPageIfNeeded(40);
    
    const isCompleted = progress?.completedSteps?.includes(index);
    const isCurrent = progress?.currentStepIndex === index;

    // Step number circle
    if (isCompleted) {
      doc.setFillColor(79, 70, 229);
    } else if (isCurrent) {
      doc.setFillColor(199, 210, 254);
    } else {
      doc.setFillColor(229, 231, 235);
    }
    doc.circle(margin + 6, yPos + 3, 6, 'F');
    
    doc.setTextColor(isCompleted ? 255 : 79, isCompleted ? 255 : 70, isCompleted ? 255 : 229);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(isCompleted ? '✓' : String(index + 1), margin + 6, yPos + 5, { align: 'center' });

    // Step content
    const stepX = margin + 20;
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    let titleText = step.title;
    if (isCompleted) titleText += ' (Concluída)';
    if (isCurrent) titleText += ' (Em andamento)';
    doc.text(titleText, stepX, yPos + 4);

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Duração: ${step.estimatedDuration}`, stepX, yPos + 10);
    yPos += 14;

    // Description
    const descLines = doc.splitTextToSize(step.description, contentWidth - 25);
    doc.text(descLines, stepX, yPos);
    yPos += descLines.length * 4 + 5;

    // Skills
    if (step.requiredSkills.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(79, 70, 229);
      const skillsText = `Habilidades: ${step.requiredSkills.join(', ')}`;
      const skillLines = doc.splitTextToSize(skillsText, contentWidth - 25);
      doc.text(skillLines, stepX, yPos);
      yPos += skillLines.length * 4 + 8;
    }
  });

  // Target role
  addNewPageIfNeeded(20);
  doc.setFillColor(79, 70, 229);
  doc.circle(margin + 6, yPos + 3, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('🎯', margin + 3, yPos + 5);
  
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(roadmap.targetRoleTitle, margin + 20, yPos + 4);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(progress?.progressPercentage === 100 ? 'Meta alcançada!' : 'Cargo alvo', margin + 20, yPos + 10);
  yPos += 20;

  // Achievements
  if (progress && progress.achievements.length > 0) {
    addNewPageIfNeeded(30);
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Conquistas', margin, yPos);
    yPos += 10;

    progress.achievements.forEach((achievement) => {
      addNewPageIfNeeded(20);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
      
      doc.setTextColor(22, 163, 74);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(achievement.title, margin + 5, yPos + 7);
      
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const achDescLines = doc.splitTextToSize(achievement.description, contentWidth - 10);
      doc.text(achDescLines[0] || '', margin + 5, yPos + 13);
      yPos += 22;
    });
    yPos += 5;
  }

  // Gaps
  if (progress && progress.gaps.length > 0) {
    addNewPageIfNeeded(30);
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Áreas de Desenvolvimento', margin, yPos);
    yPos += 10;

    progress.gaps.forEach((gap) => {
      addNewPageIfNeeded(25);
      doc.setFillColor(254, 252, 232);
      doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'F');
      
      doc.setTextColor(180, 83, 9);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(gap.skill, margin + 5, yPos + 7);
      
      // Priority badge
      const priorityText = gap.priority === 'high' ? 'Alta' : gap.priority === 'medium' ? 'Média' : 'Baixa';
      doc.setFontSize(7);
      doc.text(`Prioridade: ${priorityText}`, margin + contentWidth - 30, yPos + 7);
      
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const gapDescLines = doc.splitTextToSize(gap.recommendation, contentWidth - 10);
      doc.text(gapDescLines[0] || '', margin + 5, yPos + 15);
      yPos += 26;
    });
    yPos += 5;
  }

  // Next Actions
  if (progress && progress.nextActions.length > 0) {
    addNewPageIfNeeded(30);
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Próximos Passos Recomendados', margin, yPos);
    yPos += 10;

    progress.nextActions.forEach((action, index) => {
      addNewPageIfNeeded(15);
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
      
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}.`, margin + 5, yPos + 8);
      
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      const actionLines = doc.splitTextToSize(action, contentWidth - 20);
      doc.text(actionLines[0] || '', margin + 15, yPos + 8);
      yPos += 15;
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.text(`GFloow • Gestão de Talentos | Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  // Save the PDF
  const fileName = `roadmap-${roadmap.sourceRoleTitle}-${roadmap.targetRoleTitle}.pdf`.replace(/\s+/g, '-').toLowerCase();
  doc.save(fileName);
};
