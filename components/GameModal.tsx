"use client";

import { useState } from "react";
import { pesoShort } from "@/lib/format";
import { categoryLabels } from "@/lib/games";
import type { Game } from "@/lib/types";
import { GameArt } from "./GameArt";
import { Modal } from "./Modal";
import { PhaserSlot } from "./PhaserSlot";
import { SlotMachine } from "./SlotMachine";

const volatilityColor = { Low: "text-emerald-300", Medium: "text-amber-300", High: "text-rose-300" } as const;

export function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [launching, setLaunching] = useState(false);

  const close = () => {
    setPlaying(false);
    setLaunching(false);
    onClose();
  };

  const launch = () => {
    // Mimic a provider launch: short loading screen, then the game.
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      setPlaying(true);
    }, 900);
  };

  if (!game) return null;
  const playable = game.category === "slots";

  return (
    <Modal open={!!game} onClose={close} title={game.name} wide extraWide={playing && game.engine === "phaser"}>
      <div className="p-5">
        {playing ? (
          game.engine === "phaser" ? <PhaserSlot /> : <SlotMachine game={game} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl">
              <GameArt game={game} className="aspect-[4/3]" />
              {launching && (
                <div className="absolute inset-0 grid place-items-center bg-night-950/80">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gold-400/30 border-t-gold-400" />
                    <p className="mt-3 text-sm font-medium text-slate-200">Launching game…</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-slate-400">{game.provider}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                {[
                  ["Type", categoryLabels[game.category]],
                  ["RTP", `${game.rtp}%`],
                  ["Volatility", game.volatility],
                  game.maxWin ? ["Max win", `${game.maxWin.toLocaleString()}×`] : ["Min bet", pesoShort(game.minBet)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-night-800 px-2 py-3 ring-1 ring-white/5">
                    <dt className="text-[11px] uppercase tracking-wider text-slate-500">{k}</dt>
                    <dd className={`mt-1 text-sm font-semibold ${k === "Volatility" ? volatilityColor[game.volatility] : "text-white"}`}>{v}</dd>
                  </div>
                ))}
              </dl>
              {playable ? (
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {game.engine === "phaser"
                    ? "Our featured original: a 5-reel, 10-line slot built with Phaser, with wilds, Turbo and Auto spin, animated reels and win lines."
                    : "A playable demo slot with its own look. Bets come out of your balance and wins are paid back in."}
                </p>
              ) : (
                <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-slate-300 ring-1 ring-white/10">
                  <span className="font-semibold text-white">Coming soon.</span> This demo has playable slots only. {categoryLabels[game.category]} games are shown to fill out the lobby.
                </p>
              )}
              <button
                type="button"
                onClick={launch}
                disabled={launching || !playable}
                className="mt-auto rounded-xl bg-gold-400 py-3.5 font-bold text-night-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:bg-night-700 disabled:text-slate-400 max-sm:mt-6"
              >
                {!playable ? "Coming soon" : launching ? "Launching…" : "Play demo"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
