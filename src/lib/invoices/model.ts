import { amountToArabic, roundMoney } from "./money";
import {
  DEFAULT_SETTINGS,
  type CompanySettings,
  type Invoice,
  type LineItem,
  type WordsBasis,
} from "./types";

export function todayISO(now = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function lineAmount(line: LineItem): number {
  return roundMoney(Math.max(0, line.qty) * Math.max(0, line.unitPrice));
}

export type InvoiceTotals = {
  net: number;
  current: number;
  due: number;
  words: string;
};

/**
 * صافي الفاتورة = مجموع (الكمية × السعر الإفرادي)
 * رصيد حالي = رصيد سابق + صافي الفاتورة
 * باقي للدفع = رصيد حالي − الدفعة النقدية
 */
export function totalsOf(invoice: Invoice): InvoiceTotals {
  const net = roundMoney(invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0));
  const current = roundMoney(invoice.previousBalance + net);
  const due = roundMoney(current - invoice.cashPayment);
  const basis = invoice.wordsBasis === "remaining" ? due : net;
  const words = invoice.amountWordsManual
    ? invoice.amountWords
    : basis === 0
      ? ""
      : amountToArabic(basis);
  return { net, current, due, words };
}

export function createLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    qty: 1,
    unitPrice: 0,
  };
}

export function createInvoice(settings: CompanySettings = DEFAULT_SETTINGS): Invoice {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    number: String(settings.nextNumber || 1),
    date: todayISO(),
    status: "draft",
    title: "",
    currency: "دينار",
    clientName: "",
    province: "بغداد",
    phone: "",
    companyName: "",
    notes: "",
    lines: [createLine()],
    previousBalance: 0,
    cashPayment: 0,
    wordsBasis: "net",
    amountWords: "",
    amountWordsManual: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateInvoice(source: Invoice, settings: CompanySettings): Invoice {
  const now = new Date().toISOString();
  return {
    ...source,
    id: crypto.randomUUID(),
    number: String(settings.nextNumber || 1),
    date: todayISO(),
    status: "draft",
    lines: source.lines.map((line) => ({ ...line, id: crypto.randomUUID() })),
    createdAt: now,
    updatedAt: now,
  };
}

const MAX_LINES = 40;

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return roundMoney(Math.min(1_000_000_000_000, Math.max(-1_000_000_000_000, n)));
}

function basis(value: unknown): WordsBasis {
  return value === "remaining" ? "remaining" : "net";
}

export function sanitizeInvoice(input: unknown): Invoice {
  if (!input || typeof input !== "object") throw new Error("بيانات الفاتورة غير صالحة");
  const raw = input as Partial<Invoice>;
  const id = typeof raw.id === "string" && /^[0-9a-f-]{16,80}$/i.test(raw.id) ? raw.id : crypto.randomUUID();
  const linesIn = Array.isArray(raw.lines) ? raw.lines.slice(0, MAX_LINES) : [];
  const lines: LineItem[] =
    linesIn.length > 0
      ? linesIn.map((line) => {
          const item = (line ?? {}) as Partial<LineItem>;
          const lineId =
            typeof item.id === "string" && item.id.length > 0 && item.id.length < 80
              ? item.id
              : crypto.randomUUID();
          return {
            id: lineId,
            description: clip(item.description, 800),
            qty: Math.max(0, num(item.qty)),
            unitPrice: Math.max(0, num(item.unitPrice)),
          };
        })
      : [createLine()];
  const now = new Date().toISOString();
  const status = raw.status === "issued" ? "issued" : "draft";
  return {
    id,
    number: clip(raw.number, 40),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.date ?? "")) ? String(raw.date) : "",
    status,
    title: clip(raw.title, 200),
    currency: clip(raw.currency, 30) || "دينار",
    clientName: clip(raw.clientName, 200),
    province: clip(raw.province, 80) || "بغداد",
    phone: clip(raw.phone, 40),
    companyName: clip(raw.companyName, 200),
    notes: clip(raw.notes, 800),
    lines,
    previousBalance: num(raw.previousBalance),
    cashPayment: Math.max(0, num(raw.cashPayment)),
    wordsBasis: basis(raw.wordsBasis),
    amountWords: clip(raw.amountWords, 400),
    amountWordsManual: Boolean(raw.amountWordsManual),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt.slice(0, 40) : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt.slice(0, 40) : now,
  };
}

export function sanitizeSettings(input: unknown): CompanySettings {
  const raw = (input ?? {}) as Partial<CompanySettings>;
  const next = Math.round(num(raw.nextNumber));
  return {
    signatureTitle: clip(raw.signatureTitle, 80) || DEFAULT_SETTINGS.signatureTitle,
    signatureName: clip(raw.signatureName, 80) || DEFAULT_SETTINGS.signatureName,
    website: clip(raw.website, 120) || DEFAULT_SETTINGS.website,
    email: clip(raw.email, 120) || DEFAULT_SETTINGS.email,
    address: clip(raw.address, 160) || DEFAULT_SETTINGS.address,
    phone: clip(raw.phone, 40) || DEFAULT_SETTINGS.phone,
    nextNumber: next > 0 ? next : 1,
  };
}

export type IssueProblem = { field: string; message: string };

export function validateForIssue(invoice: Invoice): IssueProblem[] {
  const problems: IssueProblem[] = [];
  if (!invoice.number.trim()) problems.push({ field: "number", message: "أدخل العدد." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoice.date)) {
    problems.push({ field: "date", message: "أدخل تاريخاً صحيحاً." });
  }
  if (!invoice.clientName.trim()) {
    problems.push({ field: "clientName", message: "أدخل الاسم الثلاثي." });
  }
  const usable = invoice.lines.filter((line) => line.description.trim() && line.qty > 0);
  if (usable.length === 0) {
    problems.push({ field: "lines", message: "أضف خدمة واحدة على الأقل مع تفاصيل وكمية." });
  }
  if (invoice.cashPayment < 0 || invoice.previousBalance < 0) {
    problems.push({ field: "money", message: "المبالغ لا يمكن أن تكون سالبة." });
  }
  return problems;
}

export function bumpNextNumber(settings: CompanySettings, usedNumber: string): CompanySettings {
  const n = Number(usedNumber);
  if (Number.isInteger(n) && n >= settings.nextNumber) {
    return { ...settings, nextNumber: n + 1 };
  }
  return settings;
}

export function fileStamp(invoice: Invoice): string {
  const num = (invoice.number || "بدون-عدد").replace(/[^\p{L}\p{N}_-]+/gu, "-");
  const date = invoice.date || "بدون-تاريخ";
  return `فاتورة-${num}-${date}`;
}
