# Developer Handoff

This document is the entry point for any new developer or AI coding tool.

## TL;DR

- Vite + React 18 + TS + Tailwind + shadcn/ui SPA.
- Phaser 3 for the game engine, mounted inside React.
- Supabase backend (Postgres + Auth + Edge Functions) provisioned via
  Lovable Cloud — **but the project is portable**: the Supabase client and
  types are standard `@supabase/supabase-js` and work outside Lovable.
- Thirdweb v5 for Base (chain 8453) Web3 reads.

## Folder Map

```
src/
├── components/
│   ├── game/         → React HUD overlay (NOT Phaser)
│   ├── menu/         → Main-menu carousel
│   ├── marketplace/  → Mint + Trade UI
│   ├── wallet/       → Thirdweb wallet UI
│   ├── shared/       → Cross-page UI
│   └── ui/           → shadcn primitives — DO NOT EDIT
├── config/           → ★ Tunable constants (gameplay/economy/web3)
├── game/             → Phaser engine code (no React)
│   ├── logic/        → Pure logic (chains, physics, reorganizer)
│   └── rendering/    → Pure draw functions
├── hooks/            → React hooks
├── integrations/
│   └── supabase/     → AUTO-GENERATED — do not edit
├── lib/              → App libraries
│   ├── thirdweb/     → Web3 client + queries
│   ├── cardSystem.ts          → NFT card ownership
│   ├── energySystem.ts        → Per-card energy pool
│   ├── divisionSystem.ts      → Rarity tiers
│   ├── marketplaceSystem.ts   → Listings + 3% fee
│   ├── matchLogger.ts         → Score submission
│   ├── playerSegmentation.ts  → Bracket assignment
│   ├── priceFeed.ts           → ETH/USD via CoinGecko
│   ├── payoutIntegrations.ts  → Stripe/Coinbase/Circle adapters
│   └── walletSystem.ts        → Thirdweb glue
├── pages/            → One file per route
└── test/             → Vitest setup + examples

docs/                 → ★ This folder
supabase/             → Migrations + edge functions
```

★ = touch first when tuning.

## Critical Rules

1. **Never edit** `src/integrations/supabase/{client,types}.ts` — auto-generated.
2. **Never** put colors/hex/rgb directly in components — use HSL tokens
   from `src/index.css` and `tailwind.config.ts`.
3. **All gameplay/economy numbers** belong in `src/config/`. If you find a
   magic number elsewhere, lift it into config.
4. **Roles must NOT** live on the `profiles` table — use a dedicated
   `user_roles` table with a `SECURITY DEFINER` function (see Supabase
   policy in `.lovable/memory/`).
5. The `@/` import alias resolves to `src/`. Use it.

## React ↔ Phaser Bridge

Singleton EventEmitter at `src/game/events.ts`. Events: `hud`,
`nextPiece`, `gameover`, `matchEnd`, `chainCombo`, `triColor`,
`elementalCascade`, `pause`, `restart`, `gravity`.

## Future Backend Requirements

- Move secondary trading on-chain (currently `marketplace_listings` table).
- Wire Stripe/Coinbase/Circle keys for real payouts (placeholders in
  `payoutIntegrations.ts`).
- Enable claim phases UI when collection enters Phase 4 (the Claim button
  is currently disabled with a tooltip).
- Background worker for energy reset reconciliation if real-time gets noisy.

## Testing

```bash
npm run test           # vitest run
npm run test:watch
npm run lint
npm run build          # smoke-test production build
```

## Pending Config Migration

These constants are intentionally **not** yet wired to `src/config/`
because they have wide reach or non-obvious semantics. Migrate one at a
time, with a build + visual smoke-test after each:

- `src/game/pieces.ts` → `COLS`, `ROWS`, `CELL` — duplicated as
  `BOARD.COLS/ROWS/CELL` in config but Phaser scenes import directly from
  `pieces.ts`. Risky to touch without auditing every Phaser-side import.
- `src/components/marketplace/NFTGrid.tsx` → page-size literal — move to
  `MARKETPLACE.PAGE_SIZE` after confirming no off-by-one in pagination UI.
- `src/pages/Rewards.tsx` & `src/pages/Roadmap.tsx` → marketing copy
  contains hardcoded "3%" and "40-day" strings. These are *display copy*,
  not logic — leaving as-is to keep editorial control over the wording.
- `src/game/GameScene.ts` → spawn timing, level-up cadence, and scoring
  multipliers are inlined in the scene. Lift to `gameConfig.ts → SCORING`
  / `PACING` once the gameplay is locked in.
- `src/lib/energySystem.ts` → daily reset uses `YYYY-MM-DD` comparison
  (not the rolling 24h window described in the economy spec). This is a
  **behavior** discrepancy, not just a constant — fix in a dedicated PR.
