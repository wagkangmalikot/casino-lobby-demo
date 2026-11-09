# How AstraSpin works

A plain-language walkthrough of the code, so you can explain every part of it in an interview.
Read it top to bottom once, then open each file it mentions.

---

## 1. The big picture

AstraSpin is a casino lobby demo. There is no real server. Instead, `lib/api.ts` pretends to be one:
each function waits a few hundred milliseconds and then returns data, just like a network call.

```
Component  →  React Query hook (lib/queries.ts)  →  fake API (lib/api.ts)  →  localStorage
```

- **Components** draw the screen and react to clicks.
- **Hooks in `lib/queries.ts`** ask for data and keep it cached.
- **`lib/api.ts`** holds the "business rules": filters, deposits, promo codes, spins.
- **localStorage** stores the wallet and favorites so they survive a page refresh.

If this connected to a real backend, only `lib/api.ts` would change. Everything above it stays the same.
That separation is the main design idea.

---

## 2. Why React Query?

React Query manages **server data**: anything that comes from an API.
Without it, every component would need its own `useState` for data, loading and errors, plus `useEffect` to fetch.

What it gives us here:

| Feature | Where you see it |
| --- | --- |
| Loading state | Skeleton cards while games load (`games.isPending`) |
| Caching | Switch to "Slots" and back to "All": the second time is instant |
| `keepPreviousData` | While a new search loads, the old grid stays (faded) instead of flashing empty |
| Mutations | Deposit and spin (`useMutation`) |
| Cache updates | After a deposit, the new wallet is written straight into the cache with `setQueryData`, so the header updates without refetching |

**Query keys** (`queryKeys` in `lib/queries.ts`) are how React Query knows which data is which.
The games key includes the filters: `["games", { category, search, provider, favorites }]`.
Change a filter and you get a new key, so React Query fetches and caches that combination separately.

**Likely interview question:** *"What's the difference between `useQuery` and `useMutation`?"*
`useQuery` reads data and runs automatically. `useMutation` changes data and runs only when you call `mutate()`.

---

## 3. The lobby (`app/page.tsx`)

The page keeps the filter choices in `useState`: category, search text and provider.

**Search is debounced.** `useDebounced(search)` in `lib/hooks.ts` waits 300 ms after the last keystroke
before updating. Typing "golden" fires one request, not six.

**Four states are handled for the grid:**
1. Loading the first time: skeleton cards
2. Error: a message and a "Try again" button that calls `refetch()`
3. Empty: "No games found" with a "Clear filters" button (or a hint on the Favorites tab)
4. Data: the grid of `GameCard`s

Handling every state, not just the happy path, is what separates production work from a tutorial.

---

## 4. Favorites (`lib/hooks.ts`)

Favorites live in localStorage. The hook uses `useSyncExternalStore`, React's built-in way to read
from something outside React (here, localStorage) and stay in sync.

Why not just `useState`? Two reasons:
- Every component using `useFavorites()` sees the same list instantly.
- During the build, Next.js renders the page on the server where localStorage doesn't exist.
  The third argument (`() => EMPTY`) gives a safe value for that case, so there's no crash or hydration mismatch.

---

## 5. Deposit (`components/DepositModal.tsx`)

- **Validation happens twice.** The form checks the amount and promo code as you type, so the button
  disables early. `deposit()` in `lib/api.ts` checks again, because you should never trust the front end alone.
- **Promo codes:** `previewBonus()` is shared by both, so the preview and the real result always match.
  - `WELCOME100`: 100% up to ₱1,000, minimum deposit ₱200
  - `RELOAD25`: 25% up to ₱500, minimum deposit ₱100
- **After success**, the mutation's `onSuccess` writes the new wallet into the cache, a toast confirms it,
  and the modal closes. On failure, the error message from the API is shown in a toast.

---

## 6. The slot game (`components/SlotMachine.tsx` + `spin()` in `lib/api.ts`)

