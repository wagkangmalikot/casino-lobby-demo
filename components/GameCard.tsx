"use client";

import type { Game } from "@/lib/types";
import { GameArt } from "./GameArt";

type Props = {
  game: Game;
  isFavorite: boolean;
  onOpen: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
};

export function GameCard({ game, isFavorite, onOpen, onToggleFavorite }: Props) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpen(game)}
        className="block w-full overflow-hidden rounded-2xl bg-night-800 text-left ring-1 ring-white/5 transition hover:-translate-y-1 hover:ring-gold-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        aria-label={`Open ${game.name}`}
      >
        <div className="relative">
          <GameArt game={game} className="aspect-[4/3]" />
          <div className="absolute left-2 top-2 flex gap-1">
            {game.isNew && <span className="rounded-md bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-night-950">New</span>}
            {game.isHot && <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Hot</span>}
            {game.engine === "phaser" && <span className="rounded-md bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-night-950">5 reels</span>}
          </div>
          <span className="absolute inset-0 grid place-items-center bg-night-950/55 opacity-0 transition group-hover:opacity-100">
            {game.category === "slots" ? (
              <span className="rounded-full bg-gold-400 px-4 py-2 text-sm font-bold text-night-950">Play demo</span>
            ) : (
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">Coming soon</span>
            )}
          </span>
        </div>
        <div className="px-3 pb-3 pt-2.5">
          <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white">{game.name}</p>
          <p className="truncate text-xs text-slate-400">{game.provider}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onToggleFavorite(game.id)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`}
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-night-950/60 text-white backdrop-blur transition hover:bg-night-950/80"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isFavorite ? "#fbbf24" : "none"} stroke={isFavorite ? "#fbbf24" : "currentColor"} strokeWidth="2">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.4 1.1 4.1 2.3h3C14.2 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" />
        </svg>
      </button>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-night-800 ring-1 ring-white/5">
      <div className="shimmer aspect-[4/3] bg-night-700" />
      <div className="space-y-2 px-3 pb-3 pt-2.5">
        <div className="shimmer h-4 w-3/4 rounded bg-night-700" />
        <div className="shimmer h-3 w-1/2 rounded bg-night-700" />
      </div>
    </div>
  );
}
