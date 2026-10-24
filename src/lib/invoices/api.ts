import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { sanitizeInvoice, sanitizeSettings } from "./model";
import type { CompanySettings, Invoice } from "./types";

type InvoiceRow = {
  id: string;
  payload: string;
};

function parsePayload(payload: string): Invoice | null {
  try {
    return sanitizeInvoice(JSON.parse(payload));
  } catch {
    return null;
  }
}

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<InvoiceRow>`
      select id, payload
      from invoices
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    const items: Invoice[] = [];
    for (const row of rows) {
      const invoice = parsePayload(row.payload);
      if (invoice) items.push(invoice);
    }
    return items;
  });

export const saveInvoiceFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => sanitizeInvoice(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const payload = JSON.stringify(data);
    await sql`
      insert into invoices (
        id, user_id, number, issued_on, status, client_name, company_name, payload, updated_at
      ) values (
        ${data.id},
        ${context.userId},
        ${data.number},
        ${data.date},
        ${data.status},
        ${data.clientName},
        ${data.companyName},
        ${payload},
        now()
      )
      on conflict (id) do update set
        number = excluded.number,
        issued_on = excluded.issued_on,
        status = excluded.status,
        client_name = excluded.client_name,
        company_name = excluded.company_name,
        payload = excluded.payload,
        updated_at = now()
      where invoices.user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteInvoiceFn = createServerFn({ method: "POST" })
  .validator((id: unknown) => {
    if (typeof id !== "string" || !/^[0-9a-f-]{16,80}$/i.test(id)) {
      throw new Error("معرّف الفاتورة غير صالح");
    }
    return id;
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from invoices where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const importInvoicesFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!Array.isArray(input)) throw new Error("ملف النسخة الاحتياطية غير صالح");
    if (input.length > 500) throw new Error("النسخة أكبر من الحد المسموح (500 فاتورة)");
    return input.map((row) => sanitizeInvoice(row));
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    for (const invoice of data) {
      const payload = JSON.stringify(invoice);
      await sql`
        insert into invoices (
          id, user_id, number, issued_on, status, client_name, company_name, payload, updated_at
        ) values (
          ${invoice.id},
          ${context.userId},
          ${invoice.number},
          ${invoice.date},
          ${invoice.status},
          ${invoice.clientName},
          ${invoice.companyName},
          ${payload},
          now()
        )
        on conflict (id) do update set
          number = excluded.number,
          issued_on = excluded.issued_on,
          status = excluded.status,
          client_name = excluded.client_name,
          company_name = excluded.company_name,
          payload = excluded.payload,
          updated_at = now()
        where invoices.user_id = ${context.userId}
      `;
    }
    return { ok: true as const, count: data.length };
  });

export const getSettingsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from invoice_settings where user_id = ${context.userId}
    `;
    if (!rows[0]) return null;
    try {
      return sanitizeSettings(JSON.parse(rows[0].payload)) satisfies CompanySettings;
    } catch {
      return null;
    }
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => sanitizeSettings(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const payload = JSON.stringify(data);
    await sql`
      insert into invoice_settings (user_id, payload, updated_at)
      values (${context.userId}, ${payload}, now())
      on conflict (user_id) do update set
        payload = excluded.payload,
        updated_at = now()
    `;
    return { ok: true as const };
  });
