import { Suspense } from "react";
import { PeraRedirectClient } from "@/app/connect/pera/pera-redirect-client";

function PeraRedirectFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <section className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">Opening Pera Wallet...</h1>
        <p className="mt-2 text-sm text-neutral-600">Redirecting you...</p>
      </section>
    </main>
  );
}

export default function ConnectPeraPage() {
  return (
    <Suspense fallback={<PeraRedirectFallback />}>
      <PeraRedirectClient />
    </Suspense>
  );
}
