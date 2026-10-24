import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-IWHfIGH2.mjs";
import { t as GROK_PROVIDERS } from "./server-Dr6k7KKN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CbymzKsu.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-lg border border-line bg-card p-6 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/invoice/logo.png",
					alt: "شركة الموج",
					className: "mx-auto mb-4 h-16 w-auto"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-center text-2xl font-extrabold text-ink",
					children: "دفتر فواتير الموج"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-sm text-muted",
					children: "سجّل الدخول لحفظ الفواتير على الحساب وفتحها من أي جهاز."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
						className: "min-h-11 rounded-lg border border-line bg-card px-4 py-2 font-bold text-ink hover:bg-paper",
						children: ["المتابعة عبر ", provider.label]
					}, provider.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					className: "mt-4 block text-center text-sm font-bold text-brand",
					children: "العودة إلى الدفتر"
				})
			]
		})
	});
}
//#endregion
export { Login as component };
