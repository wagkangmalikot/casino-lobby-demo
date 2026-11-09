"use client";

import { useState } from "react";
import { DEPOSIT_MAX, DEPOSIT_MIN, previewBonus } from "@/lib/api";
import { peso, pesoShort } from "@/lib/format";
import { useDeposit } from "@/lib/queries";
import type { PaymentMethod } from "@/lib/types";
import { Modal } from "./Modal";
import { useToast } from "./Toast";

const PRESETS = [200, 500, 1000, 5000];
const METHODS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: "gcash", label: "GCash", note: "Instant" },
  { id: "maya", label: "Maya", note: "Instant" },
  { id: "card", label: "Card", note: "Visa / Mastercard" },
  { id: "bank", label: "Bank", note: "1–2 hours" },
];

export function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState<PaymentMethod>("gcash");
  const [promo, setPromo] = useState("");
  const depositMutation = useDeposit();
  const toast = useToast();

  const promoCheck = previewBonus(amount, promo || undefined);
  const amountError =
    amount < DEPOSIT_MIN ? `Minimum is ${pesoShort(DEPOSIT_MIN)}` : amount > DEPOSIT_MAX ? `Maximum is ${pesoShort(DEPOSIT_MAX)}` : null;
  const canSubmit = !amountError && !promoCheck.error && !depositMutation.isPending;

  const step = (delta: number) => setAmount((a) => Math.max(0, Math.min(DEPOSIT_MAX, a + delta)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    depositMutation.mutate(
      { amount, method, promoCode: promo || undefined },
      {
        onSuccess: (res) => {
          toast.show(
            res.bonusAwarded
              ? `Deposited ${peso(amount)} + ${peso(res.bonusAwarded)} bonus`
              : `Deposited ${peso(amount)}`,
            "success",
          );
          setPromo("");
          onClose();
        },
        onError: (err) => toast.show(err.message, "error"),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Deposit">
      <form onSubmit={submit} className="space-y-6 p-5">
        <p className="rounded-lg bg-gold-400/10 px-3 py-2 text-xs text-gold-300 ring-1 ring-gold-400/20">
          Demo only. No real payment is made and no money changes hands.
        </p>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-300">Payment method</legend>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <label
                key={m.id}
                className={`cursor-pointer rounded-xl px-3 py-2.5 ring-1 transition ${method === m.id ? "bg-gold-400/10 ring-gold-400" : "bg-night-800 ring-white/10 hover:ring-white/25"}`}
              >
                <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                <span className="block font-semibold text-white">{m.label}</span>
                <span className="block text-xs text-slate-400">{m.note}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-slate-300">
            Amount
          </label>
          <div className="flex items-stretch gap-2">
            <button type="button" onClick={() => step(-100)} className="w-12 rounded-xl bg-night-800 text-xl font-bold text-white ring-1 ring-white/10 hover:bg-night-700" aria-label="Decrease by 100">
              −
            </button>
            <div className={`flex flex-1 items-center rounded-xl bg-night-800 px-3 ring-1 ${amountError ? "ring-rose-400" : "ring-white/10 focus-within:ring-gold-400"}`}>
              <span className="text-slate-400">₱</span>
              <input
                id="amount"
                inputMode="numeric"
                value={amount === 0 ? "" : amount.toString()}
                onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="w-full bg-transparent px-2 py-3 text-lg font-semibold text-white outline-none"
                aria-invalid={!!amountError}
                aria-describedby="amount-help"
              />
            </div>
            <button type="button" onClick={() => step(100)} className="w-12 rounded-xl bg-night-800 text-xl font-bold text-white ring-1 ring-white/10 hover:bg-night-700" aria-label="Increase by 100">
              +
            </button>
          </div>
          <p id="amount-help" className={`mt-1.5 text-xs ${amountError ? "text-rose-300" : "text-slate-500"}`}>
            {amountError ?? `Between ${pesoShort(DEPOSIT_MIN)} and ${pesoShort(DEPOSIT_MAX)}`}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={`rounded-lg py-2 text-sm font-semibold ring-1 transition ${amount === p ? "bg-gold-400 text-night-950 ring-gold-400" : "bg-night-800 text-slate-200 ring-white/10 hover:ring-white/25"}`}
              >
                {pesoShort(p)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="promo" className="mb-2 block text-sm font-semibold text-slate-300">
            Promo code <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="promo"
            value={promo}
            onChange={(e) => setPromo(e.target.value.toUpperCase())}
            placeholder="Try WELCOME100"
            className={`w-full rounded-xl bg-night-800 px-3 py-3 font-semibold uppercase tracking-wider text-white outline-none ring-1 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-500 ${promoCheck.error ? "ring-rose-400" : "ring-white/10 focus:ring-gold-400"}`}
            aria-invalid={!!promoCheck.error}
            aria-describedby="promo-help"
          />
          <p id="promo-help" className={`mt-1.5 text-xs ${promoCheck.error ? "text-rose-300" : promoCheck.bonus ? "text-emerald-300" : "text-slate-500"}`}>
            {promoCheck.error ?? (promoCheck.bonus ? `You'll get a ${peso(promoCheck.bonus)} bonus.` : "Codes: WELCOME100 (100% up to ₱1,000) · RELOAD25 (25% up to ₱500)")}
          </p>
        </div>

        <div className="rounded-xl bg-night-800 p-4 text-sm ring-1 ring-white/5">
          <div className="flex justify-between text-slate-300">
            <span>Deposit</span>
            <span>{peso(amount)}</span>
          </div>
          <div className="mt-1 flex justify-between text-slate-300">
            <span>Bonus</span>
            <span className="text-emerald-300">+ {peso(promoCheck.bonus)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-bold text-white">
            <span>Total credited</span>
            <span>{peso(amount + promoCheck.bonus)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-gold-400 py-3.5 font-bold text-night-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {depositMutation.isPending ? "Processing…" : `Deposit ${peso(amount)}`}
        </button>
      </form>
    </Modal>
  );
}