1. You press SPIN. All three reels start their blur animation immediately, so it feels responsive.
2. `useSpin().mutate(bet)` calls the API, which:
   - checks you can afford the bet,
   - spends **bonus money first**, then real balance (a common casino rule),
   - picks three random symbols and pays out from the paytable,
   - saves and returns the new wallet.
3. When the result arrives, the reels stop one by one (500 ms, 850 ms, 1200 ms) using `setTimeout`.
4. The timers are stored in a `ref` and cleared if the modal closes, so nothing updates an unmounted component.

The **result is decided by the "server" (the API), not by the animation.** The UI only displays it.
That mirrors how real casino games work, and it's a good point to make in an interview.

**Names and studios.** Every game and studio is original but written in casino-industry style
("Reelforge Studios", "Ace Dynasty Live", "Lucky Lantern 888"). Each game also has a volatility rating, and slots list their
real maximum win. Real provider names and well-known game titles are avoided on purpose: they're trademarks.

**Each slot has its own look.** `components/SlotSymbols.tsx` has three symbol sets (classic, gems, nature)
drawn as inline SVG. `iconSetFor(game.id)` picks the set, and the reel frame uses the game's own colors.
The API still returns the same five symbol ranks for every game; the set only changes how they're drawn.
This is the "data vs. presentation" split again: one set of game rules, many skins.

Table, live and fishing games are listed in the lobby but show **Coming soon**, because the demo only
includes playable slots. Being upfront about that is better than opening the wrong game.

---

## 6b. The featured Phaser slot (Golden Ox Deluxe)

The featured game is a real 5-reel, 3-row, 10-line slot built with **Phaser 3**, the same engine used for
HTML5 casino games. It's split into three layers, each with one job:

```
lib/slot5/engine.ts           The rules (pure TypeScript): reel strips, paylines, wilds, paytable
lib/slot5/createSlotScene.ts  The drawing (Phaser): reels, spin animation, win lines, big-win coins
components/PhaserSlot.tsx     The glue (React): bet buttons, wallet, API call, starts Phaser
```

**How one spin works**

1. You press SPIN (or the Space bar). React calls `scene.windUp()` so the reels move immediately.
2. React calls `useSpin5().mutate(lineBet)`. The API (`spin5()` in `lib/api.ts`) takes 10 × line bet from the wallet,
   creates a random 5×3 grid, and scores it with `evaluateGrid()` from the engine.
3. React passes the result to `scene.spinTo(grid, wins, bigWin)`. Phaser animates and returns a Promise.
4. When the Promise resolves, React shows "You won ₱X" and the list of winning lines.

So **the API decides, Phaser only shows**. You could swap Phaser for plain CSS, or the fake API for a real server,
without touching the other layers.

**The spin animation.** For each reel, the scene builds a long strip: the result on top, random symbols in the
middle, and the current symbols at the bottom. It starts the strip so the bottom is visible, then moves it down
until the result lands in the window. A mask hides everything outside the reel window.

The movement has two phases. First the reel moves at a **constant speed** (a linear tween), so symbols move the same
distance every frame. Then a short `Quad.easeOut` tween slows it to a stop over the last three symbols. Its duration is
chosen so it starts at exactly the same speed, so there's no visible jump between the phases. Every reel uses the same
speed; later reels just get a longer strip, so they stop later and you get the left-to-right stop.

Before spinning, `this.tweens.killTweensOf(container)` stops the little wind-up bounce. Without it, the wind-up and the
spin would fight over the same `y` value and the reel would stutter. That was a real bug on the 5th reel, which starts
its wind-up last. **Two tweens on the same property** is a classic Phaser mistake and a good debugging story for an interview.

**All art is generated in code.** `makeTextures()` uses the browser's Canvas 2D API (gradients, glows, shadows, text)
through `this.textures.createCanvas()`, then Phaser uses each canvas as a texture. That covers the background, the
gold cabinet frame, the logo, the marquee bulbs and all nine symbols. There are no image files to load.

