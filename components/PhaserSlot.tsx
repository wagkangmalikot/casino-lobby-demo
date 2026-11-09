"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { peso } from "@/lib/format";
import { useSpin5, useWallet } from "@/lib/queries";
import { createSlotScene, GAME_H, GAME_W, type SlotSceneApi } from "@/lib/slot5/createSlotScene";
import { PAYLINES, PAYTABLE, type Sym } from "@/lib/slot5/engine";
import { useToast } from "./Toast";

const LINE_BETS = [1, 2, 5, 10, 20];
const AUTO_SPINS = 10;
const NAMES: Record<Sym, string> = { wild: "Wild", seven: "7", gem: "Gem", coin: "Coin", bell: "Bell", ace: "A", king: "K", queen: "Q", jack: "J" };

// React owns the state (bet, wallet, API calls, auto-spin). Phaser only draws and animates.
export function PhaserSlot() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<SlotSceneApi | null>(null);
  const [ready, setReady] = useState(false);
  const [betIndex, setBetIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [autoLeft, setAutoLeft] = useState(0);
  const [result, setResult] = useState<{ win: number; lines: string[] } | null>(null);

  const wallet = useWallet();
  const spinMutation = useSpin5();
  const toast = useToast();
  const lineBet = LINE_BETS[betIndex];
  const totalBet = lineBet * PAYLINES.length;
  const funds = (wallet.data?.balance ?? 0) + (wallet.data?.bonus ?? 0);

  // Load Phaser only in the browser, wait for the page font, then start the game inside our div.
  useEffect(() => {
    let game: import("phaser").Game | undefined;
    let cancelled = false;
    (async () => {
      const Phaser = (await import("phaser")).default;
      await document.fonts.ready;
      if (cancelled || !host.current) return;
      const font = getComputedStyle(document.documentElement).getPropertyValue("--font-inter-display").trim() || "sans-serif";
      const Scene = createSlotScene(
        Phaser,
        (api) => {
          scene.current = api;
          setReady(true);
        },
        font,
      );
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host.current,
        width: GAME_W,
        height: GAME_H,
        backgroundColor: "#0b0616",
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: Scene,
        banner: false,
      });
    })();
    return () => {
      cancelled = true;
      scene.current = null;
      game?.destroy(true);
    };
  }, []);

  useEffect(() => {
    scene.current?.setTurbo(turbo);
  }, [turbo, ready]);

  const spin = useCallback(() => {
    if (!scene.current || busy) return;
    if (totalBet > funds) {
      setAutoLeft(0);
      toast.show("Not enough balance. Make a deposit to keep playing.", "error");
      return;
    }
    setBusy(true);
    setResult(null);
    scene.current.windUp();
    spinMutation.mutate(lineBet, {
      onSuccess: async (res) => {
        await scene.current?.spinTo(res.grid, res.wins, res.win, res.win >= res.totalBet * 10);
        setResult({ win: res.win, lines: res.wins.map((w) => `Line ${w.line + 1}: ${w.count}× ${NAMES[w.symbol]} = ${peso(w.win)}`) });
        setAutoLeft((n) => Math.max(0, n - 1));
        setBusy(false);
      },
      onError: (err) => {
        toast.show(err.message, "error");
        setAutoLeft(0);
        setBusy(false);
      },
    });
  }, [busy, funds, lineBet, spinMutation, toast, totalBet]);

  // Auto-spin: start the next spin shortly after the previous one finishes.
  useEffect(() => {
    if (!busy && autoLeft > 0 && ready) {
      const t = setTimeout(spin, turbo ? 250 : 700);
      return () => clearTimeout(t);
    }
  }, [autoLeft, busy, ready, spin, turbo]);

  // Space bar spins, like most desktop slots.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spin]);

  const toggleAuto = () => setAutoLeft((n) => (n > 0 ? 0 : AUTO_SPINS));
  const canSpin = ready && !busy && totalBet <= funds;

  const balanceBox = (
    <div className="rounded-xl bg-black/40 px-3 py-2 ring-1 ring-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Balance</p>
      <p className="text-sm font-bold text-white sm:text-base">{peso(funds)}</p>
    </div>
  );
  const winBox = (
    <div className="rounded-xl bg-black/40 px-3 py-2 ring-1 ring-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Win</p>
      <p className={`text-base font-bold ${result?.win ? "text-gold-300" : "text-white"}`}>{peso(result?.win ?? 0)}</p>
    </div>
  );
  const spinButton = (
    <button
      type="button"
      onClick={spin}
      disabled={!canSpin}
      aria-label={busy ? "Spinning" : "Spin"}
      className="group relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff7c2,#fbbf24_45%,#b45309)] shadow-[0_0_0_4px_rgba(251,191,36,0.25),0_10px_30px_-6px_rgba(245,165,36,0.7)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-24 sm:w-24"
    >
      <svg viewBox="0 0 48 48" className={`h-10 w-10 text-[#3b1300] ${busy ? "animate-spin" : "transition group-hover:rotate-45"}`} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 24a16 16 0 0 1-27.3 11.3M8 24A16 16 0 0 1 35.3 12.7" />
        <path d="M36 4v9h-9M12 44v-9h9" />
      </svg>
    </button>
  );
  const betStepper = (
    <div className="flex items-center rounded-xl bg-black/40 ring-1 ring-white/10">
      <button type="button" onClick={() => setBetIndex((i) => Math.max(0, i - 1))} disabled={busy || betIndex === 0} className="h-12 w-9 text-lg font-bold text-white disabled:opacity-30" aria-label="Lower bet">
        −
      </button>
      <div className="min-w-16 text-center sm:min-w-20">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Bet</p>
        <p className="text-sm font-bold text-white sm:text-base">{peso(totalBet)}</p>
      </div>
      <button type="button" onClick={() => setBetIndex((i) => Math.min(LINE_BETS.length - 1, i + 1))} disabled={busy || betIndex === LINE_BETS.length - 1} className="h-12 w-9 text-lg font-bold text-white disabled:opacity-30" aria-label="Raise bet">
        +
      </button>
    </div>
  );
  const turboButton = (
    <button
      type="button"
      onClick={() => setTurbo((t) => !t)}
      aria-pressed={turbo}
      className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ring-1 transition ${turbo ? "bg-sky-400 text-night-950 ring-sky-300" : "bg-black/40 text-slate-300 ring-white/10 hover:text-white"}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
      Turbo
    </button>
  );
  const autoButton = (
    <button
      type="button"
      onClick={toggleAuto}
      aria-pressed={autoLeft > 0}
      disabled={!ready || (!autoLeft && totalBet > funds)}
      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ring-1 transition disabled:opacity-40 ${autoLeft > 0 ? "bg-emerald-400 text-night-950 ring-emerald-300" : "bg-black/40 text-slate-300 ring-white/10 hover:text-white"}`}
    >
      {autoLeft > 0 ? `Stop ${autoLeft}` : `Auto ${AUTO_SPINS}`}
    </button>
  );


  return (
    <div className="overflow-hidden rounded-2xl bg-[#0b0616] ring-1 ring-gold-400/30">
      <div className="relative aspect-[5/3] w-full">
        <div ref={host} className="absolute inset-0" aria-label="Slot reels" role="img" />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold-400/30 border-t-gold-400" />
              <p className="mt-3 text-sm text-slate-300">Loading Golden Ox…</p>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="border-t border-gold-400/20 bg-gradient-to-b from-[#1d0e35] to-[#0b0616] px-3 py-3 sm:px-5">
        {/* Phones: balance + bet on top, Turbo · SPIN · Auto below. Desktop: one row. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 gap-y-3 sm:gap-x-4">
          <div className="col-start-1 row-start-1 flex gap-2 sm:gap-3">
            {balanceBox}
            <div className="hidden sm:block">{winBox}</div>
          </div>
          <div className="col-start-3 row-start-1 flex items-center justify-end gap-2 sm:gap-3">
            {betStepper}
            <div className="hidden flex-col gap-1.5 sm:flex">
              {turboButton}
              {autoButton}
            </div>
          </div>
          {/* SPIN sits in the middle column: row 1 on desktop, row 2 on phones. */}
          <div className="col-start-2 row-start-2 sm:row-start-1">{spinButton}</div>
          <div className="col-start-1 row-start-2 flex justify-start sm:hidden">{turboButton}</div>
          <div className="col-start-3 row-start-2 flex justify-end sm:hidden">{autoButton}</div>
        </div>

        <div className="mt-2 min-h-5 text-center text-xs text-slate-400" aria-live="polite">
          {totalBet > funds && !busy ? (
            <span className="text-rose-300">Not enough balance for this bet. Make a deposit to keep playing.</span>
          ) : result?.lines.length ? (
            result.lines.join(" · ")
          ) : result ? (
            "No win this time."
          ) : (
            <span className="hidden sm:inline">₱{lineBet} per line × 10 lines · Press Space to spin</span>
          )}
        </div>
      </div>

      <details className="border-t border-white/5 bg-[#0b0616] px-4 py-3 text-xs text-slate-400 sm:px-5">
        <summary className="cursor-pointer select-none font-semibold text-slate-300">Paytable and rules</summary>
        <table className="mt-2 w-full max-w-md text-left">
          <thead>
            <tr className="text-slate-500">
              <th className="py-1 font-medium">Symbol</th>
              <th className="font-medium">3 in a row</th>
              <th className="font-medium">4</th>
              <th className="font-medium">5</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(PAYTABLE) as Sym[]).map((s) => (
              <tr key={s} className="border-t border-white/5">
                <td className="py-1 font-semibold text-slate-200">{NAMES[s]}</td>
                {PAYTABLE[s].map((m, i) => (
                  <td key={i}>{m}×</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">
          Pays are multiples of the line bet. Wins pay left to right on 10 lines. Wild stands in for every symbol. Long-run payout (RTP) is about 95.8%,
          and the top prize is 1,300× the total bet.
        </p>
      </details>
    </div>
  );
}
