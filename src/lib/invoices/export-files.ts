import { formatDate, fileStamp, lineAmount, totalsOf } from "./model";
import { formatMoney, formatQty } from "./money";
import type { CompanySettings, Invoice } from "./types";

export type BackupFile = {
  version: 1;
  exportedAt: string;
  settings: CompanySettings;
  invoices: Invoice[];
};

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, mime: string) {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function invoiceSummaryRow(invoice: Invoice) {
  const totals = totalsOf(invoice);
  return {
    العدد: invoice.number,
    التاريخ: formatDate(invoice.date),
    الحالة: invoice.status === "issued" ? "صادرة" : "مسودة",
    فاتورة: invoice.title,
    العملة: invoice.currency,
    "الاسم الثلاثي": invoice.clientName,
    المحافظة: invoice.province,
    الهاتف: invoice.phone,
    "اسم الشركة": invoice.companyName,
    الملاحظات: invoice.notes,
    "صافي الفاتورة": totals.net,
    "رصيد سابق": invoice.previousBalance,
    "رصيد حالي": totals.current,
    "دفعة نقدية": invoice.cashPayment,
    "باقي للدفع": totals.due,
    "المبلغ كتابة": totals.words,
  };
}

export function invoiceLineRows(invoice: Invoice) {
  return invoice.lines.map((line, index) => ({
    العدد: invoice.number,
    ت: index + 1,
    التفاصيل: line.description,
    الكمية: line.qty,
    "السعر الإفرادي": line.unitPrice,
    المبلغ: lineAmount(line),
  }));
}

export function downloadInvoiceJson(invoice: Invoice) {
  downloadText(
    `${fileStamp(invoice)}.json`,
    JSON.stringify(invoice, null, 2),
    "application/json;charset=utf-8",
  );
}

export function downloadBackup(invoices: Invoice[], settings: CompanySettings) {
  const file: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    invoices,
  };
  const day = new Date().toISOString().slice(0, 10);
  downloadText(
    `نسخة-فواتير-الموج-${day}.json`,
    JSON.stringify(file, null, 2),
    "application/json;charset=utf-8",
  );
}

export function parseBackup(text: string): { invoices: Invoice[]; settings?: CompanySettings } {
  const data = JSON.parse(text) as unknown;
  if (Array.isArray(data)) return { invoices: data as Invoice[] };
  if (data && typeof data === "object" && Array.isArray((data as BackupFile).invoices)) {
    const file = data as BackupFile;
    return { invoices: file.invoices, settings: file.settings };
  }
  throw new Error("الملف ليس نسخة فواتير معروفة");
}

function toCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return "\uFEFF";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((key) => csvCell(row[key] ?? "")).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  downloadText(filename, toCsv(rows), "text/csv;charset=utf-8");
}

export async function downloadExcel(
  filename: string,
  sheets: { name: string; rows: Record<string, string | number>[] }[],
) {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const rows = sheet.rows.length > 0 ? sheet.rows : [{ بيان: "" }];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(book, worksheet, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(book, filename);
}

export async function downloadInvoicePdf(node: HTMLElement, invoice: Invoice) {
  const { domToJpeg } = await import("modern-screenshot");
  const { jsPDF } = await import("jspdf");
  const dataUrl = await domToJpeg(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    quality: 0.95,
  });
  const image = await loadImage(dataUrl);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const imgHeight = (image.height * pageWidth) / image.width;
  let left = imgHeight;
  let position = 0;
  pdf.addImage(dataUrl, "JPEG", 0, position, pageWidth, imgHeight);
  left -= pageHeight;
  while (left > 1) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(dataUrl, "JPEG", 0, position, pageWidth, imgHeight);
    left -= pageHeight;
  }
  pdf.save(`${fileStamp(invoice)}.pdf`);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذر إنشاء صورة الفاتورة"));
    image.src = src;
  });
}

export function moneyLabel(invoice: Invoice, kind: "net" | "current" | "due" | "previous" | "cash") {
  const totals = totalsOf(invoice);
  if (kind === "net") return formatMoney(totals.net);
  if (kind === "current") return formatMoney(totals.current);
  if (kind === "due") return formatMoney(totals.due);
  if (kind === "previous") return formatMoney(invoice.previousBalance);
  return formatMoney(invoice.cashPayment);
}

export function qtyLabel(qty: number) {
  return formatQty(qty);
}
