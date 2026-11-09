// A fake backend that runs in the browser.
// Every function returns a Promise and waits a little, like a real network call,
// so the UI has to handle loading and error states properly.
// The wallet is saved in localStorage so it survives a page refresh.

import { games, providers } from "./games";
import type { DepositRequest, DepositResult, Game, GameFilters, SpinResult, ReelSymbol, Wallet } from "./types";

const WALLET_KEY = "bituin-demo-wallet";
const STARTING_WALLET: Wallet = { balance: 500, bonus: 0 };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readWallet(): Wallet {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? (JSON.parse(raw) as Wallet) : { ...STARTING_WALLET };
  } catch {
    return { ...STARTING_WALLET };
  }
}

function writeWallet(w: Wallet) {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(w));
  } catch {
    /* storage blocked: keep going with in-memory value */
  }
}

export async function fetchGames(filters: GameFilters): Promise<Game[]> {
  await wait(450);
  const q = filters.search.trim().toLowerCase();
  return games.filter((g) => {
    if (filters.category === "favorites" && !filters.favorites.includes(g.id)) return false;
    if (filters.category !== "all" && filters.category !== "favorites" && g.category !== filters.category) return false;
    if (filters.provider && g.provider !== filters.provider) return false;
    if (q && !g.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

export async function fetchProviders(): Promise<string[]> {
  await wait(200);
  return providers;
}

export async function fetchWallet(): Promise<Wallet> {
  await wait(250);
  return readWallet();
}

// Promo codes the demo understands.
const PROMOS: Record<string, { percent: number; max: number; minDeposit: number }> = {
  WELCOME100: { percent: 100, max: 1000, minDeposit: 200 },
  RELOAD25: { percent: 25, max: 500, minDeposit: 100 },
};

export function previewBonus(amount: number, code?: string): { bonus: number; error?: string } {
  if (!code) return { bonus: 0 };
  const promo = PROMOS[code.trim().toUpperCase()];
  if (!promo) return { bonus: 0, error: "That promo code isn't valid." };
  if (amount < promo.minDeposit) return { bonus: 0, error: `This code needs a deposit of at least ₱${promo.minDeposit}.` };
  return { bonus: Math.min(Math.round((amount * promo.percent) / 100), promo.max) };
}

export const DEPOSIT_MIN = 100;
export const DEPOSIT_MAX = 50000;

export async function deposit(req: DepositRequest): Promise<DepositResult> {
  await wait(900);
  if (!Number.isFinite(req.amount) || req.amount < DEPOSIT_MIN) throw new Error(`The minimum deposit is ₱${DEPOSIT_MIN}.`);
  if (req.amount > DEPOSIT_MAX) throw new Error(`The maximum deposit is ₱${DEPOSIT_MAX.toLocaleString()}.`);
  const { bonus, error } = previewBonus(req.amount, req.promoCode);
  if (error) throw new Error(error);

  const w = readWallet();
  const next = { balance: w.balance + req.amount, bonus: w.bonus + bonus };
  writeWallet(next);
  return { wallet: next, bonusAwarded: bonus };
}

// --- Mini slot game --------------------------------------------------------

const REEL: ReelSymbol[] = ["cherry", "cherry", "cherry", "bar", "bar", "bell", "bell", "star", "seven"];
const PAYOUT: Record<ReelSymbol, number> = { seven: 25, star: 12, bell: 8, bar: 5, cherry: 3 };

export async function spin(bet: number): Promise<SpinResult> {
  await wait(300);
  const w = readWallet();
  const total = w.balance + w.bonus;
  if (bet <= 0) throw new Error("Choose a bet first.");
  if (bet > total) throw new Error("Not enough balance. Make a deposit to keep playing.");

  // Spend bonus money first, then real balance (a common casino rule).
  const fromBonus = Math.min(w.bonus, bet);
  const bonus = w.bonus - fromBonus;
  let balance = w.balance - (bet - fromBonus);

  const pick = () => REEL[Math.floor(Math.random() * REEL.length)];
  const reels: [ReelSymbol, ReelSymbol, ReelSymbol] = [pick(), pick(), pick()];

  let win = 0;
  if (reels[0] === reels[1] && reels[1] === reels[2]) win = bet * PAYOUT[reels[0]];
  else if (reels.filter((s) => s === "cherry").length === 2) win = bet; // two cherries: money back

  balance += win;
  const next = { balance, bonus };
  writeWallet(next);
  return { reels, win, wallet: next };
}

export function resetWallet(): Wallet {
  writeWallet({ ...STARTING_WALLET });
  return { ...STARTING_WALLET };
}
