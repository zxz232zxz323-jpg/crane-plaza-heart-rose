import { sanitizeInvoice, sanitizeSettings } from "./model";
import { DEFAULT_SETTINGS, type CompanySettings, type Invoice } from "./types";

const listKey = (uid: string) => `almawj.v1.list.${uid}`;
const settingsKey = (uid: string) => `almawj.v1.settings.${uid}`;
const openKey = (uid: string) => `almawj.v1.open.${uid}`;

function readJson(key: string): unknown {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadList(uid: string): Invoice[] {
  const parsed = readJson(listKey(uid));
  if (!Array.isArray(parsed)) return [];
  const items: Invoice[] = [];
  for (const row of parsed) {
    try {
      items.push(sanitizeInvoice(row));
    } catch {
      /* skip broken rows */
    }
  }
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveList(uid: string, items: Invoice[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(listKey(uid), JSON.stringify(items));
}

export function loadSettings(uid: string): CompanySettings {
  const parsed = readJson(settingsKey(uid));
  if (!parsed) return { ...DEFAULT_SETTINGS };
  try {
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(uid: string, settings: CompanySettings) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(settingsKey(uid), JSON.stringify(settings));
}

export function loadOpen(uid: string): Invoice | null {
  const parsed = readJson(openKey(uid));
  if (!parsed) return null;
  try {
    return sanitizeInvoice(parsed);
  } catch {
    return null;
  }
}

export function saveOpen(uid: string, invoice: Invoice | null) {
  if (typeof localStorage === "undefined") return;
  if (!invoice) localStorage.removeItem(openKey(uid));
  else localStorage.setItem(openKey(uid), JSON.stringify(invoice));
}

export function upsertLocal(uid: string, invoice: Invoice): Invoice[] {
  const items = loadList(uid).filter((item) => item.id !== invoice.id);
  items.unshift(invoice);
  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveList(uid, items);
  saveOpen(uid, invoice);
  return items;
}

export function mergeLists(local: Invoice[], remote: Invoice[]) {
  const map = new Map<string, Invoice>();
  for (const row of remote) map.set(row.id, row);
  const toUpload: Invoice[] = [];
  for (const row of local) {
    const other = map.get(row.id);
    if (!other || row.updatedAt > other.updatedAt) {
      map.set(row.id, row);
      toUpload.push(row);
    }
  }
  const merged = [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { merged, toUpload };
}
