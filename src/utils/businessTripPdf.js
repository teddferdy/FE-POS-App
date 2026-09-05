import { buildTripRows } from "./businessTripDoc";

const MARGIN = 14;

const SECTION_KEYS = [
  "page.businessTrip.detail.sectionEmployee",
  "page.businessTrip.detail.sectionTrip",
  "page.businessTrip.detail.sectionRab",
  "page.businessTrip.detail.sectionApproval"
];

const isEmpty = (row) => Array.isArray(row) && row.every((c) => !c);

export const buildTripPdf = async (trip, t = (k) => k) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rows = buildTripRows(trip, t);

  const isSectionHeader = (row) =>
    !isEmpty(row) && row.length === 1 && SECTION_KEYS.includes(row[0]);

  let y = 15;

  const ensure = (dy) => {
    if (y + dy > pageHeight - 15) {
      doc.addPage();
      y = 15;
    }
  };

  const drawLabelValueRow = (row) => {
    ensure(6);
    let cursor = MARGIN;
    let isLabel = true;
    for (const cell of row) {
      if (!cell) continue;
      const text = String(cell);
      doc.setFont("helvetica", isLabel ? "bold" : "normal");
      doc.setFontSize(9);
      const width = doc.getTextWidth(text);
      if (cursor + width > pageWidth - MARGIN) {
        ensure(6);
        cursor = MARGIN;
      }
      doc.text(text, cursor, y);
      cursor += width + (isLabel ? 1.5 : 6);
      isLabel = !isLabel;
    }
    y += 6;
  };

  const drawSectionHeader = (label) => {
    ensure(8);
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(label, MARGIN, y);
    y += 6;
  };

  // Brand + title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(rows[0][0], MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(rows[1][0], MARGIN, y);
  doc.setTextColor(0, 0, 0);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(rows[3][0], pageWidth / 2, y, { align: "center" });
  y += 8;

  const rabIdx = rows.findIndex((r) => r[0] === t("page.businessTrip.detail.sectionRab"));
  const approvalIdx = rows.findIndex((r) => r[0] === t("page.businessTrip.detail.sectionApproval"));
  const totalsIdx = rows.findIndex(
    (r, idx) => idx > rabIdx && r[0] === t("page.businessTrip.rab.totalEstimate")
  );

  // Sections I & II (label/value rows)
  for (let i = 4; i < rabIdx; i += 1) {
    const row = rows[i];
    if (isEmpty(row)) {
      y += 4;
      continue;
    }
    if (isSectionHeader(row)) {
      drawSectionHeader(row[0]);
      continue;
    }
    drawLabelValueRow(row);
  }

  // Section III — RAB table
  const rabTotals = [];
  for (let i = totalsIdx; i < approvalIdx; i += 1) {
    if (!isEmpty(rows[i])) rabTotals.push(rows[i]);
  }
  ensure(10);
  autoTable(doc, {
    startY: y,
    head: [rows[rabIdx + 1]],
    body: rows.slice(rabIdx + 2, totalsIdx),
    foot: rabTotals,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: "bold" },
    margin: { left: MARGIN, right: MARGIN }
  });
  y = doc.lastAutoTable.finalY + 10;

  // Section IV — approval table
  drawSectionHeader(t("page.businessTrip.detail.sectionApproval"));
  autoTable(doc, {
    startY: y,
    head: [rows[approvalIdx + 1]],
    body: [rows[approvalIdx + 2] || []],
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 6 },
    headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { minCellHeight: 18 },
    margin: { left: MARGIN, right: MARGIN }
  });

  return doc;
};

export const downloadTripPdf = async (trip, t = (k) => k, builder = buildTripPdf) => {
  const doc = await builder(trip, t);
  doc.save(`${trip.tripNumber || "SPPD"}.pdf`);
};
