import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { f as sanitizeInvoice, n as authMiddleware, p as sanitizeSettings } from "./model-BdJos57e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-B24IDk2r.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function parsePayload(payload) {
	try {
		return sanitizeInvoice(JSON.parse(payload));
	} catch {
		return null;
	}
}
var listInvoices_createServerFn_handler = createServerRpc({
	id: "6d3b6f6676049ee9ed6e31474ceb81ae1fb085c63766429853576f2af437a5d4",
	name: "listInvoices",
	filename: "src/lib/invoices/api.ts"
}, (opts) => listInvoices.__executeServer(opts));
var listInvoices = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listInvoices_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-CjTedOMX.mjs").then((n) => n.t).then((n) => n.t);
	const rows = await (await getSql())`
      select id, payload
      from invoices
      where user_id = ${context.userId}
      order by updated_at desc
    `;
	const items = [];
	for (const row of rows) {
		const invoice = parsePayload(row.payload);
		if (invoice) items.push(invoice);
	}
	return items;
});
var saveInvoiceFn_createServerFn_handler = createServerRpc({
	id: "dd524badfda48a3e7b1371fd11aa900206353fe74d3a21fe3d0103f534dd504b",
	name: "saveInvoiceFn",
	filename: "src/lib/invoices/api.ts"
}, (opts) => saveInvoiceFn.__executeServer(opts));
var saveInvoiceFn = createServerFn({ method: "POST" }).validator((input) => sanitizeInvoice(input)).middleware([authMiddleware]).handler(saveInvoiceFn_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-CjTedOMX.mjs").then((n) => n.t).then((n) => n.t);
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
	return { ok: true };
});
var deleteInvoiceFn_createServerFn_handler = createServerRpc({
	id: "9c6d9020759f0940e63282e7cbdc252bcda5cae8e0d2f0291a7f6aad4d1d20a3",
	name: "deleteInvoiceFn",
	filename: "src/lib/invoices/api.ts"
}, (opts) => deleteInvoiceFn.__executeServer(opts));
var deleteInvoiceFn = createServerFn({ method: "POST" }).validator((id) => {
	if (typeof id !== "string" || !/^[0-9a-f-]{16,80}$/i.test(id)) throw new Error("معرّف الفاتورة غير صالح");
	return id;
}).middleware([authMiddleware]).handler(deleteInvoiceFn_createServerFn_handler, async ({ context, data: id }) => {
	const { getSql } = await import("./db-CjTedOMX.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`delete from invoices where id = ${id} and user_id = ${context.userId}`;
	return { ok: true };
});
var importInvoicesFn_createServerFn_handler = createServerRpc({
	id: "03bb959ac51bd0b9168f5c4ac72df0109a81d3db32eef2c5d44ac41081882114",
	name: "importInvoicesFn",
	filename: "src/lib/invoices/api.ts"
}, (opts) => importInvoicesFn.__executeServer(opts));
var importInvoicesFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!Array.isArray(input)) throw new Error("ملف النسخة الاحتياطية غير صالح");
	if (input.length > 500) throw new Error("النسخة أكبر من الحد المسموح (500 فاتورة)");
	return input.map((row) => sanitizeInvoice(row));
}).middleware([authMiddleware]).handler(importInvoicesFn_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-CjTedOMX.mjs").then((n) => n.t).then((n) => n.t);
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
	return {
		ok: true,
		count: data.length
	};
});
var getSettingsFn_createServerFn_handler = createServerRpc({
	id: "02dcef808c45ce61daf71a3a57606f325c933ec3937cb41519be927c7b1f4800",
	name: "getSettingsFn",
	filename: "src/lib/invoices/api.ts"
}, (opts) => getSettingsFn.__executeServer(opts));
var getSettingsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSettingsFn_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-CjTedOMX.mjs").then((n) => n.t).then((n) => n.t);
	const rows = await (await getSql())`
      select payload from invoice_settings where user_id = ${context.userId}
    `;
	if (!rows[0]) return null;
	try {
		return sanitizeSettings(JSON.parse(rows[0].payload));
	} catch {
		return null;
	}
});
var saveSettingsFn_createServerFn_handler = createServerRpc({
	id: "2df6b35d473bd5843bda7f552b4a6dda38b9c854d2d9d4b9ccf04aaba65b295b",
	name: "saveSettingsFn",
	filename: "src/lib/invoices/api.ts"
}, (opts) => saveSettingsFn.__executeServer(opts));
var saveSettingsFn = createServerFn({ method: "POST" }).validator((input) => sanitizeSettings(input)).middleware([authMiddleware]).handler(saveSettingsFn_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-CjTedOMX.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const payload = JSON.stringify(data);
	await sql`
      insert into invoice_settings (user_id, payload, updated_at)
      values (${context.userId}, ${payload}, now())
      on conflict (user_id) do update set
        payload = excluded.payload,
        updated_at = now()
    `;
	return { ok: true };
});
//#endregion
export { deleteInvoiceFn_createServerFn_handler, getSettingsFn_createServerFn_handler, importInvoicesFn_createServerFn_handler, listInvoices_createServerFn_handler, saveInvoiceFn_createServerFn_handler, saveSettingsFn_createServerFn_handler };
