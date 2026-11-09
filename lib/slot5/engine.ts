// Slot maths for the 5-reel Phaser game. Pure functions, no React or Phaser,
// so the rules can be read, tested and reused on their own.

export type Sym = "wild" | "seven" | "gem" | "coin" | "bell" | "cherry";
export const SYMBOLS: Sym[] = ["wild", "seven", "gem", "coin", "bell", "cherry"];

export const REELS = 5;
export const ROWS = 3;

// How often each symbol appears on a reel strip (higher = more common).
const WEIGHTS: Record<Sym, number> = { cherry: 8, bell: 7, coin: 6, gem: 5, seven: 3, wild: 2 };

// Pay for 3, 4 or 5 in a row, as a multiple of the line bet.
export const PAYTABLE: Record<Sym, [number, number, number]> = {
  wild: [30, 110, 350],
  seven: [14, 55, 200],
  gem: [8, 35, 110],
  coin: [7, 20, 70],
  bell: [4, 14, 40],
  cherry: [3, 7, 20],
};

// 10 paylines. Each number is the row (0 = top, 1 = middle, 2 = bottom) on reels 1–5.
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
];

/** grid[reel][row] */
export type Grid = Sym[][];

export type LineWin = { line: number; symbol: Sym; count: number; win: number };

const STRIP: Sym[] = SYMBOLS.flatMap((s) => Array(WEIGHTS[s]).fill(s) as Sym[]);

export function randomSymbol(rand: () => number = Math.random): Sym {
  return STRIP[Math.floor(rand() * STRIP.length)];
}

export function randomGrid(rand: () => number = Math.random): Grid {
  return Array.from({ length: REELS }, () => Array.from({ length: ROWS }, () => randomSymbol(rand)));
}

/**
 * Checks one payline from the left. Wilds stand in for any symbol.
 * A line of only wilds pays as wilds.
 */
export function evaluateLine(symbols: Sym[]): { symbol: Sym; count: number } | null {
  const first = symbols.find((s) => s !== "wild") ?? "wild";
  let count = 0;
  for (const s of symbols) {
    if (s === first || s === "wild") count++;
    else break;
  }
  // If the line starts with wilds, they might pay more as wilds than as the symbol after them.
  const leadingWilds = symbols.findIndex((s) => s !== "wild");
  const wildRun = leadingWilds === -1 ? symbols.length : leadingWilds;
  const asSymbol = count >= 3 ? PAYTABLE[first][count - 3] : 0;
  const asWild = wildRun >= 3 ? PAYTABLE.wild[wildRun - 3] : 0;
  if (asWild > asSymbol) return { symbol: "wild", count: wildRun };
  return count >= 3 ? { symbol: first, count } : null;
}

export function evaluateGrid(grid: Grid, lineBet: number): { wins: LineWin[]; total: number } {
  const wins: LineWin[] = [];
  PAYLINES.forEach((rows, line) => {
    const symbols = rows.map((row, reel) => grid[reel][row]);
    const hit = evaluateLine(symbols);
    if (hit) wins.push({ line, ...hit, win: PAYTABLE[hit.symbol][hit.count - 3] * lineBet });
  });
  return { wins, total: wins.reduce((sum, w) => sum + w.win, 0) };
}
