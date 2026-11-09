"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };
type ToastApi = { show: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const toneClass = {
    success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    error: "border-rose-400/40 bg-rose-500/15 text-rose-100",
    info: "border-white/15 bg-night-800 text-slate-100",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`slide-up rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur ${toneClass[t.tone]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
