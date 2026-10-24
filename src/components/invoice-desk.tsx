import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Copy,
  FileDown,
  FileJson,
  FileSpreadsheet,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  deleteInvoiceFn,
  getSettingsFn,
  importInvoicesFn,
  listInvoices,
  saveInvoiceFn,
  saveSettingsFn,
} from "@/lib/invoices/api";
import {
  downloadBackup,
  downloadCsv,
  downloadExcel,
  downloadInvoiceJson,
  downloadInvoicePdf,
  invoiceLineRows,
  invoiceSummaryRow,
  parseBackup,
} from "@/lib/invoices/export-files";
import {
  bumpNextNumber,
  createInvoice,
  createLine,
  duplicateInvoice,
  fileStamp,
  formatDate,
  lineAmount,
  sanitizeInvoice,
  sanitizeSettings,
  totalsOf,
  validateForIssue,
} from "@/lib/invoices/model";
import { formatMoney } from "@/lib/invoices/money";
import {
  loadList,
  loadOpen,
  loadSettings,
  mergeLists,
  saveList,
  saveOpen,
  saveSettings as persistSettings,
  upsertLocal,
} from "@/lib/invoices/storage";
import type { CompanySettings, Invoice, LineItem } from "@/lib/invoices/types";
import { InvoiceSheet } from "./invoice-sheet";

type Section = "edit" | "list" | "settings";
type SaveState = "idle" | "dirty" | "saving" | "saved" | "local";

const inputClass =
  "min-h-11 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-brand";

export function InvoiceDesk() {
  const { user, isPending } = useCurrentUserState();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="no-print border-b border-line bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <img src="/invoice/logo.png" alt="" className="h-12 w-auto" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand-2">Al-Mawj Company</p>
            <h1 className="text-xl font-extrabold text-ink">دفتر فواتير شركة الموج</h1>
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <a href="/login" className="text-sm font-bold text-brand">
              تسجيل الدخول للمزامنة
            </a>
          </SignedOut>
        </div>
      </header>
      {isPending ? (
        <p className="mx-auto max-w-7xl px-4 py-8 text-base font-bold">جاري فتح الدفتر…</p>
      ) : (
        <Workspace key={user?.id ?? "local"} uid={user?.id ?? "local"} authed={Boolean(user)} />
      )}
    </div>
  );
}

