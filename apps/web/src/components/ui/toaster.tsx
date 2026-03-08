"use client";

import { useToastStore } from "@/stores/toast-store";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(360px,calc(100%-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border p-3 shadow-lg ${toast.variant === "danger" ? "border-red-200 bg-red-50 text-red-900" : "border-border bg-card"}`}
          onClick={() => remove(toast.id)}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-xs text-muted">{toast.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
