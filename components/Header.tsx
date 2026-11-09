"use client";

import { peso } from "@/lib/format";
import { useWallet } from "@/lib/queries";

export function Header({ onDeposit }: { onDeposit: () => void }) {
  const wallet = useWallet();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-night-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
            <path d="M16 2l3.6 9.2L29 12l-7.4 6.1L24 28l-8-5.4L8 28l2.4-9.9L3 12l9.4-.8z" fill="#fbbf24" />
          </svg>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Bituin<span className="text-gold-400">Play</span>
          </span>
          <span className="ml-1 hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 sm:inline">Demo</span>
        </a>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-night-800 px-3 py-1.5 text-right ring-1 ring-white/10" aria-live="polite">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Balance</p>
            {wallet.isPending ? (
              <div className="shimmer mt-0.5 h-4 w-20 rounded bg-night-700" />
            ) : (
              <p className="text-sm font-bold text-white">
                {peso(wallet.data?.balance ?? 0)}
                {!!wallet.data?.bonus && <span className="ml-1.5 text-xs font-semibold text-emerald-300">+{peso(wallet.data.bonus)} bonus</span>}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDeposit}
            className="rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-night-950 transition hover:bg-gold-300"
          >
            Deposit
          </button>
        </div>
      </div>
    </header>
  );
}