function Workspace({ uid, authed }: { uid: string; authed: boolean }) {
  const [section, setSection] = useState<Section>("edit");
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const [ready, setReady] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(loadSettings(uid));
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [syncNote, setSyncNote] = useState("");
  const [problems, setProblems] = useState<{ field: string; message: string }[]>([]);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1123);
  const stageRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<Invoice | null>(null);
  const settingsRef = useRef(settings);
  invoiceRef.current = invoice;
  settingsRef.current = settings;

  useEffect(() => {
    let cancel = false;
    const guestList = uid === "local" ? [] : loadList("local");
    const guestOpen = uid === "local" ? null : loadOpen("local");
    const localList = mergeLists(loadList(uid), guestList).merged;
    const localSettings = loadSettings(uid);
    const open = loadOpen(uid) ?? guestOpen ?? createInvoice(localSettings);
    if (uid !== "local" && (guestList.length || guestOpen)) {
      saveList("local", []);
      saveOpen("local", null);
    }
    setSettings(localSettings);
    setInvoices(localList);
    setInvoice(open);
    saveOpen(uid, open);
    setReady(true);

    if (!authed) return;
    void (async () => {
      try {
        const remote = await listInvoices();
        if (cancel) return;
        const { merged, toUpload } = mergeLists(localList, remote);
        if (toUpload.length) await importInvoicesFn({ data: toUpload });
        const remoteSettings = await getSettingsFn();
        if (cancel) return;
        const nextSettings = remoteSettings ?? localSettings;
        saveList(uid, merged);
        persistSettings(uid, nextSettings);
        if (!remoteSettings) await saveSettingsFn({ data: nextSettings });
        setInvoices(merged);
        setSettings(nextSettings);
        setSyncNote("");
      } catch (error) {
        if (!cancel) setSyncNote(errorText(error));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [uid, authed]);

  useEffect(() => {
    if (!ready || !dirty) return;
    const handle = window.setTimeout(() => {
      void persist();
    }, 700);
    return () => window.clearTimeout(handle);
  }, [dirty, invoice?.updatedAt, ready]);

  useEffect(() => {
    const stage = stageRef.current;
    const sheet = visibleRef.current;
    if (!stage || !sheet) return;
    const apply = () => {
      const available = stage.clientWidth - 8;
      const next = Math.min(1, available / sheet.offsetWidth);
      setScale(next > 0.3 ? next : 0.3);
      setSheetHeight(sheet.offsetHeight);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [ready, section, pane, invoice?.lines.length]);

  async function persist() {
    const current = invoiceRef.current;
    if (!current) return;
    const stamp = current.updatedAt;
    const clean = sanitizeInvoice(current);
    const items = upsertLocal(uid, clean);
    setInvoices(items);
    setSaveState("saving");
    if (!authed) {
      setSaveState("local");
      if (invoiceRef.current?.updatedAt === stamp) setDirty(false);
      return;
    }
    try {
      await saveInvoiceFn({ data: clean });
      await saveSettingsFn({ data: settingsRef.current });
      setSaveState("saved");
      setSyncNote("");
      if (invoiceRef.current?.updatedAt === stamp) setDirty(false);
    } catch (error) {
      setSaveState("local");
      setSyncNote(errorText(error));
    }
  }

  function edit(patch: Partial<Invoice>) {
    setInvoice((prev) => {
      if (!prev) return prev;
      const next = sanitizeInvoice({ ...prev, ...patch, updatedAt: new Date().toISOString() });
      saveOpen(uid, next);
      return next;
    });
    setDirty(true);
    setSaveState("dirty");
    setProblems([]);
  }

  function editLine(id: string, patch: Partial<LineItem>) {
    if (!invoice) return;
    edit({
      lines: invoice.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    });
  }

  function commitSettings(next: CompanySettings) {
    const clean = sanitizeSettings(next);
    setSettings(clean);
    persistSettings(uid, clean);
    settingsRef.current = clean;
    setDirty(true);
    setSaveState("dirty");
  }

  function startNew() {
    const fresh = createInvoice(settingsRef.current);
    setInvoice(fresh);
    saveOpen(uid, fresh);
    setProblems([]);
    setDirty(true);
    setSection("edit");
    setPane("edit");
  }

  function openInvoice(item: Invoice) {
    setInvoice(item);
    saveOpen(uid, item);
    setProblems([]);
    setDirty(false);
    setSaveState("saved");
    setSection("edit");
    setPane("edit");
  }

  function copyInvoice() {
    if (!invoice) return;
    const copy = duplicateInvoice(invoice, settingsRef.current);
    const nextSettings = bumpNextNumber(settingsRef.current, copy.number);
    commitSettings(nextSettings);
    setInvoice(copy);
    saveOpen(uid, copy);
    setDirty(true);
    setSection("edit");
  }

  async function removeInvoice(item: Invoice) {
    const next = invoices.filter((row) => row.id !== item.id);
    setInvoices(next);
    saveList(uid, next);
    if (invoice?.id === item.id) startNew();
    setPendingDelete(null);
    if (authed) {
      try {
        await deleteInvoiceFn({ data: item.id });
      } catch (error) {
        setSyncNote(errorText(error));
      }
    }
  }

  function issue() {
    if (!invoice) return;
    const found = validateForIssue(invoice);
    setProblems(found);
    if (found.length) {
      setSection("edit");
      setPane("edit");
      return;
    }
    const nextSettings = bumpNextNumber(settingsRef.current, invoice.number);
    commitSettings(nextSettings);
    edit({ status: "issued" });
  }

  async function exportPdf() {
    const node = captureRef.current;
    if (!node || !invoice) return;
    try {
      await downloadInvoicePdf(node, invoice);
    } catch (error) {
      setSyncNote(errorText(error));
    }
  }

  async function onImport(file: File) {
    try {
      const parsed = parseBackup(await file.text());
      const incoming = parsed.invoices.map((row) => sanitizeInvoice(row));
      const { merged } = mergeLists(invoices, incoming);
      saveList(uid, merged);
      setInvoices(merged);
      if (parsed.settings) commitSettings(sanitizeSettings(parsed.settings));
      if (authed) await importInvoicesFn({ data: merged });
      setSyncNote(`تمت استعادة ${incoming.length} فاتورة.`);
      setSection("list");
    } catch (error) {
      setSyncNote(errorText(error));
    }
  }

  const totals = invoice ? totalsOf(invoice) : null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((item) => {
      const blob = `${item.number} ${item.clientName} ${item.companyName} ${item.date} ${formatDate(item.date)}`.toLowerCase();
      return blob.includes(q);
    });
  }, [invoices, query]);

  const problem = (field: string) => problems.find((item) => item.field === field)?.message;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <NavButton active={section === "edit"} onClick={() => setSection("edit")}>
          إنشاء فاتورة
        </NavButton>
        <NavButton active={section === "list"} onClick={() => setSection("list")}>
          الفواتير المحفوظة
        </NavButton>
        <NavButton active={section === "settings"} onClick={() => setSection("settings")}>
          الإعدادات
        </NavButton>
        <p className="ms-auto text-sm font-bold text-muted">{saveLabel(saveState, authed)}</p>
      </div>
      {syncNote ? (
        <p className="no-print mb-3 rounded-lg border border-line bg-card px-3 py-2 text-sm font-bold text-warn">
          {syncNote}
        </p>
      ) : null}

      {!ready || !invoice || !totals ? (
        <p className="py-8 font-bold">جاري تحميل الفواتير…</p>
      ) : (
        <>
          {section === "edit" ? (
            <>
              <div className="no-print mb-3 flex gap-2 lg:hidden">
                <NavButton active={pane === "edit"} onClick={() => setPane("edit")}>
                  التعبئة
                </NavButton>
                <NavButton active={pane === "preview"} onClick={() => setPane("preview")}>
                  المعاينة
                </NavButton>
              </div>
              <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
                <section className={`no-print ${pane === "preview" ? "hidden lg:block" : "block"}`}>
                  <div className="rounded-lg border border-line bg-card p-4">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Btn tone="primary" onClick={() => void persist()}>
                        <Save className="size-4" /> حفظ مسودة
                      </Btn>
                      <Btn tone="good" onClick={issue}>
                        اعتماد الفاتورة
                      </Btn>
                      <Btn onClick={startNew}>فاتورة جديدة</Btn>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="العدد" error={problem("number")}>
                        <input
                          className={inputClass}
                          value={invoice.number}
                          onChange={(event) => edit({ number: event.target.value })}
                        />
                      </Field>
                      <Field label="التاريخ" error={problem("date")}>
                        <input
                          className={inputClass}
                          type="date"
                          value={invoice.date}
                          onChange={(event) => edit({ date: event.target.value })}
                        />
                      </Field>
                      <Field label="فاتورة">
                        <input
                          className={inputClass}
                          value={invoice.title}
                          onChange={(event) => edit({ title: event.target.value })}
                        />
                      </Field>
                      <Field label="العملة">
                        <input
                          className={inputClass}
                          value={invoice.currency}
                          onChange={(event) => edit({ currency: event.target.value })}
                        />
                      </Field>
                      <Field label="الاسم الثلاثي" error={problem("clientName")}>
                        <input
                          className={inputClass}
                          value={invoice.clientName}
                          onChange={(event) => edit({ clientName: event.target.value })}
                        />
                      </Field>
                      <Field label="المحافظة">
                        <input
                          className={inputClass}
                          value={invoice.province}
                          onChange={(event) => edit({ province: event.target.value })}
                        />
                      </Field>
                      <Field label="الهاتف">
                        <input
                          className={inputClass}
                          dir="ltr"
                          value={invoice.phone}
                          onChange={(event) => edit({ phone: event.target.value })}
                        />
                      </Field>
                      <Field label="اسم الشركة">
                        <input
                          className={inputClass}
                          value={invoice.companyName}
                          onChange={(event) => edit({ companyName: event.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="الملاحظات">
                      <textarea
                        className={`${inputClass} mt-3 min-h-20`}
                        value={invoice.notes}
                        onChange={(event) => edit({ notes: event.target.value })}
                      />
                    </Field>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h2 className="font-extrabold">التفاصيل</h2>
                        <Btn
                          onClick={() => edit({ lines: [...invoice.lines, createLine()] })}
                          disabled={invoice.lines.length >= 40}
                        >
                          <Plus className="size-4" /> سطر
                        </Btn>
                      </div>
                      {problem("lines") ? (
                        <p className="mb-2 text-xs font-bold text-danger">{problem("lines")}</p>
                      ) : null}
                      <div className="flex flex-col gap-3">
                        {invoice.lines.map((line, index) => (
                          <div key={line.id} className="rounded-lg border border-line p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-extrabold">ت {index + 1}</span>
                              <button
                                type="button"
                                className="text-sm font-bold text-danger"
                                onClick={() =>
                                  edit({
                                    lines:
                                      invoice.lines.length === 1
                                        ? [createLine()]
                                        : invoice.lines.filter((item) => item.id !== line.id),
                                  })
                                }
                              >
                                حذف السطر
                              </button>
                            </div>
                            <Field label="التفاصيل">
                              <input
                                className={inputClass}
                                value={line.description}
                                onChange={(event) => editLine(line.id, { description: event.target.value })}
                              />
                            </Field>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <Field label="الكمية">
                                <input
                                  className={inputClass}
                                  type="number"
                                  min={0}
                                  step="1"
                                  value={line.qty}
                                  onChange={(event) => editLine(line.id, { qty: Number(event.target.value) })}
                                />
                              </Field>
                              <Field label="السعر الإفرادي">
                                <input
                                  className={inputClass}
                                  type="number"
                                  min={0}
                                  step="0.001"
                                  value={line.unitPrice}
                                  onChange={(event) =>
                                    editLine(line.id, { unitPrice: Number(event.target.value) })
                                  }
                                />
                              </Field>
                              <Field label="المبلغ">
                                <input className={inputClass} readOnly value={formatMoney(lineAmount(line))} />
                              </Field>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Field label="رصيد سابق">
                        <input
                          className={inputClass}
                          type="number"
                          step="0.001"
                          value={invoice.previousBalance}
                          onChange={(event) => edit({ previousBalance: Number(event.target.value) })}
                        />
                      </Field>
                      <Field label="دفعة نقدية">
                        <input
                          className={inputClass}
                          type="number"
                          min={0}
                          step="0.001"
                          value={invoice.cashPayment}
                          onChange={(event) => edit({ cashPayment: Number(event.target.value) })}
                        />
                      </Field>
                      <Readout label="صافي الفاتورة" value={formatMoney(totals.net)} />
                      <Readout label="رصيد حالي" value={formatMoney(totals.current)} />
                      <Readout label="باقي للدفع" value={formatMoney(totals.due)} />
                    </div>
                    {totals.due < 0 ? (
                      <p className="mt-2 text-sm font-bold text-warn">
                        الدفعة النقدية أكبر من الرصيد الحالي. راجع المبلغ قبل الاعتماد.
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs leading-5 text-muted">
                      الصافي = مجموع الكمية × السعر. الرصيد الحالي = الرصيد السابق + الصافي. الباقي = الرصيد
                      الحالي − الدفعة. لا توجد خانات ضريبة أو خصم في النموذج الأصلي.
                    </p>
                    <div className="mt-3 grid gap-3">
                      <Field label="المبلغ كتابة يعتمد على">
                        <select
                          className={inputClass}
                          value={invoice.wordsBasis}
                          onChange={(event) =>
                            edit({
                              wordsBasis: event.target.value === "remaining" ? "remaining" : "net",
                              amountWordsManual: false,
                            })
                          }
                          disabled={invoice.amountWordsManual}
                        >
                          <option value="net">صافي الفاتورة</option>
                          <option value="remaining">باقي للدفع</option>
                        </select>
                      </Field>
                      <label className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={invoice.amountWordsManual}
                          onChange={(event) =>
                            edit({
                              amountWordsManual: event.target.checked,
                              amountWords: event.target.checked ? totals.words : "",
                            })
                          }
                        />
                        تعديل المبلغ كتابة يدوياً
                      </label>
                      <Field label="المبلغ كتابة">
                        <textarea
                          className={`${inputClass} min-h-20`}
                          readOnly={!invoice.amountWordsManual}
                          value={invoice.amountWordsManual ? invoice.amountWords : totals.words}
                          onChange={(event) => edit({ amountWords: event.target.value, amountWordsManual: true })}
                        />
                      </Field>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Btn onClick={() => window.print()}>
                        <Printer className="size-4" /> طباعة
                      </Btn>
                      <Btn onClick={() => void exportPdf()}>
                        <FileDown className="size-4" /> PDF
                      </Btn>
                      <Btn
                        onClick={() =>
                          void downloadExcel(`${fileStamp(invoice)}.xlsx`, [
                            { name: "الفاتورة", rows: [invoiceSummaryRow(invoice)] },
                            { name: "البنود", rows: invoiceLineRows(invoice) },
                          ])
                        }
                      >
                        <FileSpreadsheet className="size-4" /> Excel
                      </Btn>
                      <Btn
                        onClick={() => downloadCsv(`${fileStamp(invoice)}.csv`, [invoiceSummaryRow(invoice)])}
                      >
                        CSV
                      </Btn>
                      <Btn onClick={() => downloadInvoiceJson(invoice)}>
                        <FileJson className="size-4" /> JSON
                      </Btn>
                      <Btn onClick={copyInvoice}>
                        <Copy className="size-4" /> نسخة
                      </Btn>
                      <Btn tone="danger" onClick={() => setPendingDelete(invoice)}>
                        <Trash2 className="size-4" /> حذف
                      </Btn>
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      الحالة: {invoice.status === "issued" ? "صادرة" : "مسودة"}.{" "}
                      {invoice.status === "issued" ? (
                        <button type="button" className="font-bold text-brand" onClick={() => edit({ status: "draft" })}>
                          إرجاع إلى مسودة
                        </button>
                      ) : null}
                    </p>
                  </div>
                </section>
                <section className={pane === "edit" ? "hidden lg:block" : "block"}>
                  <div ref={stageRef} className="sheet-stage overflow-x-auto rounded-lg bg-brand/5 p-2">
                    <div className="sheet-zoom mx-auto" style={{ height: Math.ceil(sheetHeight * scale) }}>
                      <div
                        ref={visibleRef}
                        style={{ zoom: scale, width: "210mm" }}
                      >
                        <InvoiceSheet invoice={invoice} settings={settings} />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="capture-host no-print" aria-hidden="true">
                <div ref={captureRef}>
                  <InvoiceSheet invoice={invoice} settings={settings} />
                </div>
              </div>
            </>
          ) : null}

          {section === "list" ? (
            <section className="no-print rounded-lg border border-line bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-60 flex-1">
                  <Search className="pointer-events-none absolute start-3 top-3 size-4 text-muted" />
                  <input
                    className={`${inputClass} ps-9`}
                    placeholder="بحث بالعدد أو الاسم أو التاريخ"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <Btn onClick={startNew}>
                  <Plus className="size-4" /> فاتورة جديدة
                </Btn>
                <Btn onClick={() => downloadBackup(invoices, settings)}>
                  <FileJson className="size-4" /> نسخة احتياطية
                </Btn>
                <Btn onClick={() => importRef.current?.click()}>استعادة</Btn>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void onImport(file);
                  }}
                />
                <Btn
                  onClick={() =>
                    void downloadExcel(`فواتير-الموج.xlsx`, [
                      { name: "الفواتير", rows: invoices.map(invoiceSummaryRow) },
                    ])
                  }
                >
                  <FileSpreadsheet className="size-4" /> Excel
                </Btn>
                <Btn onClick={() => downloadCsv("فواتير-الموج.csv", invoices.map(invoiceSummaryRow))}>CSV</Btn>
              </div>
              {filtered.length === 0 ? (
                <p className="py-10 text-center font-bold text-muted">لا توجد فواتير مطابقة.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[40rem] text-sm">
                    <thead>
                      <tr className="border-b border-line text-muted">
                        <th className="px-2 py-2 text-start font-bold">العدد</th>
                        <th className="px-2 py-2 text-start font-bold">التاريخ</th>
                        <th className="px-2 py-2 text-start font-bold">الاسم</th>
                        <th className="px-2 py-2 text-start font-bold">الشركة</th>
                        <th className="px-2 py-2 text-start font-bold">الصافي</th>
                        <th className="px-2 py-2 text-start font-bold">الحالة</th>
                        <th className="px-2 py-2 text-start font-bold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const rowTotals = totalsOf(item);
                        return (
                          <tr key={item.id} className="border-b border-line">
                            <td className="px-2 py-3 font-extrabold">{item.number || "—"}</td>
                            <td className="px-2 py-3">{formatDate(item.date)}</td>
                            <td className="px-2 py-3">{item.clientName || "—"}</td>
                            <td className="px-2 py-3">{item.companyName || "—"}</td>
                            <td className="px-2 py-3" dir="ltr">
                              {formatMoney(rowTotals.net)}
                            </td>
                            <td className="px-2 py-3">
                              <span
                                className={
                                  item.status === "issued" ? "font-bold text-good" : "font-bold text-warn"
                                }
                              >
                                {item.status === "issued" ? "صادرة" : "مسودة"}
                              </span>
                            </td>
                            <td className="px-2 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button type="button" className="font-bold text-brand" onClick={() => openInvoice(item)}>
                                  فتح
                                </button>
                                <button
                                  type="button"
                                  className="font-bold text-ink"
                                  onClick={() => {
                                    openInvoice(item);
                                    const copy = duplicateInvoice(item, settingsRef.current);
                                    commitSettings(bumpNextNumber(settingsRef.current, copy.number));
                                    setInvoice(copy);
                                    saveOpen(uid, copy);
                                    setDirty(true);
                                  }}
                                >
                                  نسخ
                                </button>
                                <button
                                  type="button"
                                  className="font-bold text-danger"
                                  onClick={() => setPendingDelete(item)}
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : null}

          {section === "settings" ? (
            <section className="no-print mx-auto max-w-xl rounded-lg border border-line bg-card p-4">
              <h2 className="mb-1 text-lg font-extrabold">إعدادات النموذج</h2>
              <p className="mb-4 text-sm text-muted">
                أسماء الشركة والشعار ثابتة كما في الفاتورة الأصلية. يمكن تحديث التوقيع وبيانات التذييل ورقم
                الفاتورة التالي.
              </p>
              <div className="grid gap-3">
                <Field label="صفة الموقّع">
                  <input
                    className={inputClass}
                    value={settings.signatureTitle}
                    onChange={(event) => commitSettings({ ...settings, signatureTitle: event.target.value })}
                  />
                </Field>
                <Field label="اسم الموقّع">
                  <input
                    className={inputClass}
                    value={settings.signatureName}
                    onChange={(event) => commitSettings({ ...settings, signatureName: event.target.value })}
                  />
                </Field>
                <Field label="الموقع">
                  <input
                    className={inputClass}
                    dir="ltr"
                    value={settings.website}
                    onChange={(event) => commitSettings({ ...settings, website: event.target.value })}
                  />
                </Field>
                <Field label="البريد">
                  <input
                    className={inputClass}
                    dir="ltr"
                    value={settings.email}
                    onChange={(event) => commitSettings({ ...settings, email: event.target.value })}
                  />
                </Field>
                <Field label="العنوان">
                  <input
                    className={inputClass}
                    value={settings.address}
                    onChange={(event) => commitSettings({ ...settings, address: event.target.value })}
                  />
                </Field>
                <Field label="الهاتف في التذييل">
                  <input
                    className={inputClass}
                    dir="ltr"
                    value={settings.phone}
                    onChange={(event) => commitSettings({ ...settings, phone: event.target.value })}
                  />
                </Field>
                <Field label="العدد التالي للفاتورة الجديدة">
                  <input
                    className={inputClass}
                    type="number"
                    min={1}
                    value={settings.nextNumber}
                    onChange={(event) =>
                      commitSettings({ ...settings, nextNumber: Number(event.target.value) })
                    }
                  />
                </Field>
                <Btn tone="primary" onClick={() => void persist()}>
                  <Save className="size-4" /> حفظ الإعدادات
                </Btn>
              </div>
            </section>
          ) : null}
        </>
      )}

      {pendingDelete ? (
        <div className="no-print fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-card p-5">
            <h2 className="text-lg font-extrabold">حذف الفاتورة؟</h2>
            <p className="mt-2 text-sm text-muted">
              سيتم حذف الفاتورة {pendingDelete.number || "بدون عدد"}
              {pendingDelete.clientName ? ` — ${pendingDelete.clientName}` : ""}. لا يمكن التراجع إلا من نسخة
              احتياطية.
            </p>
            <div className="mt-4 flex gap-2">
              <Btn tone="danger" onClick={() => void removeInvoice(pendingDelete)}>
                حذف
              </Btn>
              <Btn onClick={() => setPendingDelete(null)}>إلغاء</Btn>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function saveLabel(state: SaveState, authed: boolean) {
  if (state === "saving") return "جاري الحفظ…";
  if (state === "dirty") return "تغييرات بانتظار الحفظ";
  if (state === "saved") return authed ? "تم الحفظ على الحساب" : "تم الحفظ في هذا المتصفح";
  if (state === "local") return authed ? "حُفظت محلياً وتعذرت المزامنة" : "محفوظة في هذا المتصفح";
  return authed ? "الحفظ التلقائي مفعّل" : "الحفظ على هذا المتصفح";
}

function errorText(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "تعذر إكمال العملية. النسخة المحلية ما زالت محفوظة في المتصفح.";
}

function NavButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-lg px-3 text-sm font-extrabold ${
        active ? "bg-brand text-on-brand" : "bg-card text-ink border border-line"
      }`}
    >
      {children}
    </button>
  );
}

function Btn({
  children,
  onClick,
  tone = "ghost",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "good" | "danger";
  disabled?: boolean;
}) {
  const tones = {
    primary: "bg-brand text-on-brand",
    ghost: "border border-line bg-card text-ink",
    good: "bg-good text-on-brand",
    danger: "border border-danger/30 bg-card text-danger",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-bold text-danger">{error}</span> : null}
    </label>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <div className={`${inputClass} flex items-center bg-paper font-extrabold`} dir="ltr">
        {value}
      </div>
    </div>
  );
}
