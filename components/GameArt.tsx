import type { Game } from "@/lib/types";

// Generated tile art: a gradient, a pattern based on the category, and the game's initials.
export function GameArt({ game, className = "" }: { game: Game; className?: string }) {
  const [a, b] = game.colors;
  const initials = game.name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w)) // skip small words like "of"
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${a} 0%, ${b} 100%)` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="xMidYMid slice">
        {game.category === "slots" && [20, 50, 80].map((x) => <rect key={x} x={x - 11} y="18" width="22" height="64" rx="5" fill="none" stroke="white" strokeWidth="2.5" />)}
        {game.category === "table" && <ellipse cx="50" cy="62" rx="44" ry="26" fill="none" stroke="white" strokeWidth="2.5" />}
        {game.category === "live" && [14, 26, 38].map((r) => <circle key={r} cx="80" cy="20" r={r} fill="none" stroke="white" strokeWidth="2" />)}
        {game.category === "fishing" && [30, 50, 70].map((y) => <path key={y} d={`M0 ${y} Q25 ${y - 8} 50 ${y} T100 ${y}`} fill="none" stroke="white" strokeWidth="2.5" />)}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
      <span className="absolute inset-0 grid place-items-center font-display text-4xl font-bold tracking-tight text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
        {initials}
      </span>
    </div>
  );
}
