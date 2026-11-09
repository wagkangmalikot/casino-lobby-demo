"use client";

import { useEffect, useRef } from "react";

// Accessible modal: closes on Escape and backdrop click, locks page scroll,
// and moves focus into the dialog. On phones it slides up as a bottom sheet.
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
  extraWide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  extraWide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`slide-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-night-900 shadow-2xl ring-1 ring-white/10 outline-none sm:rounded-3xl ${extraWide ? "sm:max-w-5xl" : wide ? "sm:max-w-3xl" : "sm:max-w-md"}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-night-900/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
