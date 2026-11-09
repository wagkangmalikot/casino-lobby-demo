// Plays the 5-reel slot a million times and prints the long-run payout (RTP)
// and how often a spin wins anything. Run with: npm run simulate
import { evaluateGrid, PAYLINES, randomGrid } from "../lib/slot5/engine";

const SPINS = 1_000_000;
let bet = 0;
let won = 0;
let hits = 0;
for (let i = 0; i < SPINS; i++) {
  const { total } = evaluateGrid(randomGrid(), 1);
  bet += PAYLINES.length;
  won += total;
  if (total > 0) hits++;
}
console.log(`Spins:          ${SPINS.toLocaleString()}`);
console.log(`RTP:            ${((won / bet) * 100).toFixed(2)}%`);
console.log(`Hit frequency:  ${((hits / SPINS) * 100).toFixed(1)}% of spins win something`);
