export type Category = "slots" | "table" | "live" | "fishing";

export type Game = {
  id: string;
  name: string;
  provider: string;
  category: Category;
  rtp: number; // return to player, percent
  minBet: number;
  volatility: "Low" | "Medium" | "High";
  maxWin?: number; // multiple of the total bet; slots only
  isNew?: boolean;
  isHot?: boolean;
  engine?: "phaser"; // the featured 5-reel game built with Phaser
  thumb?: string; // screenshot used as the card image (playable games only)
  colors: [string, string]; // gradient for the generated tile art
};

export type GameFilters = {
  category: Category | "all" | "favorites";
  search: string;
  provider: string; // "" = all providers
  favorites: string[];
};

export type Wallet = {
  balance: number;
  bonus: number;
};

export type PaymentMethod = "gcash" | "maya" | "card" | "bank";

export type DepositRequest = {
  amount: number;
  method: PaymentMethod;
  promoCode?: string;
};

export type DepositResult = {
  wallet: Wallet;
  bonusAwarded: number;
};

export type SpinResult = {
  reels: [ReelSymbol, ReelSymbol, ReelSymbol];
  win: number;
  wallet: Wallet;
};

export type ReelSymbol = "seven" | "bell" | "bar" | "cherry" | "star";
