import type { Game } from "./types";

// Original, made-up games and studios. Nothing here is a real casino product.
export const providers = ["Lantern Studios", "Bagyo Games", "Coral Labs", "Mabuhay Live"];

export const games: Game[] = [
  { id: "golden-carabao", name: "Golden Carabao Deluxe", provider: "Lantern Studios", category: "slots", rtp: 95.5, minBet: 10, isHot: true, engine: "phaser", colors: ["#f59e0b", "#b45309"] },
  { id: "jeepney-jackpot", name: "Jeepney Jackpot", provider: "Bagyo Games", category: "slots", rtp: 95.8, minBet: 2, isNew: true, colors: ["#ef4444", "#7c2d12"] },
  { id: "pearl-of-palawan", name: "Pearl of Palawan", provider: "Coral Labs", category: "slots", rtp: 96.9, minBet: 1, colors: ["#06b6d4", "#1e3a8a"] },
  { id: "fiesta-fortune", name: "Fiesta Fortune", provider: "Lantern Studios", category: "slots", rtp: 96.1, minBet: 5, isHot: true, colors: ["#ec4899", "#6b21a8"] },
  { id: "typhoon-reels", name: "Typhoon Reels", provider: "Bagyo Games", category: "slots", rtp: 95.5, minBet: 10, colors: ["#64748b", "#0f172a"] },
  { id: "mango-madness", name: "Mango Madness", provider: "Coral Labs", category: "slots", rtp: 96.0, minBet: 1, isNew: true, colors: ["#facc15", "#ea580c"] },
  { id: "lucky-lantern", name: "Lucky Lantern", provider: "Lantern Studios", category: "slots", rtp: 97.0, minBet: 2, colors: ["#f97316", "#991b1b"] },
  { id: "volcano-gold", name: "Volcano Gold", provider: "Bagyo Games", category: "slots", rtp: 95.9, minBet: 5, colors: ["#dc2626", "#1c1917"] },
  { id: "coral-kingdom", name: "Coral Kingdom", provider: "Coral Labs", category: "slots", rtp: 96.3, minBet: 2, colors: ["#fb7185", "#0e7490"] },
  { id: "rice-terrace-riches", name: "Rice Terrace Riches", provider: "Lantern Studios", category: "slots", rtp: 96.6, minBet: 1, isNew: true, colors: ["#84cc16", "#14532d"] },
  { id: "sari-sari-spins", name: "Sari-Sari Spins", provider: "Bagyo Games", category: "slots", rtp: 95.7, minBet: 1, colors: ["#a855f7", "#1e1b4b"] },
  { id: "starlight-bay", name: "Starlight Bay", provider: "Coral Labs", category: "slots", rtp: 96.8, minBet: 5, isHot: true, colors: ["#6366f1", "#020617"] },

  { id: "pusoy-royale", name: "Pusoy Royale", provider: "Lantern Studios", category: "table", rtp: 98.2, minBet: 10, colors: ["#10b981", "#064e3b"] },
  { id: "classic-blackjack", name: "Classic Blackjack", provider: "Coral Labs", category: "table", rtp: 99.4, minBet: 20, colors: ["#0f766e", "#042f2e"] },
  { id: "euro-roulette", name: "European Roulette", provider: "Bagyo Games", category: "table", rtp: 97.3, minBet: 10, colors: ["#b91c1c", "#14532d"] },
  { id: "baccarat-gold", name: "Baccarat Gold", provider: "Lantern Studios", category: "table", rtp: 98.9, minBet: 50, isNew: true, colors: ["#ca8a04", "#422006"] },

  { id: "live-sic-bo", name: "Live Sic Bo", provider: "Mabuhay Live", category: "live", rtp: 97.2, minBet: 20, isHot: true, colors: ["#e11d48", "#4c0519"] },
  { id: "live-baccarat", name: "Live Baccarat", provider: "Mabuhay Live", category: "live", rtp: 98.9, minBet: 50, colors: ["#d97706", "#1f2937"] },
  { id: "live-roulette", name: "Live Roulette", provider: "Mabuhay Live", category: "live", rtp: 97.3, minBet: 20, colors: ["#16a34a", "#052e16"] },
  { id: "color-game-live", name: "Color Game Live", provider: "Mabuhay Live", category: "live", rtp: 96.5, minBet: 10, isNew: true, colors: ["#3b82f6", "#facc15"] },

  { id: "deep-sea-hunter", name: "Deep Sea Hunter", provider: "Coral Labs", category: "fishing", rtp: 96.7, minBet: 1, isHot: true, colors: ["#0284c7", "#082f49"] },
  { id: "bangka-catch", name: "Bangka Catch", provider: "Bagyo Games", category: "fishing", rtp: 96.2, minBet: 1, colors: ["#14b8a6", "#134e4a"] },
  { id: "reef-raiders", name: "Reef Raiders", provider: "Coral Labs", category: "fishing", rtp: 96.4, minBet: 2, isNew: true, colors: ["#22d3ee", "#312e81"] },
  { id: "dragon-fishing", name: "Dragon Fishing", provider: "Lantern Studios", category: "fishing", rtp: 95.9, minBet: 2, colors: ["#f43f5e", "#0c0a09"] },
];

export const categoryLabels: Record<string, string> = {
  all: "All games",
  slots: "Slots",
  table: "Table",
  live: "Live casino",
  fishing: "Fishing",
  favorites: "Favorites",
};
