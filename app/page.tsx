"use client";

import { useState } from "react";
import { DepositModal } from "@/components/DepositModal";
import { GameCard, GameCardSkeleton } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { Header } from "@/components/Header";
import { categoryLabels, games as catalogue, providerTaglines, providers as allProviders } from "@/lib/games";
import { useDebounced, useFavorites } from "@/lib/hooks";
import { useGames, useProviders } from "@/lib/queries";
import type { Game, GameFilters } from "@/lib/types";

const CATEGORIES: GameFilters["category"][] = ["all", "slots", "table", "live", "fishing", "favorites"];

export default function Lobby() {
  const [category, setCategory] = useState<GameFilters["category"]>("all");
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [openGame, setOpenGame] = useState<Game | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);

  const { favorites, toggle } = useFavorites();
  const debouncedSearch = useDebounced(search);

  // Favorites only affect the query when that tab is selected,
  // so liking a game doesn't refetch the whole grid.
  const filters: GameFilters = {
    category,
    search: debouncedSearch,
    provider,
    favorites: category === "favorites" ? favorites : [],
  };
  const games = useGames(filters);
  const providers = useProviders();

  const clearFilters = () => {
    setSearch("");
    setProvider("");
    setCategory("all");
  };

  return (
    <div id="top" className="min-h-screen">
      <Header onDeposit={() => setDepositOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* Promo banner */}
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-700 to-night-900 p-6 sm:p-10">
          <svg viewBox="0 0 200 200" className="absolute -right-10 -top-10 h-72 w-72 opacity-20" aria-hidden="true">
            <path d="M100 10l22 58 62 4-48 38 16 60-52-34-52 34 16-60-48-38 62-4z" fill="#fde68a" />
          </svg>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Welcome offer</p>
          <h1 className="mt-2 max-w-lg font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            100% bonus on your first deposit, up to ₱1,000
          </h1>
          <p className="mt-2 text-sm text-indigo-100">
            Use code <span className="rounded bg-white/15 px-1.5 py-0.5 font-bold tracking-wider">WELCOME100</span> in the deposit window.
          </p>
          <button
            type="button"
            onClick={() => setDepositOpen(true)}
            className="mt-6 rounded-xl bg-gold-400 px-6 py-3 font-bold text-night-950 transition hover:bg-gold-300"
          >
            Claim bonus
          </button>
        </section>

        {/* Studios */}
        <section className="mt-8" aria-label="Game studios">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Studios</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
            {allProviders.map((p) => {
              const count = catalogue.filter((g) => g.provider === p).length;
              const active = provider === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProvider(active ? "" : p);
                    setCategory("all");
                  }}
                  aria-pressed={active}
                  className={`w-52 shrink-0 rounded-2xl p-4 text-left ring-1 transition sm:w-auto ${active ? "bg-gold-400/10 ring-gold-400" : "bg-night-800 ring-white/5 hover:ring-white/20"}`}
                >
                  <p className="font-display font-bold text-white">{p}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{providerTaglines[p]}</p>
                  <p className="mt-3 text-xs font-semibold text-gold-400">{count} games</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-30 -mx-4 mt-6 border-b border-white/5 bg-night-950/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" aria-label="Game filters">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === c ? "bg-white text-night-950" : "bg-night-800 text-slate-300 hover:bg-night-700"}`}
                >
                  {categoryLabels[c]}
                  {c === "favorites" && favorites.length > 0 && <span className="ml-1.5 text-xs text-gold-500">{favorites.length}</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="relative flex-1 lg:w-64 lg:flex-none">
                <span className="sr-only">Search games</span>
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search games"
                  className="w-full rounded-xl bg-night-800 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-gold-400"
                />
              </label>
              <label className="shrink-0">
                <span className="sr-only">Provider</span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="h-full rounded-xl bg-night-800 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-gold-400"
                >
                  <option value="">All providers</option>
                  {providers.data?.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="mt-6" aria-label="Games" aria-busy={games.isFetching}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold text-white">{categoryLabels[category]}</h2>
            {games.data && (
              <p className={`text-sm text-slate-400 transition-opacity ${games.isFetching ? "opacity-50" : ""}`}>
                {games.data.length} {games.data.length === 1 ? "game" : "games"}
              </p>
            )}
          </div>

          {games.isPending ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          ) : games.isError ? (
            <div className="rounded-2xl bg-night-800 p-10 text-center">
              <p className="text-slate-200">Games couldn&apos;t load.</p>
              <button type="button" onClick={() => games.refetch()} className="mt-4 rounded-xl bg-gold-400 px-5 py-2.5 font-bold text-night-950">
                Try again
              </button>
            </div>
          ) : games.data.length === 0 ? (
            <div className="rounded-2xl bg-night-800 p-10 text-center ring-1 ring-white/5">
              <p className="font-semibold text-white">{category === "favorites" ? "No favorites yet" : "No games found"}</p>
              <p className="mt-1 text-sm text-slate-400">
                {category === "favorites" ? "Tap the heart on any game to save it here." : "Try a different search or provider."}
              </p>
              {category !== "favorites" && (
                <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6 ${games.isPlaceholderData ? "opacity-60" : ""}`}>
              {games.data.map((g) => (
                <GameCard key={g.id} game={g} isFavorite={favorites.includes(g.id)} onOpen={setOpenGame} onToggleFavorite={toggle} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs leading-relaxed text-slate-500">
        <p>Bituin Play is a portfolio demo by Alfie Deligero. All games, studios and the brand are original and made up; they are not real casino products. No real money is used.</p>
        <p className="mt-1">
          Built with Next.js, React Query and Tailwind CSS ·{" "}
          <a href="https://alfie-deligero.vercel.app" className="text-slate-300 underline-offset-2 hover:underline">
            alfie-deligero.vercel.app
          </a>
        </p>
      </footer>

      <GameModal game={openGame} onClose={() => setOpenGame(null)} />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  );
}
