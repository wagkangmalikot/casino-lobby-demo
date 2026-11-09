# Bituin Play — Casino Lobby Demo

A portfolio demo of an online casino lobby: game catalogue with filters, a wallet, a deposit flow with
promo codes, and a playable sample slot. Built with **Next.js 16, React 19, TypeScript, React Query and Tailwind CSS 4**.

> Demo only. The brand, games and studios are made up, and no real money is involved.

## Features

- Game lobby with category tabs, debounced search, provider filter and favorites
- Skeleton loading, empty and error states
- Live wallet balance (real + bonus) in the header
- Deposit modal: payment methods, amount presets, validation, promo codes with live bonus preview
- 12 playable demo slots, each with its own symbols and colors: bets deducted from the wallet, bonus spent first, wins paid back
- Table, live and fishing games listed as "Coming soon"
- Wallet and favorites saved in the browser, so they survive a refresh
- Responsive layout with a bottom-sheet modal on phones; keyboard and screen-reader friendly

Try promo codes **WELCOME100** (100% up to ₱1,000) and **RELOAD25** (25% up to ₱500).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` writes a static site to `out/`.

## How it works

See **[HOW-IT-WORKS.md](./HOW-IT-WORKS.md)** for a walkthrough of the architecture and every file.

---

Built by [Alfie Deligero](https://alfie-deligero.vercel.app).