**Symbols follow real slot conventions:** high-value pictures (Wild, 7, Gem, Coin, Bell) plus A, K, Q and J card symbols,
which are common and pay small amounts. The marquee bulbs around the cabinet "chase" using a Phaser timer that
changes each bulb's brightness every 140 ms.

**Turbo and Auto.** Turbo raises the reel speed and shortens the stagger between reels. Auto-spin is a counter in React:
when a spin finishes and the counter is above zero, a `useEffect` starts the next spin. It stops when the counter hits zero,
when you press Stop, or when the balance can't cover the bet. The game logic doesn't change at all.

**The canvas font.** Canvas text can't use CSS classes, so `PhaserSlot.tsx` waits for `document.fonts.ready`, reads the
page's font name from the `--font-inter-display` CSS variable, and passes it into the scene.

**Why Phaser is loaded inside `useEffect`.** Phaser needs `window`, which doesn't exist while Next.js builds the page.
So `PhaserSlot.tsx` does `await import("phaser")` in the browser only, and `createSlotScene.ts` uses
`import type` (types disappear at build time). The game is destroyed when the modal closes, so it doesn't leak memory.

**The maths.** Wins pay left to right, as a multiple of the line bet. Wild stands in for every symbol, and a line
of wilds pays as wilds if that's worth more. Run `npm run simulate` to play a million spins: the long-run payout (RTP)
is about **95.8%**, about 31% of spins win something, and the top prize is 1,300× the total bet (five Wilds on all 10 lines). Real slots land in the same range, and being able to
show the number with a script is a strong interview point.

**Likely interview question:** *"How do you know the game pays fairly?"*
The rules are pure functions in `engine.ts`, and `scripts/simulate-rtp.ts` measures the payout over a million spins.

---

## 7. Accessibility details

- The modal closes on **Escape** or a backdrop click, locks page scroll, and moves keyboard focus into itself.
- Category buttons use `role="tab"` and `aria-selected`; favorite buttons use `aria-pressed`.
- The balance and win messages use `aria-live` so screen readers announce changes.
- Animations are turned off for people who set "reduce motion" in their system settings (see `globals.css`).

---

## 8. File map

```
app/
  layout.tsx          Fonts and the <Providers> wrapper
  providers.tsx       Creates the React Query client and the toast system
  page.tsx            The lobby: banner, filters, game grid, modals
components/
  Header.tsx          Logo, live balance, Deposit button
  GameCard.tsx        One game tile + its loading skeleton
  GameArt.tsx         Generated tile art (no image files needed)
  GameModal.tsx       Game details, launch screen, then the slot
  SlotMachine.tsx     Reels, bet picker, spin logic on the client side
  SlotSymbols.tsx     Three SVG symbol sets and which game uses which
  PhaserSlot.tsx      React wrapper for the Phaser game: bets, spin button, results
  DepositModal.tsx    Payment method, amount, promo code, summary
  Modal.tsx           Reusable accessible dialog / mobile bottom sheet
  Toast.tsx           Small notification system using React context
lib/
  api.ts              The fake backend: all rules live here
  queries.ts          React Query hooks used by components
  hooks.ts            useDebounced and useFavorites
  games.ts            The game catalogue (made-up games and studios)
  slot5/engine.ts     5-reel slot rules: paylines, wilds, paytable
  slot5/createSlotScene.ts  The Phaser scene that draws and animates the reels
scripts/
  simulate-rtp.ts     Plays a million spins and prints the payout (npm run simulate)
  types.ts            TypeScript types shared everywhere
  format.ts           Peso formatting
```

---

## 9. Ideas to extend it (good practice)

- Sync the category and search into the URL (`?category=slots&q=gold`) so links can be shared.
- Add a "Recently played" row, saved like favorites.
- Replace `lib/api.ts` with real API routes and a database.
- Add tests with Vitest + React Testing Library for `previewBonus()` and the deposit form.
