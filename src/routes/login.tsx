import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper p-6">
      <div className="w-full max-w-md rounded-lg border border-line bg-card p-6 shadow-sm">
        <img src="/invoice/logo.png" alt="شركة الموج" className="mx-auto mb-4 h-16 w-auto" />
        <h1 className="text-center text-2xl font-extrabold text-ink">دفتر فواتير الموج</h1>
        <p className="mt-2 text-center text-sm text-muted">
          سجّل الدخول لحفظ الفواتير على الحساب وفتحها من أي جهاز.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
                className="min-h-11 rounded-lg border border-line bg-card px-4 py-2 font-bold text-ink hover:bg-paper"
              >
                المتابعة عبر {provider.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">تسجيل الدخول غير مفعّل.</p>
          )}
        </div>
        <a href="/" className="mt-4 block text-center text-sm font-bold text-brand">
          العودة إلى الدفتر
        </a>
      </div>
    </main>
  );
}
