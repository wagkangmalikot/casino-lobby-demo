"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { peso } from "@/lib/format";
import { useSpin5, useWallet } from "@/lib/queries";
import { createSlotScene, GAME_H, GAME_W, type SlotSceneApi } from "@/lib/slot5/createSlotScene";
import { PAYLINES, PAYTABLE, type Sym } from "@/lib/slot5/engine";
import { useToast } from "./Toast";

const LINE_BETS = [1, 2, 5, 10];
const NAMES: Record<Sym, string> = { wild: "Wild", seven: "Seven", gem: "Gem", coin: "Coin", bell: "Bell", cherry: "Cherry" };

// React owns the state (bet, wallet, API calls). Phaser only draws and animates.
export function PhaserSlot() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<SlotSceneApi | null>(null);
  const [ready, setReady] = useState(false);
  const [lineBet, setLineBet] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ win: number; lines: string[] } | null>(null);

  const wallet = useWallet();
  const spinMutation = useSpin5();
  const toast = useToast();
  const totalBet = lineBet * PAYLINES.length;
  const funds = (wallet.data?.balance ?? 0) + (wallet.data?.bonus ?? 0);

  // Load Phaser only in the browser, then start the game inside our div.
  useEffect(() => {
    let game: import("phaser").Game | undefined;
    let cancelled = false;
    (async () => {
      const Phaser = (await import("phaser")).default;
      if (cancelled || !host.current) return;
      const Scene = createSlotScene(Phaser, (api) => {
        scene.current = api;
        setReady(true);
      });
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host.current,
        width: GAME_W,
        height: GAME_H,
        transparent: true,
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

  const spin = useCallback(() => {
    if (!scene.current || busy) return;
    if (totalBet > funds) {
      toast.show("Not enough balance. Make a deposit to keep playing.", "error");
      return;
    }
    setBusy(true);
    setResult(null);
    scene.current.windUp();
    spinMutation.mutate(lineBet, {
      onSuccess: async (res) => {
        await scene.current?.spinTo(res.grid, res.wins, res.win >= res.totalBet * 10);
        setResult({
          win: res.win,
          lines: res.wins.map((w) => `Line ${w.line + 1}: ${w.count} × ${NAMES[w.symbol]} = ${peso(w.win)}`),
        });
        setBusy(false);
      },
      onError: (err) => {
        toast.show(err.message, "error");
        setBusy(false);
      },
    });
  }, [busy, funds, lineBet, spinMutation, toast, totalBet]);

  // Space bar spins, like most desktop slots.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spin]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-950/60 via-night-900 to-night-950 p-3 ring-1 ring-gold-400/30 sm:p-5">
      <div className="relative aspect-[5/3] w-full">
        <div ref={host} className="absolute inset-0" aria-label="Slot reels" role="img" />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-400/30 border-t-gold-400" />
          </div>
        )}
      </div>

      <div className="mt-2 min-h-14 text-center" aria-live="polite">
        {result &&
          (result.win > 0 ? (
            <>
              <p className="pop-in font-display text-2xl font-bold text-gold-300">You won {peso(result.win)}!</p>
              <p className="mt-0.5 text-xs text-slate-400">{result.lines.join(" · ")}</p>
            </>
          ) : (
            <p className="pt-2 text-sm text-slate-400">No win this time.</p>
          ))}
      </div>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Bet per line · 10 lines</p>
          <div className="flex gap-1.5">
            {LINE_BETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setLineBet(b)}
                disabled={busy}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition disabled:opacity-60 ${lineBet === b ? "bg-gold-400 text-night-950 ring-gold-400" : "bg-night-800 text-slate-200 ring-white/10 hover:ring-white/25"}`}
              >
                ₱{b}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Total bet</p>
            <p className="font-bold text-white">{peso(totalBet)}</p>
          </div>
          <button
            type="button"
            onClick={spin}
            disabled={!ready || busy || totalBet > funds}
            className="rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 px-10 py-3.5 font-display text-lg font-bold text-night-950 shadow-lg shadow-gold-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Spinning…" : "SPIN"}
          </button>
        </div>
      </div>
      <p className="mt-2 hidden text-right text-[11px] text-slate-500 sm:block">Tip: press Space to spin</p>
      {totalBet > funds && !busy && <p className="mt-2 text-center text-sm text-rose-300">Not enough balance for this bet. Make a deposit to keep playing.</p>}

      <details className="mt-3 text-xs text-slate-400">
        <summary className="cursor-pointer select-none font-semibold text-slate-300">Paytable and rules</summary>
        <table className="mt-2 w-full max-w-sm text-left">
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
                <td className="py-1 text-slate-200">{NAMES[s]}</td>
                {PAYTABLE[s].map((m, i) => (
                  <td key={i}>{m}×</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">Wins pay left to right on 10 lines, as a multiple of the line bet. Wild stands in for every symbol. Long-run payout is about 95.5%.</p>
      </details>
    </div>
  );
}
