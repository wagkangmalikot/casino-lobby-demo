export type Category = "slots" | "table" | "live" | "fishing";

export type Game = {
  id: string;
  name: string;
  provider: string;
  category: Category;
  rtp: number; // return to player, percent
  minBet: number;
  isNew?: boolean;
  isHot?: boolean;
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
