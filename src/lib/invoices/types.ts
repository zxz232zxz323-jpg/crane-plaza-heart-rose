export type InvoiceStatus = "draft" | "issued";
export type WordsBasis = "net" | "remaining";

export type LineItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  date: string;
  status: InvoiceStatus;
  title: string;
  currency: string;
  clientName: string;
  province: string;
  phone: string;
  companyName: string;
  notes: string;
  lines: LineItem[];
  previousBalance: number;
  cashPayment: number;
  wordsBasis: WordsBasis;
  amountWords: string;
  amountWordsManual: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanySettings = {
  signatureTitle: string;
  signatureName: string;
  website: string;
  email: string;
  address: string;
  phone: string;
  nextNumber: number;
};

export const DEFAULT_SETTINGS: CompanySettings = {
  signatureTitle: "المدير المفوض",
  signatureName: "مصطفى رزاق رسول",
  website: "https://almouj.online/",
  email: "info@almouj.online",
  address: "كربلاء - منطقة الروضتين",
  phone: "0785 8700 800",
  nextNumber: 1,
};
