import type { Game } from "./types";

// Original, made-up games and studios written in casino-industry style.
// None of these are real providers or real game titles.
export const providers = ["Bituin Originals", "Reelforge Studios", "Fortune Tide Gaming", "Lantern Gaming", "Ace Dynasty Live"];

export const providerTaglines: Record<string, string> = {
  "Bituin Originals": "In-house featured games",
  "Reelforge Studios": "High-volatility video slots",
  "Fortune Tide Gaming": "Ocean slots and fishing arcades",
  "Lantern Gaming": "Asian-themed slots and tables",
  "Ace Dynasty Live": "Live dealer studio",
};

// The simple demo slots pay up to 25× the bet (three sevens); the featured Phaser slot up to 1,300×
// (five wilds on all 10 lines).
export const games: Game[] = [
  { id: "golden-carabao", name: "Carabao Gold Deluxe", provider: "Bituin Originals", category: "slots", rtp: 95.8, minBet: 10, volatility: "High", maxWin: 1300, isHot: true, engine: "phaser", colors: ["#f59e0b", "#b45309"] },
  { id: "jeepney-jackpot", name: "Jeepney Jackpot Express", provider: "Reelforge Studios", category: "slots", rtp: 95.8, minBet: 5, volatility: "Medium", maxWin: 25, isNew: true, colors: ["#ef4444", "#7c2d12"] },
  { id: "pearl-of-palawan", name: "Palawan Pearl Riches", provider: "Fortune Tide Gaming", category: "slots", rtp: 96.9, minBet: 5, volatility: "Low", maxWin: 25, colors: ["#06b6d4", "#1e3a8a"] },
  { id: "fiesta-fortune", name: "Fiesta Fortune 777", provider: "Lantern Gaming", category: "slots", rtp: 96.1, minBet: 5, volatility: "Medium", maxWin: 25, isHot: true, colors: ["#ec4899", "#6b21a8"] },
  { id: "typhoon-reels", name: "Typhoon Wilds", provider: "Reelforge Studios", category: "slots", rtp: 95.5, minBet: 10, volatility: "High", maxWin: 25, colors: ["#64748b", "#0f172a"] },
  { id: "mango-madness", name: "Mango Mania Hold & Win", provider: "Fortune Tide Gaming", category: "slots", rtp: 96.0, minBet: 5, volatility: "Medium", maxWin: 25, isNew: true, colors: ["#facc15", "#ea580c"] },
  { id: "lucky-lantern", name: "Lucky Lantern 888", provider: "Lantern Gaming", category: "slots", rtp: 97.0, minBet: 5, volatility: "Low", maxWin: 25, colors: ["#f97316", "#991b1b"] },
  { id: "volcano-gold", name: "Volcano Blaze Jackpot", provider: "Reelforge Studios", category: "slots", rtp: 95.9, minBet: 5, volatility: "High", maxWin: 25, colors: ["#dc2626", "#1c1917"] },
  { id: "coral-kingdom", name: "Coral Kingdom Treasures", provider: "Fortune Tide Gaming", category: "slots", rtp: 96.3, minBet: 5, volatility: "Medium", maxWin: 25, colors: ["#fb7185", "#0e7490"] },
  { id: "rice-terrace-riches", name: "Rice Terrace Fortunes", provider: "Lantern Gaming", category: "slots", rtp: 96.6, minBet: 5, volatility: "Low", maxWin: 25, isNew: true, colors: ["#84cc16", "#14532d"] },
  { id: "sari-sari-spins", name: "Sari-Sari Cash Spins", provider: "Reelforge Studios", category: "slots", rtp: 95.7, minBet: 5, volatility: "Medium", maxWin: 25, colors: ["#a855f7", "#1e1b4b"] },
  { id: "starlight-bay", name: "Moonlit Bay Riches", provider: "Fortune Tide Gaming", category: "slots", rtp: 96.8, minBet: 5, volatility: "Medium", maxWin: 25, isHot: true, colors: ["#6366f1", "#020617"] },

  { id: "pusoy-royale", name: "Pusoy Royale", provider: "Lantern Gaming", category: "table", rtp: 98.2, minBet: 10, volatility: "Low", colors: ["#10b981", "#064e3b"] },
  { id: "classic-blackjack", name: "Blackjack Classic", provider: "Lantern Gaming", category: "table", rtp: 99.4, minBet: 20, volatility: "Low", colors: ["#0f766e", "#042f2e"] },
  { id: "euro-roulette", name: "European Roulette Pro", provider: "Reelforge Studios", category: "table", rtp: 97.3, minBet: 10, volatility: "Medium", colors: ["#b91c1c", "#14532d"] },
  { id: "baccarat-gold", name: "Speed Baccarat", provider: "Lantern Gaming", category: "table", rtp: 98.9, minBet: 50, volatility: "Low", isNew: true, colors: ["#ca8a04", "#422006"] },

  { id: "live-sic-bo", name: "Live Sic Bo Deluxe", provider: "Ace Dynasty Live", category: "live", rtp: 97.2, minBet: 20, volatility: "Medium", isHot: true, colors: ["#e11d48", "#4c0519"] },
  { id: "live-baccarat", name: "Live Baccarat Squeeze", provider: "Ace Dynasty Live", category: "live", rtp: 98.9, minBet: 50, volatility: "Low", colors: ["#d97706", "#1f2937"] },
  { id: "live-roulette", name: "Live Auto Roulette", provider: "Ace Dynasty Live", category: "live", rtp: 97.3, minBet: 20, volatility: "Medium", colors: ["#16a34a", "#052e16"] },
  { id: "color-game-live", name: "Live Color Game", provider: "Ace Dynasty Live", category: "live", rtp: 96.5, minBet: 10, volatility: "Medium", isNew: true, colors: ["#3b82f6", "#facc15"] },

  { id: "deep-sea-hunter", name: "Deep Sea Hunter", provider: "Fortune Tide Gaming", category: "fishing", rtp: 96.7, minBet: 1, volatility: "High", isHot: true, colors: ["#0284c7", "#082f49"] },
  { id: "bangka-catch", name: "Bangka Catch Arcade", provider: "Fortune Tide Gaming", category: "fishing", rtp: 96.2, minBet: 1, volatility: "Medium", colors: ["#14b8a6", "#134e4a"] },
  { id: "reef-raiders", name: "Reef Raiders", provider: "Fortune Tide Gaming", category: "fishing", rtp: 96.4, minBet: 2, volatility: "Medium", isNew: true, colors: ["#22d3ee", "#312e81"] },
  { id: "dragon-fishing", name: "Dragon Tide Fishing", provider: "Lantern Gaming", category: "fishing", rtp: 95.9, minBet: 2, volatility: "High", colors: ["#f43f5e", "#0c0a09"] },
];

export const categoryLabels: Record<string, string> = {
  all: "All games",
  slots: "Slots",
  table: "Table",
  live: "Live casino",
  fishing: "Fishing",
  favorites: "Favorites",
};
