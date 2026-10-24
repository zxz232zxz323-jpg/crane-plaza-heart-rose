import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/model-BdJos57e.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-IWHfIGH2.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-DdgltBwT.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var ONES = [
	"صفر",
	"واحد",
	"اثنان",
	"ثلاثة",
	"أربعة",
	"خمسة",
	"ستة",
	"سبعة",
	"ثمانية",
	"تسعة",
	"عشرة",
	"أحد عشر",
	"اثنا عشر",
	"ثلاثة عشر",
	"أربعة عشر",
	"خمسة عشر",
	"ستة عشر",
	"سبعة عشر",
	"ثمانية عشر",
	"تسعة عشر"
];
var TENS = [
	"",
	"",
	"عشرون",
	"ثلاثون",
	"أربعون",
	"خمسون",
	"ستون",
	"سبعون",
	"ثمانون",
	"تسعون"
];
var HUNDREDS = [
	"",
	"مائة",
	"مائتان",
	"ثلاثمائة",
	"أربعمائة",
	"خمسمائة",
	"ستمائة",
	"سبعمائة",
	"ثمانمائة",
	"تسعمائة"
];
function twoDigits(n) {
	if (n < 20) return ONES[n] ?? "";
	const tens = Math.floor(n / 10);
	const ones = n % 10;
	if (ones === 0) return TENS[tens] ?? "";
	return `${ONES[ones]} و${TENS[tens]}`;
}
function threeDigits(n) {
	if (n < 100) return twoDigits(n);
	const hundreds = Math.floor(n / 100);
	const rest = n % 100;
	if (rest === 0) return HUNDREDS[hundreds] ?? "";
	return `${HUNDREDS[hundreds]} و${twoDigits(rest)}`;
}
function group(n, forms) {
	if (n === 1) return forms[0];
	if (n === 2) return forms[1];
	if (n >= 3 && n <= 10) return `${threeDigits(n)} ${forms[2]}`;
	return `${threeDigits(n)} ${forms[3]}`;
}
function integerToWords(n) {
	if (n === 0) return "صفر";
	if (n < 0 || n > 999999999999) return String(n);
	const billions = Math.floor(n / 1e9);
	const millions = Math.floor(n % 1e9 / 1e6);
	const thousands = Math.floor(n % 1e6 / 1e3);
	const rest = n % 1e3;
	const parts = [];
	if (billions) parts.push(group(billions, [
		"مليار",
		"ملياران",
		"مليارات",
		"مليار"
	]));
	if (millions) parts.push(group(millions, [
		"مليون",
		"مليونان",
		"ملايين",
		"مليون"
	]));
	if (thousands) parts.push(group(thousands, [
		"ألف",
		"ألفان",
		"آلاف",
		"ألف"
	]));
	if (rest) parts.push(threeDigits(rest));
	return parts.join(" و");
}
function dinarPhrase(n) {
	if (n === 1) return "دينار عراقي واحد";
	if (n === 2) return "ديناران عراقيان";
	if (n >= 3 && n <= 10) return `${integerToWords(n)} دنانير عراقية`;
	return `${integerToWords(n)} دينار عراقي`;
}
function filsPhrase(n) {
	if (n === 1) return "فلس واحد";
	if (n === 2) return "فلسان";
	if (n >= 3 && n <= 10) return `${integerToWords(n)} فلوس`;
	return `${integerToWords(n)} فلساً`;
}
/** Formal amount line used in the «المبلغ كتابة» cell. */
function amountToArabic(amount) {
	if (!Number.isFinite(amount)) return "";
	const sign = amount < 0 ? "سالب " : "";
	let abs = Math.abs(amount);
	let dinar = Math.floor(abs + 1e-8);
	let fils = Math.round((abs - dinar) * 1e3);
	if (fils >= 1e3) {
		dinar += Math.floor(fils / 1e3);
		fils %= 1e3;
	}
	if (dinar === 0 && fils === 0) return "فقط صفر دينار عراقي لا غير";
	const parts = [];
	if (dinar > 0) parts.push(dinarPhrase(dinar));
	if (fils > 0) parts.push(filsPhrase(fils));
	return `فقط ${sign}${parts.join(" و")} لا غير`;
}
function roundMoney(n) {
	if (!Number.isFinite(n)) return 0;
	return Math.round(n * 1e3) / 1e3;
}
function formatMoney(n) {
	if (!Number.isFinite(n)) return "";
	const negative = n < 0;
	const [whole, frac] = roundMoney(Math.abs(n)).toFixed(3).split(".");
	const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	const trimmed = frac.replace(/0+$/, "");
	const body = trimmed ? `${grouped}.${trimmed}` : grouped;
	return negative ? `-${body}` : body;
}
function formatQty(n) {
	if (!Number.isFinite(n)) return "";
	const rounded = roundMoney(n);
	return String(rounded);
}
var DEFAULT_SETTINGS = {
	signatureTitle: "المدير المفوض",
	signatureName: "مصطفى رزاق رسول",
	website: "https://almouj.online/",
	email: "info@almouj.online",
	address: "كربلاء - منطقة الروضتين",
	phone: "0785 8700 800",
	nextNumber: 1
};
function todayISO(now = /* @__PURE__ */ new Date()) {
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${m}-${d}`;
}
function formatDate(iso) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return iso;
	return `${match[3]}/${match[2]}/${match[1]}`;
}
function lineAmount(line) {
	return roundMoney(Math.max(0, line.qty) * Math.max(0, line.unitPrice));
}
/**
* صافي الفاتورة = مجموع (الكمية × السعر الإفرادي)
* رصيد حالي = رصيد سابق + صافي الفاتورة
* باقي للدفع = رصيد حالي − الدفعة النقدية
*/
function totalsOf(invoice) {
	const net = roundMoney(invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0));
	const current = roundMoney(invoice.previousBalance + net);
	const due = roundMoney(current - invoice.cashPayment);
	const basis = invoice.wordsBasis === "remaining" ? due : net;
	return {
		net,
		current,
		due,
		words: invoice.amountWordsManual ? invoice.amountWords : basis === 0 ? "" : amountToArabic(basis)
	};
}
function createLine() {
	return {
		id: crypto.randomUUID(),
		description: "",
		qty: 1,
		unitPrice: 0
	};
}
function createInvoice(settings = DEFAULT_SETTINGS) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
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
		updatedAt: now
	};
}
function duplicateInvoice(source, settings) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		...source,
		id: crypto.randomUUID(),
		number: String(settings.nextNumber || 1),
		date: todayISO(),
		status: "draft",
		lines: source.lines.map((line) => ({
			...line,
			id: crypto.randomUUID()
		})),
		createdAt: now,
		updatedAt: now
	};
}
var MAX_LINES = 40;
function clip(value, max) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function num(value) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return 0;
	return roundMoney(Math.min(0xe8d4a51000, Math.max(-0xe8d4a51000, n)));
}
function basis(value) {
	return value === "remaining" ? "remaining" : "net";
}
function sanitizeInvoice(input) {
	if (!input || typeof input !== "object") throw new Error("بيانات الفاتورة غير صالحة");
	const raw = input;
	const id = typeof raw.id === "string" && /^[0-9a-f-]{16,80}$/i.test(raw.id) ? raw.id : crypto.randomUUID();
	const linesIn = Array.isArray(raw.lines) ? raw.lines.slice(0, MAX_LINES) : [];
	const lines = linesIn.length > 0 ? linesIn.map((line) => {
		const item = line ?? {};
		return {
			id: typeof item.id === "string" && item.id.length > 0 && item.id.length < 80 ? item.id : crypto.randomUUID(),
			description: clip(item.description, 800),
			qty: Math.max(0, num(item.qty)),
			unitPrice: Math.max(0, num(item.unitPrice))
		};
	}) : [createLine()];
	const now = (/* @__PURE__ */ new Date()).toISOString();
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
		updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt.slice(0, 40) : now
	};
}
function sanitizeSettings(input) {
	const raw = input ?? {};
	const next = Math.round(num(raw.nextNumber));
	return {
		signatureTitle: clip(raw.signatureTitle, 80) || DEFAULT_SETTINGS.signatureTitle,
		signatureName: clip(raw.signatureName, 80) || DEFAULT_SETTINGS.signatureName,
		website: clip(raw.website, 120) || DEFAULT_SETTINGS.website,
		email: clip(raw.email, 120) || DEFAULT_SETTINGS.email,
		address: clip(raw.address, 160) || DEFAULT_SETTINGS.address,
		phone: clip(raw.phone, 40) || DEFAULT_SETTINGS.phone,
		nextNumber: next > 0 ? next : 1
	};
}
function validateForIssue(invoice) {
	const problems = [];
	if (!invoice.number.trim()) problems.push({
		field: "number",
		message: "أدخل العدد."
	});
	if (!/^\d{4}-\d{2}-\d{2}$/.test(invoice.date)) problems.push({
		field: "date",
		message: "أدخل تاريخاً صحيحاً."
	});
	if (!invoice.clientName.trim()) problems.push({
		field: "clientName",
		message: "أدخل الاسم الثلاثي."
	});
	if (invoice.lines.filter((line) => line.description.trim() && line.qty > 0).length === 0) problems.push({
		field: "lines",
		message: "أضف خدمة واحدة على الأقل مع تفاصيل وكمية."
	});
	if (invoice.cashPayment < 0 || invoice.previousBalance < 0) problems.push({
		field: "money",
		message: "المبالغ لا يمكن أن تكون سالبة."
	});
	return problems;
}
function bumpNextNumber(settings, usedNumber) {
	const n = Number(usedNumber);
	if (Number.isInteger(n) && n >= settings.nextNumber) return {
		...settings,
		nextNumber: n + 1
	};
	return settings;
}
function fileStamp(invoice) {
	return `فاتورة-${(invoice.number || "بدون-عدد").replace(/[^\p{L}\p{N}_-]+/gu, "-")}-${invoice.date || "بدون-تاريخ"}`;
}
//#endregion
export { createLine as a, formatDate as c, lineAmount as d, sanitizeInvoice as f, validateForIssue as h, createInvoice as i, formatMoney as l, totalsOf as m, authMiddleware as n, duplicateInvoice as o, sanitizeSettings as p, bumpNextNumber as r, fileStamp as s, DEFAULT_SETTINGS as t, formatQty as u };
