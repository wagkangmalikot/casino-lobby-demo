import type { ReelSymbol } from "@/lib/types";

// Each slot game uses one of three symbol sets. The API always returns the same
// five symbol ranks (seven > star > bell > bar > cherry); a set only changes how they look.
export type IconSet = "classic" | "gems" | "nature";

const S = { width: "100%", height: "100%" } as const;

const ICONS: Record<IconSet, Record<ReelSymbol, React.ReactNode>> = {
  classic: {
    seven: (
      <svg viewBox="0 0 48 48" style={S}><text x="24" y="38" textAnchor="middle" fontSize="38" fontWeight="800" fill="#e11d48" stroke="#7f1d1d" strokeWidth="1.5" fontFamily="var(--font-inter-display)">7</text></svg>
    ),
    star: (
      <svg viewBox="0 0 48 48" style={S}><path d="M24 4l6 13.5 14.5 1.4-11 9.7 3.3 14.3L24 35.4 11.2 42.9l3.3-14.3-11-9.7L18 17.5z" fill="#facc15" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" /></svg>
    ),
    bell: (
      <svg viewBox="0 0 48 48" style={S}><path d="M24 6c-7 0-12 5.5-12 13v9l-4 6h32l-4-6v-9c0-7.5-5-13-12-13z" fill="#38bdf8" stroke="#075985" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="24" cy="39" r="4" fill="#075985" /></svg>
    ),
    bar: (
      <svg viewBox="0 0 48 48" style={S}><rect x="4" y="15" width="40" height="18" rx="4" fill="#7c3aed" stroke="#3b0764" strokeWidth="1.5" /><text x="24" y="29" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="var(--font-inter-display)">BAR</text></svg>
    ),
    cherry: (
      <svg viewBox="0 0 48 48" style={S}><path d="M18 30C20 18 26 10 34 7M32 30c0-9 1-17 2-23" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" /><circle cx="16" cy="34" r="8" fill="#e11d48" stroke="#881337" strokeWidth="1.5" /><circle cx="32" cy="34" r="8" fill="#f43f5e" stroke="#881337" strokeWidth="1.5" /></svg>
    ),
  },
  gems: {
    seven: (
      <svg viewBox="0 0 48 48" style={S}><path d="M8 18l6-10h20l6 10-16 24z" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 18h32M18 8l-4 10 10 24 10-24-4-10" fill="none" stroke="#78350f" strokeWidth="1.2" /><path d="M4 6l3 3M44 6l-3 3" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    star: (
      <svg viewBox="0 0 48 48" style={S}><path d="M6 36l4-20 9 9 5-15 5 15 9-9 4 20z" fill="#eab308" stroke="#713f12" strokeWidth="1.5" strokeLinejoin="round" /><rect x="6" y="36" width="36" height="5" rx="1.5" fill="#ca8a04" stroke="#713f12" strokeWidth="1.5" /></svg>
    ),
    bell: (
      <svg viewBox="0 0 48 48" style={S}><path d="M24 4l17 10v20L24 44 7 34V14z" fill="#10b981" stroke="#064e3b" strokeWidth="1.5" strokeLinejoin="round" /><path d="M24 12l10 6v12l-10 6-10-6V18z" fill="#6ee7b7" opacity="0.6" /></svg>
    ),
    bar: (
      <svg viewBox="0 0 48 48" style={S}><circle cx="24" cy="24" r="17" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" /><circle cx="24" cy="24" r="11" fill="none" stroke="#92400e" strokeWidth="1.5" /><text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="800" fill="#92400e" fontFamily="var(--font-inter-display)">₱</text></svg>
    ),
    cherry: (
      <svg viewBox="0 0 48 48" style={S}><circle cx="24" cy="25" r="15" fill="#e11d48" stroke="#881337" strokeWidth="1.5" /><path d="M16 20a9 9 0 0 1 8-6" fill="none" stroke="#fecdd3" strokeWidth="3" strokeLinecap="round" /></svg>
    ),
  },
  nature: {
    seven: (
      <svg viewBox="0 0 48 48" style={S}><circle cx="24" cy="24" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />{Array.from({ length: 8 }).map((_, i) => <path key={i} d="M24 4v6" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 45} 24 24)`} />)}</svg>
    ),
    star: (
      <svg viewBox="0 0 48 48" style={S}><circle cx="24" cy="26" r="14" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" /><circle cx="19" cy="21" r="4" fill="#fff" /><path d="M10 12l3 3M38 12l-3 3" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    bell: (
      <svg viewBox="0 0 48 48" style={S}>{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="24" cy="14" rx="6" ry="10" fill="#ec4899" stroke="#831843" strokeWidth="1.2" transform={`rotate(${r} 24 24)`} />)}<circle cx="24" cy="24" r="5" fill="#fde047" /></svg>
    ),
    bar: (
      <svg viewBox="0 0 48 48" style={S}><path d="M24 4c10 8 16 16 16 24a16 16 0 0 1-32 0c0-8 6-16 16-24z" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" /><path d="M24 12v28M24 22l-7-5M24 30l8-6" stroke="#14532d" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    cherry: (
      <svg viewBox="0 0 48 48" style={S}><path d="M24 5C17 16 12 22 12 30a12 12 0 0 0 24 0c0-8-5-14-12-25z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="1.5" /><path d="M18 30a6 6 0 0 0 5 6" fill="none" stroke="#e0f2fe" strokeWidth="2.5" strokeLinecap="round" /></svg>
    ),
  },
};

export function SlotSymbol({ set, s }: { set: IconSet; s: ReelSymbol }) {
  return <span className="block h-16 w-16 sm:h-20 sm:w-20">{ICONS[set][s]}</span>;
}

export function SmallSymbol({ set, s }: { set: IconSet; s: ReelSymbol }) {
  return <span className="inline-block h-5 w-5 align-middle">{ICONS[set][s]}</span>;
}

const GAME_SETS: Record<string, IconSet> = {
  "golden-carabao": "gems",
  "lucky-lantern": "gems",
  "volcano-gold": "gems",
  "starlight-bay": "gems",
  "pearl-of-palawan": "nature",
  "typhoon-reels": "nature",
  "mango-madness": "nature",
  "coral-kingdom": "nature",
  "rice-terrace-riches": "nature",
};

export const iconSetFor = (gameId: string): IconSet => GAME_SETS[gameId] ?? "classic";
