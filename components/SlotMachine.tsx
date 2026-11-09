"use client";

import { useEffect, useRef, useState } from "react";
import { peso } from "@/lib/format";
import { useSpin, useWallet } from "@/lib/queries";
import type { Game, ReelSymbol } from "@/lib/types";
import { iconSetFor, SlotSymbol, SmallSymbol } from "./SlotSymbols";
import { useToast } from "./Toast";

const ORDER: ReelSymbol[] = ["seven", "star", "bell", "bar", "cherry"];
const BETS = [5, 10, 25, 50, 100];
const PAYS: [ReelSymbol, string][] = [
  ["seven", "25×"],
  ["star", "12×"],
  ["bell", "8×"],
  ["bar", "5×"],
  ["cherry", "3×"],
];

export function SlotMachine({ game }: { game: Game }) {
  const minBet = game.minBet;
  const set = iconSetFor(game.id);
  const [c1, c2] = game.colors;
  const startBet = BETS.find((b) => b >= minBet) ?? BETS[0];
  const [bet, setBet] = useState(startBet);
  const [reels, setReels] = useState<ReelSymbol[]>(["seven", "seven", "seven"]);
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const wallet = useWallet();
  const spinMutation = useSpin();
  const toast = useToast();
  const busy = spinning.some(Boolean) || spinMutation.isPending;
  const total = (wallet.data?.balance ?? 0) + (wallet.data?.bonus ?? 0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const play = () => {
    if (busy) return;
    setLastWin(null);
    setSpinning([true, true, true]);
    spinMutation.mutate(bet, {
      onSuccess: (res) => {
        // Stop the reels one after another for a classic feel.
        res.reels.forEach((sym, i) => {
          timers.current.push(
            setTimeout(() => {
              setReels((r) => r.map((x, j) => (j === i ? sym : x)));
              setSpinning((s) => s.map((x, j) => (j === i ? false : x)));
              if (i === 2) setLastWin(res.win);
            }, 500 + i * 350),
          );
        });
      },
      onError: (err) => {
        setSpinning([false, false, false]);
        toast.show(err.message, "error");
      },
    });
  };

  return (
    <div className="rounded-2xl p-4 ring-1 ring-white/10 sm:p-6" style={{ background: `linear-gradient(160deg, ${c1}55 0%, #0d1426 45%, #070b16 100%)` }}>
      <p className="mb-3 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-white/80">{game.name}</p>
      <div className="grid grid-cols-3 gap-2 rounded-xl p-2 sm:gap-3 sm:p-3" style={{ background: `linear-gradient(180deg, ${c1}, ${c2})`, boxShadow: `0 0 0 1px ${c1}80, 0 10px 40px -10px ${c1}` }}>
        {reels.map((s, i) => (
          <div key={i} className="relative h-28 overflow-hidden rounded-lg bg-gradient-to-b from-slate-100 to-slate-300 sm:h-32" aria-label={spinning[i] ? "Spinning" : s}>
            {spinning[i] ? (
              <div className="reel-spinning flex flex-col items-center">
                {[...ORDER, ...ORDER].map((x, k) => (
                  <div key={k} className="grid h-28 place-items-center sm:h-32">
                    <SlotSymbol set={set} s={x} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pop-in grid h-full place-items-center">
                <SlotSymbol set={set} s={s} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 h-8 text-center" aria-live="polite">
        {lastWin !== null &&
          (lastWin > 0 ? (
            <p className="pop-in font-display text-xl font-bold text-gold-300">You won {peso(lastWin)}!</p>
          ) : (
            <p className="text-sm text-slate-400">No win this time.</p>
          ))}
      </div>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Bet</p>
          <div className="flex gap-1.5">
            {BETS.filter((b) => b >= minBet).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBet(b)}
                disabled={busy}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition disabled:opacity-60 ${bet === b ? "bg-gold-400 text-night-950 ring-gold-400" : "bg-night-800 text-slate-200 ring-white/10 hover:ring-white/25"}`}
              >
                ₱{b}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={play}
          disabled={busy || total < bet}
          className="rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 px-10 py-3.5 font-display text-lg font-bold text-night-950 shadow-lg shadow-gold-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Spinning…" : "SPIN"}
        </button>
      </div>
      {total < bet && !busy && <p className="mt-3 text-center text-sm text-rose-300">Not enough balance for this bet. Make a deposit to keep playing.</p>}

      <details className="mt-4 text-xs text-slate-400">
        <summary className="cursor-pointer select-none font-semibold text-slate-300">Paytable</summary>
        <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {PAYS.map(([sym, pay]) => (
            <li key={sym} className="flex items-center gap-1">
              <SmallSymbol set={set} s={sym} />
              <SmallSymbol set={set} s={sym} />
              <SmallSymbol set={set} s={sym} />
              <span className="ml-1">{pay} bet</span>
            </li>
          ))}
          <li className="flex items-center gap-1">
            Any 2 <SmallSymbol set={set} s="cherry" /> <span className="ml-1">bet back</span>
          </li>
        </ul>
      </details>
    </div>
  );
}
