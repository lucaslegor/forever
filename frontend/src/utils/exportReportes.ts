import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardStats, DeudorRow } from '../services/dashboard.service';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function saveWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

export async function exportReportesExcel(stats: DashboardStats, anio?: number, mes?: number): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const mesLabel = mes != null ? `${mes}/${anio ?? ''}` : 'Todo';

  const ws1 = wb.addWorksheet(`Recaudación ${mesLabel}`);
  ws1.addRow(['Disciplina', 'Género', 'Categoría', 'Subcategoría', 'Total recaudado', 'Cantidad pagos']);
  stats.recaudacionPorClasificacion.forEach((r) => {
    ws1.addRow([
      r.disciplinaNombre,
      r.generoNombre,
      r.categoriaNombre,
      r.subcategoriaNombre ?? '',
      r.totalRecaudado,
      r.cantidadPagos,
    ]);
  });

  const ws2 = wb.addWorksheet('Deportistas por disciplina');
  ws2.addRow(['Disciplina', 'Cantidad deportistas']);
  stats.deportistasPorDisciplina.forEach((d) => {
    ws2.addRow([d.disciplinaNombre, d.cantidad]);
  });

  const ws3 = wb.addWorksheet('Pagos por medio');
  ws3.addRow(['Medio de pago', 'Cantidad', 'Monto total']);
  stats.pagosPorMedio.forEach((p) => {
    ws3.addRow([p.medio, p.cantidad, p.montoTotal]);
  });

  await saveWorkbook(wb, `reportes_${mesLabel.replace(/\//g, '-')}.xlsx`);
}

export function exportReportesPDF(stats: DashboardStats, anio?: number, mes?: number): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const mesLabel = mes != null && anio != null ? `${mes}/${anio}` : 'Todo el período';

  doc.setFontSize(14);
  doc.text('Reporte de recaudación y estadísticas', 14, 15);
  doc.setFontSize(10);
  doc.text(`Período: ${mesLabel}`, 14, 22);

  const recaudacionHeaders = [['Disciplina', 'Género', 'Categoría', 'Subcategoría', 'Total', 'Cant.']];
  const recaudacionBody = stats.recaudacionPorClasificacion.map((r) => [
    r.disciplinaNombre,
    r.generoNombre,
    r.categoriaNombre,
    (r.subcategoriaNombre ?? '') as string,
    formatMoney(r.totalRecaudado),
    String(r.cantidadPagos),
  ]);
  autoTable(doc, {
    head: recaudacionHeaders,
    body: recaudacionBody,
    startY: 28,
    styles: { fontSize: 8 },
  });

  let finalY = (doc as any).lastAutoTable?.finalY ?? 28;
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }
  doc.setFontSize(11);
  doc.text('Deportistas por disciplina', 14, finalY + 10);
  const depHeaders = [['Disciplina', 'Cantidad']];
  const depBody = stats.deportistasPorDisciplina.map((d) => [d.disciplinaNombre, String(d.cantidad)]);
  autoTable(doc, {
    head: depHeaders,
    body: depBody,
    startY: finalY + 14,
    styles: { fontSize: 9 },
  });

  finalY = (doc as any).lastAutoTable?.finalY ?? finalY;
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }
  doc.setFontSize(11);
  doc.text('Cuotas pendientes / vencidas', 14, finalY + 10);
  doc.setFontSize(10);
  doc.text(
    `Pendientes: ${stats.cuotasPendientesVencidas.pendientes} | Vencidas: ${stats.cuotasPendientesVencidas.vencidas} | Total: ${stats.cuotasPendientesVencidas.total}`,
    14,
    finalY + 18
  );

  doc.setFontSize(11);
  doc.text('Pagos por medio', 14, finalY + 26);
  const pagosHeaders = [['Medio', 'Cantidad', 'Monto total']];
  const pagosBody = stats.pagosPorMedio.map((p) => [p.medio, String(p.cantidad), formatMoney(p.montoTotal)]);
  autoTable(doc, {
    head: pagosHeaders,
    body: pagosBody,
    startY: finalY + 30,
    styles: { fontSize: 9 },
  });

  doc.save(`reportes_${mesLabel.replace(/\//g, '-')}.pdf`);
}

export async function exportDeudoresExcel(deudores: DeudorRow[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Deudores');

  ws.addRow([
    'Apellido',
    'Nombre',
    'DNI',
    'Email',
    'Disciplina',
    'Categoría',
    'Subcategoría',
    'Cuotas impagas',
    'Monto total adeudado',
  ]);

  deudores.forEach((d) => {
    ws.addRow([
      d.apellido,
      d.nombre,
      d.dni,
      d.email,
      d.disciplinaNombre,
      d.categoriaNombre,
      d.subcategoriaNombre ?? '',
      d.cuotasImpagas.map((c) => `Cuota ${c.nroCuota}/${c.anio}`).join(', '),
      d.montoTotalAdeudado,
    ]);
  });

  await saveWorkbook(wb, 'listado_deudores.xlsx');
}

export function exportDeudoresPDF(deudores: DeudorRow[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.text('Listado de deudores', 14, 15);
  doc.setFontSize(10);
  doc.text(`Total: ${deudores.length} deportistas con cuotas pendientes o vencidas`, 14, 22);

  const headers = [['Apellido', 'Nombre', 'DNI', 'Disciplina', 'Grupo familiar', 'Monto adeudado']];
  const body = deudores.map((d) => [
    d.apellido,
    d.nombre,
    d.dni,
    d.disciplinaNombre,
    d.grupoFamiliarNombre ?? '—',
    formatMoney(d.montoTotalAdeudado),
  ]);
  autoTable(doc, {
    head: headers,
    body,
    startY: 28,
    styles: { fontSize: 8 },
  });
  doc.save('listado_deudores.pdf');
}
