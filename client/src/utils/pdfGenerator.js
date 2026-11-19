import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportReportToPDF(report, originalScript = '') {
  if (!report) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Primary palette
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [59, 130, 246]; // Blue 500
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 75, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('AutoQA Verification & Analysis Report', margin, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Automated Second-by-Second Video & Script Quality Assurance Audit', margin, 54);

  const analyzedAt = report.metadata?.analyzedAt
    ? new Date(report.metadata.analyzedAt).toLocaleString()
    : new Date().toLocaleString();

  doc.text(`Generated: ${analyzedAt}`, pageWidth - margin - 150, 46);

  let currentY = 95;

  // Video Metadata & Verdict Section
  const assessment = report.assessment || {};
  const status = (assessment.overallStatus || 'Under Review').toUpperCase();

  let statusBg = [245, 158, 11]; // Amber
  if (status.includes('APPROV')) statusBg = [16, 185, 129]; // Emerald
  if (status.includes('REJECT')) statusBg = [239, 68, 68]; // Rose

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 70, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 70, 4, 4, 'D');

  // Status Badge
  doc.setFillColor(...statusBg);
  doc.roundedRect(margin + 12, currentY + 12, 120, 22, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(status, margin + 20, currentY + 27);

  // File title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  const videoName = report.metadata?.videoTitle || 'Uploaded Video';
  doc.text(`Video File: ${videoName}`, margin + 145, currentY + 26);

  // Metrics summary line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  const metricsLine = `Accuracy: ${assessment.overallAccuracyPercentage || 0}%  |  Script Adherence: ${assessment.scriptAdherencePercentage || 0}%  |  Audio: ${assessment.audioQualityScore || 0}/100  |  Visual: ${assessment.visualConsistencyScore || 0}/100  |  Total Issues: ${assessment.totalIssues || report.issues?.length || 0}`;
  doc.text(metricsLine, margin + 14, currentY + 54);

  currentY += 85;

  // Executive Summary Box
  if (assessment.executiveSummary) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text('Executive Summary', margin, currentY);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const splitSummary = doc.splitTextToSize(assessment.executiveSummary, pageWidth - margin * 2 - 16);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, splitSummary.length * 11 + 12, 3, 3, 'F');
    doc.text(splitSummary, margin + 8, currentY + 13);

    currentY += splitSummary.length * 11 + 22;
  }

  // Section: Second-by-Second Detected Issues Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text('Second-by-Second Video Discrepancies & Issues', margin, currentY);
  currentY += 10;

  const issuesRows = (report.issues || []).map((iss, idx) => [
    `${iss.startTimestamp || '00:00'} - ${iss.endTimestamp || '00:00'}`,
    iss.categoryLabel || iss.category || 'Issue',
    (iss.severity || 'warning').toUpperCase(),
    `${iss.description || iss.title || ''}\n\nExpected: ${iss.expectedContent || '-'}\nActual: ${iss.actualContent || '-'}\n\nCorrection: ${iss.suggestedCorrection || '-'}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Timestamp', 'Category', 'Severity', 'Description & Expected vs Actual Observation']],
    body: issuesRows,
    theme: 'striped',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 55 },
      3: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `AutoQA Report — Page ${data.pageNumber}`,
        pageWidth / 2 - 30,
        pageHeight - 20
      );
    },
  });

  // Section: Chronological Timeline Breakdown
  if (Array.isArray(report.timelineSections) && report.timelineSections.length > 0) {
    doc.addPage();
    currentY = 40;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textDark);
    doc.text('Chronological Timeline Breakdown', margin, currentY);
    currentY += 10;

    const timelineRows = report.timelineSections.map((sec) => [
      sec.timeRange || `${sec.startSeconds}s - ${sec.endSeconds}s`,
      sec.whatIsHappening || '-',
      sec.scriptExpectation || '-',
      (sec.status || 'follows').toUpperCase(),
      (sec.detectedErrors || []).join('\n') || 'None',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Time Window', 'What Is Happening in Video', 'Script Expectation', 'Status', 'Errors Flagged']],
      body: timelineRows,
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 65, fontStyle: 'bold' },
        1: { cellWidth: 130 },
        2: { cellWidth: 130 },
        3: { cellWidth: 55 },
        4: { cellWidth: 'auto' },
      },
      didDrawPage: (data) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `AutoQA Report — Page ${data.pageNumber}`,
          pageWidth / 2 - 30,
          pageHeight - 20
        );
      },
    });
  }

  // Section: Actionable Recommendations
  if (Array.isArray(report.recommendations) && report.recommendations.length > 0) {
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 50;
    if (finalY > pageHeight - 120) {
      doc.addPage();
      currentY = 40;
    } else {
      currentY = finalY;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textDark);
    doc.text('Actionable Editorial & Production Recommendations', margin, currentY);
    currentY += 12;

    const recRows = report.recommendations.map((rec) => [
      rec.priority || 'Medium',
      rec.targetRole || 'Editor',
      rec.area || 'General',
      rec.recommendation || '',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Priority', 'Target Role', 'Area', 'Recommended Remediation']],
      body: recRows,
      theme: 'striped',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 80 },
        2: { cellWidth: 90 },
        3: { cellWidth: 'auto' },
      },
      didDrawPage: (data) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `AutoQA Report — Page ${data.pageNumber}`,
          pageWidth / 2 - 30,
          pageHeight - 20
        );
      },
    });
  }

  // Trigger download
  const safeFilename = (report.metadata?.videoTitle || 'AutoQA_Report')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  doc.save(`${safeFilename}_Verification_Report.pdf`);
}
