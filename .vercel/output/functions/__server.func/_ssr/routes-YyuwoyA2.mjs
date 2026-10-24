import { o as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as createLine, c as formatDate, d as lineAmount, f as sanitizeInvoice, h as validateForIssue, i as createInvoice, l as formatMoney, m as totalsOf, n as authMiddleware, o as duplicateInvoice, p as sanitizeSettings, r as bumpNextNumber, s as fileStamp, t as DEFAULT_SETTINGS, u as formatQty } from "./model-BdJos57e.mjs";
import { i as signOut, t as authClient } from "./client-IWHfIGH2.mjs";
import { a as hasGateSessionMarker } from "./server-Dr6k7KKN.mjs";
import { a as Printer, c as FileJson, i as Save, l as FileDown, n as Trash2, o as Plus, r as Search, s as FileSpreadsheet, u as Copy } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-YyuwoyA2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listInvoices = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6d3b6f6676049ee9ed6e31474ceb81ae1fb085c63766429853576f2af437a5d4"));
var saveInvoiceFn = createServerFn({ method: "POST" }).validator((input) => sanitizeInvoice(input)).middleware([authMiddleware]).handler(createSsrRpc("dd524badfda48a3e7b1371fd11aa900206353fe74d3a21fe3d0103f534dd504b"));
var deleteInvoiceFn = createServerFn({ method: "POST" }).validator((id) => {
	if (typeof id !== "string" || !/^[0-9a-f-]{16,80}$/i.test(id)) throw new Error("معرّف الفاتورة غير صالح");
	return id;
}).middleware([authMiddleware]).handler(createSsrRpc("9c6d9020759f0940e63282e7cbdc252bcda5cae8e0d2f0291a7f6aad4d1d20a3"));
var importInvoicesFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!Array.isArray(input)) throw new Error("ملف النسخة الاحتياطية غير صالح");
	if (input.length > 500) throw new Error("النسخة أكبر من الحد المسموح (500 فاتورة)");
	return input.map((row) => sanitizeInvoice(row));
}).middleware([authMiddleware]).handler(createSsrRpc("03bb959ac51bd0b9168f5c4ac72df0109a81d3db32eef2c5d44ac41081882114"));
var getSettingsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("02dcef808c45ce61daf71a3a57606f325c933ec3937cb41519be927c7b1f4800"));
var saveSettingsFn = createServerFn({ method: "POST" }).validator((input) => sanitizeSettings(input)).middleware([authMiddleware]).handler(createSsrRpc("2df6b35d473bd5843bda7f552b4a6dda38b9c854d2d9d4b9ccf04aaba65b295b"));
function downloadBlob(filename, blob) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
function downloadText(filename, text, mime) {
	downloadBlob(filename, new Blob([text], { type: mime }));
}
function csvCell(value) {
	const text = String(value ?? "");
	if (/[",\n]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
	return text;
}
function invoiceSummaryRow(invoice) {
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
		"المبلغ كتابة": totals.words
	};
}
function invoiceLineRows(invoice) {
	return invoice.lines.map((line, index) => ({
		العدد: invoice.number,
		ت: index + 1,
		التفاصيل: line.description,
		الكمية: line.qty,
		"السعر الإفرادي": line.unitPrice,
		المبلغ: lineAmount(line)
	}));
}
function downloadInvoiceJson(invoice) {
	downloadText(`${fileStamp(invoice)}.json`, JSON.stringify(invoice, null, 2), "application/json;charset=utf-8");
}
function downloadBackup(invoices, settings) {
	const file = {
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		settings,
		invoices
	};
	downloadText(`نسخة-فواتير-الموج-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, JSON.stringify(file, null, 2), "application/json;charset=utf-8");
}
function parseBackup(text) {
	const data = JSON.parse(text);
	if (Array.isArray(data)) return { invoices: data };
	if (data && typeof data === "object" && Array.isArray(data.invoices)) {
		const file = data;
		return {
			invoices: file.invoices,
			settings: file.settings
		};
	}
	throw new Error("الملف ليس نسخة فواتير معروفة");
}
function toCsv(rows) {
	if (rows.length === 0) return "﻿";
	const headers = Object.keys(rows[0]);
	return `\uFEFF${[headers.map(csvCell).join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key] ?? "")).join(","))].join("\n")}`;
}
function downloadCsv(filename, rows) {
	downloadText(filename, toCsv(rows), "text/csv;charset=utf-8");
}
async function downloadExcel(filename, sheets) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const book = XLSX.utils.book_new();
	for (const sheet of sheets) {
		const rows = sheet.rows.length > 0 ? sheet.rows : [{ بيان: "" }];
		const worksheet = XLSX.utils.json_to_sheet(rows);
		XLSX.utils.book_append_sheet(book, worksheet, sheet.name.slice(0, 31));
	}
	XLSX.writeFile(book, filename);
}
async function downloadInvoicePdf(node, invoice) {
	const { domToJpeg } = await import("../_libs/modern-screenshot.mjs").then((n) => n.t);
	const { jsPDF } = await import("../_libs/jspdf.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const dataUrl = await domToJpeg(node, {
		scale: 2,
		backgroundColor: "#ffffff",
		quality: .95
	});
	const image = await loadImage(dataUrl);
	const pdf = new jsPDF({
		orientation: "portrait",
		unit: "mm",
		format: "a4"
	});
	const pageWidth = 210;
	const pageHeight = 297;
	const imgHeight = image.height * pageWidth / image.width;
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
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(/* @__PURE__ */ new Error("تعذر إنشاء صورة الفاتورة"));
		image.src = src;
	});
}
var listKey = (uid) => `almawj.v1.list.${uid}`;
var settingsKey = (uid) => `almawj.v1.settings.${uid}`;
var openKey = (uid) => `almawj.v1.open.${uid}`;
function readJson(key) {
	try {
		if (typeof localStorage === "undefined") return null;
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function loadList(uid) {
	const parsed = readJson(listKey(uid));
	if (!Array.isArray(parsed)) return [];
	const items = [];
	for (const row of parsed) try {
		items.push(sanitizeInvoice(row));
	} catch {}
	return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
function saveList(uid, items) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(listKey(uid), JSON.stringify(items));
}
function loadSettings(uid) {
	const parsed = readJson(settingsKey(uid));
	if (!parsed) return { ...DEFAULT_SETTINGS };
	try {
		return sanitizeSettings(parsed);
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}
function saveSettings(uid, settings) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(settingsKey(uid), JSON.stringify(settings));
}
function loadOpen(uid) {
	const parsed = readJson(openKey(uid));
	if (!parsed) return null;
	try {
		return sanitizeInvoice(parsed);
	} catch {
		return null;
	}
}
function saveOpen(uid, invoice) {
	if (typeof localStorage === "undefined") return;
	if (!invoice) localStorage.removeItem(openKey(uid));
	else localStorage.setItem(openKey(uid), JSON.stringify(invoice));
}
function upsertLocal(uid, invoice) {
	const items = loadList(uid).filter((item) => item.id !== invoice.id);
	items.unshift(invoice);
	items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	saveList(uid, items);
	saveOpen(uid, invoice);
	return items;
}
function mergeLists(local, remote) {
	const map = /* @__PURE__ */ new Map();
	for (const row of remote) map.set(row.id, row);
	const toUpload = [];
	for (const row of local) {
		const other = map.get(row.id);
		if (!other || row.updatedAt > other.updatedAt) {
			map.set(row.id, row);
			toUpload.push(row);
		}
	}
	return {
		merged: [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		toUpload
	};
}
function IconPin() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
		})
	});
}
function IconPhone() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1l-2.22 2.2z"
		})
	});
}
function IconMail() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
		})
	});
}
function IconGlobe() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.2a15.6 15.6 0 0 0-1.2-5 8.1 8.1 0 0 1 4.4 5zM12 4c.8 1.1 1.8 3.2 2.2 7H9.8c.4-3.8 1.4-5.9 2.2-7zM4.1 11a8.1 8.1 0 0 1 4.4-5 15.6 15.6 0 0 0-1.2 5H4.1zM4.1 13h3.2a15.6 15.6 0 0 0 1.2 5 8.1 8.1 0 0 1-4.4-5zM12 20c-.8-1.1-1.8-3.2-2.2-7h4.4c-.4 3.8-1.4 5.9-2.2 7zm3.5-2a15.6 15.6 0 0 0 1.2-5h3.2a8.1 8.1 0 0 1-4.4 5z"
		})
	});
}
function InvoiceSheet({ invoice, settings }) {
	const totals = totalsOf(invoice);
	const tall = invoice.lines.length === 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "sheet",
		dir: "rtl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "topbar" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "brand",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "brand-en",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "co",
							children: "Al-Mawj Company"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sub",
							children: [
								"for Organizing International",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Exhibitions and Conferences"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						className: "logo",
						src: "/invoice/logo.png",
						alt: "شعار شركة الموج"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "brand-ar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "co",
							children: "شركة الموج"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sub",
							children: [
								"لإقامة المعارض",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"والمؤتمرات الدولية"
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "rule" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "meta",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "meta-en",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Number :" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "val",
							children: invoice.number
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date :" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "val",
							children: formatDate(invoice.date)
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "meta-ar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "العدد :" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "val",
							children: invoice.number
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "التاريخ :" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "val",
							children: formatDate(invoice.date)
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "party",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "party-top",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "box title-box",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "k",
								children: "فاتورة:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "v",
								children: invoice.title
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "box currency-box",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: invoice.currency || "دينار" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "العملة" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cell",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "الاسم الثلاثي :"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: invoice.clientName
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cell",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "المحافظة :"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: invoice.province
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cell",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "الهاتف"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									dir: "ltr",
									children: invoice.phone
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "row2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cell",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "k",
								children: "اسم الشركة :"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "v",
								children: invoice.companyName
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cell",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "k",
								children: "الملاحظات:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "v",
								children: invoice.notes
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dbl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "items-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "items",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("colgroup", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "c-t" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "c-price" })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "ت" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "التفاصيل" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "السعر الإفرادي" })
						] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: invoice.lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: tall ? "tall" : "compact",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "idx",
									children: index + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [line.description, line.qty > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "qty",
									children: [" × ", formatQty(line.qty)]
								}) : null] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "price",
									children: line.description || line.unitPrice ? formatMoney(line.unitPrice) : ""
								})
							]
						}, line.id)) })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "money",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "money-grid",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mcell prev",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "رصيد سابق:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "amt",
									children: formatMoney(invoice.previousBalance)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mcell net",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "صافي الفاتورة:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "amt",
									children: formatMoney(totals.net)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mcell cash",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "دفعة نقدية:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "amt",
									children: formatMoney(invoice.cashPayment)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mcell current",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "رصيد حالي:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "amt",
									children: formatMoney(totals.current)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mcell due",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "باقي للدفع:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "amt",
									children: formatMoney(totals.due)
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "words",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "k",
							children: "المبلغ كتابة:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "v",
							children: totals.words
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "after",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mark",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/invoice/logo.png",
						alt: ""
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"شركة الموج لإقامة",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"المعارض والمؤتمرات الدولية"
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sign",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: settings.signatureTitle }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: settings.signatureName })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "foot",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "contact",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "iconline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: settings.address }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sq green",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPin, {})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "iconline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								dir: "ltr",
								children: settings.phone
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sq green",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPhone, {})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "web",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "iconline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: settings.website,
								children: settings.website
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sq blue",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconGlobe, {})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "iconline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: settings.email }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sq blue",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMail, {})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "qrs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/invoice/qr-1.png",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/invoice/qr-2.png",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/invoice/qr-3.png",
								alt: ""
							})
						]
					})
				]
			})
		]
	});
}
var inputClass = "min-h-11 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-brand";
function InvoiceDesk() {
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "no-print border-b border-line bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/invoice/logo.png",
						alt: "",
						className: "h-12 w-auto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-brand-2",
							children: "Al-Mawj Company"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-extrabold text-ink",
							children: "دفتر فواتير شركة الموج"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/login",
						className: "text-sm font-bold text-brand",
						children: "تسجيل الدخول للمزامنة"
					}) })
				]
			})
		}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto max-w-7xl px-4 py-8 text-base font-bold",
			children: "جاري فتح الدفتر…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workspace, {
			uid: user?.id ?? "local",
			authed: Boolean(user)
		}, user?.id ?? "local")]
	});
}
function Workspace({ uid, authed }) {
	const [section, setSection] = (0, import_react.useState)("edit");
	const [pane, setPane] = (0, import_react.useState)("edit");
	const [ready, setReady] = (0, import_react.useState)(false);
	const [invoice, setInvoice] = (0, import_react.useState)(null);
	const [invoices, setInvoices] = (0, import_react.useState)([]);
	const [settings, setSettings] = (0, import_react.useState)(loadSettings(uid));
	const [dirty, setDirty] = (0, import_react.useState)(false);
	const [saveState, setSaveState] = (0, import_react.useState)("idle");
	const [syncNote, setSyncNote] = (0, import_react.useState)("");
	const [problems, setProblems] = (0, import_react.useState)([]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const [scale, setScale] = (0, import_react.useState)(1);
	const [sheetHeight, setSheetHeight] = (0, import_react.useState)(1123);
	const stageRef = (0, import_react.useRef)(null);
	const visibleRef = (0, import_react.useRef)(null);
	const captureRef = (0, import_react.useRef)(null);
	const importRef = (0, import_react.useRef)(null);
	const invoiceRef = (0, import_react.useRef)(null);
	const settingsRef = (0, import_react.useRef)(settings);
	invoiceRef.current = invoice;
	settingsRef.current = settings;
	(0, import_react.useEffect)(() => {
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
		(async () => {
			try {
				const remote = await listInvoices();
				if (cancel) return;
				const { merged, toUpload } = mergeLists(localList, remote);
				if (toUpload.length) await importInvoicesFn({ data: toUpload });
				const remoteSettings = await getSettingsFn();
				if (cancel) return;
				const nextSettings = remoteSettings ?? localSettings;
				saveList(uid, merged);
				saveSettings(uid, nextSettings);
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
	(0, import_react.useEffect)(() => {
		if (!ready || !dirty) return;
		const handle = window.setTimeout(() => {
			persist();
		}, 700);
		return () => window.clearTimeout(handle);
	}, [
		dirty,
		invoice?.updatedAt,
		ready
	]);
	(0, import_react.useEffect)(() => {
		const stage = stageRef.current;
		const sheet = visibleRef.current;
		if (!stage || !sheet) return;
		const apply = () => {
			const available = stage.clientWidth - 8;
			const next = Math.min(1, available / sheet.offsetWidth);
			setScale(next > .3 ? next : .3);
			setSheetHeight(sheet.offsetHeight);
		};
		apply();
		const observer = new ResizeObserver(apply);
		observer.observe(stage);
		observer.observe(sheet);
		return () => observer.disconnect();
	}, [
		ready,
		section,
		pane,
		invoice?.lines.length
	]);
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
	function edit(patch) {
		setInvoice((prev) => {
			if (!prev) return prev;
			const next = sanitizeInvoice({
				...prev,
				...patch,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			saveOpen(uid, next);
			return next;
		});
		setDirty(true);
		setSaveState("dirty");
		setProblems([]);
	}
	function editLine(id, patch) {
		if (!invoice) return;
		edit({ lines: invoice.lines.map((line) => line.id === id ? {
			...line,
			...patch
		} : line) });
	}
	function commitSettings(next) {
		const clean = sanitizeSettings(next);
		setSettings(clean);
		saveSettings(uid, clean);
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
	function openInvoice(item) {
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
		commitSettings(bumpNextNumber(settingsRef.current, copy.number));
		setInvoice(copy);
		saveOpen(uid, copy);
		setDirty(true);
		setSection("edit");
	}
	async function removeInvoice(item) {
		const next = invoices.filter((row) => row.id !== item.id);
		setInvoices(next);
		saveList(uid, next);
		if (invoice?.id === item.id) startNew();
		setPendingDelete(null);
		if (authed) try {
			await deleteInvoiceFn({ data: item.id });
		} catch (error) {
			setSyncNote(errorText(error));
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
		commitSettings(bumpNextNumber(settingsRef.current, invoice.number));
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
	async function onImport(file) {
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
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return invoices;
		return invoices.filter((item) => {
			return `${item.number} ${item.clientName} ${item.companyName} ${item.date} ${formatDate(item.date)}`.toLowerCase().includes(q);
		});
	}, [invoices, query]);
	const problem = (field) => problems.find((item) => item.field === field)?.message;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-3 py-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print mb-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
						active: section === "edit",
						onClick: () => setSection("edit"),
						children: "إنشاء فاتورة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
						active: section === "list",
						onClick: () => setSection("list"),
						children: "الفواتير المحفوظة"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
						active: section === "settings",
						onClick: () => setSection("settings"),
						children: "الإعدادات"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "ms-auto text-sm font-bold text-muted",
						children: saveLabel(saveState, authed)
					})
				]
			}),
			syncNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "no-print mb-3 rounded-lg border border-line bg-card px-3 py-2 text-sm font-bold text-warn",
				children: syncNote
			}) : null,
			!ready || !invoice || !totals ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 font-bold",
				children: "جاري تحميل الفواتير…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				section === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "no-print mb-3 flex gap-2 lg:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							active: pane === "edit",
							onClick: () => setPane("edit"),
							children: "التعبئة"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							active: pane === "preview",
							onClick: () => setPane("preview"),
							children: "المعاينة"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid items-start gap-4 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: `no-print ${pane === "preview" ? "hidden lg:block" : "block"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-line bg-card p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-4 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												tone: "primary",
												onClick: () => void persist(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), " حفظ مسودة"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
												tone: "good",
												onClick: issue,
												children: "اعتماد الفاتورة"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
												onClick: startNew,
												children: "فاتورة جديدة"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-3 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "العدد",
												error: problem("number"),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													value: invoice.number,
													onChange: (event) => edit({ number: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "التاريخ",
												error: problem("date"),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													type: "date",
													value: invoice.date,
													onChange: (event) => edit({ date: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "فاتورة",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													value: invoice.title,
													onChange: (event) => edit({ title: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "العملة",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													value: invoice.currency,
													onChange: (event) => edit({ currency: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "الاسم الثلاثي",
												error: problem("clientName"),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													value: invoice.clientName,
													onChange: (event) => edit({ clientName: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "المحافظة",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													value: invoice.province,
													onChange: (event) => edit({ province: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "الهاتف",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													dir: "ltr",
													value: invoice.phone,
													onChange: (event) => edit({ phone: event.target.value })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "اسم الشركة",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													value: invoice.companyName,
													onChange: (event) => edit({ companyName: event.target.value })
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "الملاحظات",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											className: `${inputClass} mt-3 min-h-20`,
											value: invoice.notes,
											onChange: (event) => edit({ notes: event.target.value })
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-2 flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
													className: "font-extrabold",
													children: "التفاصيل"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
													onClick: () => edit({ lines: [...invoice.lines, createLine()] }),
													disabled: invoice.lines.length >= 40,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " سطر"]
												})]
											}),
											problem("lines") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mb-2 text-xs font-bold text-danger",
												children: problem("lines")
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-col gap-3",
												children: invoice.lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg border border-line p-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "mb-2 flex items-center justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-sm font-extrabold",
																children: ["ت ", index + 1]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																className: "text-sm font-bold text-danger",
																onClick: () => edit({ lines: invoice.lines.length === 1 ? [createLine()] : invoice.lines.filter((item) => item.id !== line.id) }),
																children: "حذف السطر"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "التفاصيل",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																className: inputClass,
																value: line.description,
																onChange: (event) => editLine(line.id, { description: event.target.value })
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "mt-2 grid grid-cols-3 gap-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
																	label: "الكمية",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																		className: inputClass,
																		type: "number",
																		min: 0,
																		step: "1",
																		value: line.qty,
																		onChange: (event) => editLine(line.id, { qty: Number(event.target.value) })
																	})
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
																	label: "السعر الإفرادي",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																		className: inputClass,
																		type: "number",
																		min: 0,
																		step: "0.001",
																		value: line.unitPrice,
																		onChange: (event) => editLine(line.id, { unitPrice: Number(event.target.value) })
																	})
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
																	label: "المبلغ",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																		className: inputClass,
																		readOnly: true,
																		value: formatMoney(lineAmount(line))
																	})
																})
															]
														})
													]
												}, line.id))
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 grid gap-3 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "رصيد سابق",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													type: "number",
													step: "0.001",
													value: invoice.previousBalance,
													onChange: (event) => edit({ previousBalance: Number(event.target.value) })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "دفعة نقدية",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: inputClass,
													type: "number",
													min: 0,
													step: "0.001",
													value: invoice.cashPayment,
													onChange: (event) => edit({ cashPayment: Number(event.target.value) })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
												label: "صافي الفاتورة",
												value: formatMoney(totals.net)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
												label: "رصيد حالي",
												value: formatMoney(totals.current)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
												label: "باقي للدفع",
												value: formatMoney(totals.due)
											})
										]
									}),
									totals.due < 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm font-bold text-warn",
										children: "الدفعة النقدية أكبر من الرصيد الحالي. راجع المبلغ قبل الاعتماد."
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs leading-5 text-muted",
										children: "الصافي = مجموع الكمية × السعر. الرصيد الحالي = الرصيد السابق + الصافي. الباقي = الرصيد الحالي − الدفعة. لا توجد خانات ضريبة أو خصم في النموذج الأصلي."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "المبلغ كتابة يعتمد على",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													className: inputClass,
													value: invoice.wordsBasis,
													onChange: (event) => edit({
														wordsBasis: event.target.value === "remaining" ? "remaining" : "net",
														amountWordsManual: false
													}),
													disabled: invoice.amountWordsManual,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "net",
														children: "صافي الفاتورة"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "remaining",
														children: "باقي للدفع"
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-2 text-sm font-bold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: invoice.amountWordsManual,
													onChange: (event) => edit({
														amountWordsManual: event.target.checked,
														amountWords: event.target.checked ? totals.words : ""
													})
												}), "تعديل المبلغ كتابة يدوياً"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "المبلغ كتابة",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
													className: `${inputClass} min-h-20`,
													readOnly: !invoice.amountWordsManual,
													value: invoice.amountWordsManual ? invoice.amountWords : totals.words,
													onChange: (event) => edit({
														amountWords: event.target.value,
														amountWordsManual: true
													})
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												onClick: () => window.print(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), " طباعة"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												onClick: () => void exportPdf(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "size-4" }), " PDF"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												onClick: () => void downloadExcel(`${fileStamp(invoice)}.xlsx`, [{
													name: "الفاتورة",
													rows: [invoiceSummaryRow(invoice)]
												}, {
													name: "البنود",
													rows: invoiceLineRows(invoice)
												}]),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-4" }), " Excel"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
												onClick: () => downloadCsv(`${fileStamp(invoice)}.csv`, [invoiceSummaryRow(invoice)]),
												children: "CSV"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												onClick: () => downloadInvoiceJson(invoice),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "size-4" }), " JSON"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												onClick: copyInvoice,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " نسخة"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
												tone: "danger",
												onClick: () => setPendingDelete(invoice),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " حذف"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted",
										children: [
											"الحالة: ",
											invoice.status === "issued" ? "صادرة" : "مسودة",
											".",
											" ",
											invoice.status === "issued" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "font-bold text-brand",
												onClick: () => edit({ status: "draft" }),
												children: "إرجاع إلى مسودة"
											}) : null
										]
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: pane === "edit" ? "hidden lg:block" : "block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: stageRef,
								className: "sheet-stage overflow-x-auto rounded-lg bg-brand/5 p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "sheet-zoom mx-auto",
									style: { height: Math.ceil(sheetHeight * scale) },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										ref: visibleRef,
										style: {
											zoom: scale,
											width: "210mm"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceSheet, {
											invoice,
											settings
										})
									})
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "capture-host no-print",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: captureRef,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceSheet, {
								invoice,
								settings
							})
						})
					})
				] }) : null,
				section === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "no-print rounded-lg border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-w-60 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute start-3 top-3 size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: `${inputClass} ps-9`,
									placeholder: "بحث بالعدد أو الاسم أو التاريخ",
									value: query,
									onChange: (event) => setQuery(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: startNew,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " فاتورة جديدة"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: () => downloadBackup(invoices, settings),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileJson, { className: "size-4" }), " نسخة احتياطية"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => importRef.current?.click(),
								children: "استعادة"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: importRef,
								type: "file",
								accept: "application/json,.json",
								className: "hidden",
								onChange: (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (file) onImport(file);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: () => void downloadExcel(`فواتير-الموج.xlsx`, [{
									name: "الفواتير",
									rows: invoices.map(invoiceSummaryRow)
								}]),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-4" }), " Excel"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => downloadCsv("فواتير-الموج.csv", invoices.map(invoiceSummaryRow)),
								children: "CSV"
							})
						]
					}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-10 text-center font-bold text-muted",
						children: "لا توجد فواتير مطابقة."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[40rem] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-line text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "العدد"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "التاريخ"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "الاسم"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "الشركة"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "الصافي"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "الحالة"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-2 py-2 text-start font-bold",
										children: "إجراءات"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((item) => {
								const rowTotals = totalsOf(item);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-line",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3 font-extrabold",
											children: item.number || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3",
											children: formatDate(item.date)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3",
											children: item.clientName || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3",
											children: item.companyName || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3",
											dir: "ltr",
											children: formatMoney(rowTotals.net)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: item.status === "issued" ? "font-bold text-good" : "font-bold text-warn",
												children: item.status === "issued" ? "صادرة" : "مسودة"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "font-bold text-brand",
														onClick: () => openInvoice(item),
														children: "فتح"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "font-bold text-ink",
														onClick: () => {
															openInvoice(item);
															const copy = duplicateInvoice(item, settingsRef.current);
															commitSettings(bumpNextNumber(settingsRef.current, copy.number));
															setInvoice(copy);
															saveOpen(uid, copy);
															setDirty(true);
														},
														children: "نسخ"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														className: "font-bold text-danger",
														onClick: () => setPendingDelete(item),
														children: "حذف"
													})
												]
											})
										})
									]
								}, item.id);
							}) })]
						})
					})]
				}) : null,
				section === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "no-print mx-auto max-w-xl rounded-lg border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-1 text-lg font-extrabold",
							children: "إعدادات النموذج"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-sm text-muted",
							children: "أسماء الشركة والشعار ثابتة كما في الفاتورة الأصلية. يمكن تحديث التوقيع وبيانات التذييل ورقم الفاتورة التالي."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "صفة الموقّع",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										value: settings.signatureTitle,
										onChange: (event) => commitSettings({
											...settings,
											signatureTitle: event.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "اسم الموقّع",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										value: settings.signatureName,
										onChange: (event) => commitSettings({
											...settings,
											signatureName: event.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "الموقع",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										dir: "ltr",
										value: settings.website,
										onChange: (event) => commitSettings({
											...settings,
											website: event.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "البريد",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										dir: "ltr",
										value: settings.email,
										onChange: (event) => commitSettings({
											...settings,
											email: event.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "العنوان",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										value: settings.address,
										onChange: (event) => commitSettings({
											...settings,
											address: event.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "الهاتف في التذييل",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										dir: "ltr",
										value: settings.phone,
										onChange: (event) => commitSettings({
											...settings,
											phone: event.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "العدد التالي للفاتورة الجديدة",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: inputClass,
										type: "number",
										min: 1,
										value: settings.nextNumber,
										onChange: (event) => commitSettings({
											...settings,
											nextNumber: Number(event.target.value)
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
									tone: "primary",
									onClick: () => void persist(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), " حفظ الإعدادات"]
								})
							]
						})
					]
				}) : null
			] }),
			pendingDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-print fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-lg bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-extrabold",
							children: "حذف الفاتورة؟"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"سيتم حذف الفاتورة ",
								pendingDelete.number || "بدون عدد",
								pendingDelete.clientName ? ` — ${pendingDelete.clientName}` : "",
								". لا يمكن التراجع إلا من نسخة احتياطية."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								tone: "danger",
								onClick: () => void removeInvoice(pendingDelete),
								children: "حذف"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => setPendingDelete(null),
								children: "إلغاء"
							})]
						})
					]
				})
			}) : null
		]
	});
}
function saveLabel(state, authed) {
	if (state === "saving") return "جاري الحفظ…";
	if (state === "dirty") return "تغييرات بانتظار الحفظ";
	if (state === "saved") return authed ? "تم الحفظ على الحساب" : "تم الحفظ في هذا المتصفح";
	if (state === "local") return authed ? "حُفظت محلياً وتعذرت المزامنة" : "محفوظة في هذا المتصفح";
	return authed ? "الحفظ التلقائي مفعّل" : "الحفظ على هذا المتصفح";
}
function errorText(error) {
	if (error instanceof Error && error.message) return error.message;
	return "تعذر إكمال العملية. النسخة المحلية ما زالت محفوظة في المتصفح.";
}
function NavButton({ active, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `min-h-11 rounded-lg px-3 text-sm font-extrabold ${active ? "bg-brand text-on-brand" : "bg-card text-ink border border-line"}`,
		children
	});
}
function Btn({ children, onClick, tone = "ghost", disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled,
		onClick,
		className: `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold disabled:opacity-50 ${{
			primary: "bg-brand text-on-brand",
			ghost: "border border-line bg-card text-ink",
			good: "bg-good text-on-brand",
			danger: "border border-danger/30 bg-card text-danger"
		}[tone]}`,
		children
	});
}
function Field({ label, error, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 block text-sm font-bold",
				children: label
			}),
			children,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-xs font-bold text-danger",
				children: error
			}) : null
		]
	});
}
function Readout({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mb-1 block text-sm font-bold",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `${inputClass} flex items-center bg-paper font-extrabold`,
		dir: "ltr",
		children: value
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceDesk, {});
}
//#endregion
export { Home as component };
