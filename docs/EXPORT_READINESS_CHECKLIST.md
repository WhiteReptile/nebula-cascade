# Export Readiness Checklist

Use this before handing the project off to Replit, Cursor, or VS Code.
Walk top-to-bottom — each section is independently verifiable.

---

## ✅ Ready Now

- Vite + React 18 + TypeScript SPA — no Lovable runtime required.
- `src/config/` centralizes tunable game/economy/web3 numbers.
- `docs/` covers game design, economy, NFT rules, leaderboard,
  developer handoff, setup.
- Supabase client + types are auto-generated and portable
  (`@supabase/supabase-js`).
- Thirdweb v5 reads against Base (chain `8453`) — read-only NFT queries
  need no secrets.
- `npm run build` and `npx tsc --noEmit` both pass.
- Edge functions (`generate-session`, `submit-score`) deploy via
  Supabase CLI without modification.
- Wallet mismatch UX implemented (`WalletMismatchModal`).
- ETH-primary / USD-secondary pricing wired (CoinGecko, 60s cache).

---

## 🔎 Verify Before Handoff

### Required environment variables

Create `.env` in the new environment with:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

All three are **publishable** values. Never commit a service-role key.

No env variables are required for Thirdweb / Base — the public client ID
and contract address live in `src/config/web3Config.ts`.

### Supabase checks

- [ ] Project still active (`cloud_status` returns `ACTIVE_HEALTHY`).
- [ ] All migrations in `supabase/migrations/` applied — run
      `supabase db push` if exporting outside Lovable.
- [ ] Edge functions deployed: `generate-session`, `submit-score`.
- [ ] RLS enabled on every table; verify with `supabase--linter`.
- [ ] `user_roles` table is the **only** source of role truth — never on
      `profiles`.
- [ ] Anonymous sign-ins **disabled**; email confirm flow matches the
      desired product behavior (do not auto-confirm unless intended).
- [ ] Storage buckets (if any) have correct public/private flags.
- [ ] DB trigger enforcing **max 2 copies per token per wallet** is
      present.
- [ ] DB trigger / column for `cards.sale_lock_until` (24h anti-flip)
      is present.

### Thirdweb / Base checks

- [ ] `WEB3.CHAIN_ID === 8453` (Base mainnet) in
      `src/config/web3Config.ts`.
- [ ] `WEB3.NFT_COLLECTION` matches the deployed collection address.
- [ ] `WEB3.THIRDWEB_CLIENT_ID` is the **publishable** client ID — not a
      secret key.
- [ ] Open `/marketplace` → Mint tab loads NFTs (≤13 RPCs per page).
- [ ] Connect wallet → wallet appears in header, mismatch modal works
      when connecting a wallet linked to a different account.

### NFT marketplace checks

- [ ] Mint tab: skeleton → cards render with image, name, token #,
      supply minted, division badge, ETH price + USD secondary.
- [ ] Claim status pill shows `LIVE` / `STARTS Xh` / `SOLD OUT` /
      `NO CLAIM` correctly.
- [ ] Claim button is disabled with the "Live in Phase 4" tooltip
      until you intentionally enable claims.
- [ ] Trade tab: division filter (V → I + all) works; listings show
      flat 3% fee; cancel/buy flows succeed end-to-end.
- [ ] Cards with missing/unknown `Division` metadata still render
      (no badge, no crash).
- [ ] Pagination only appears when >1 page exists.

### Leaderboard / reward checks

- [ ] `getCurrentPeriod()` returns `YYYY-MM` for today.
- [ ] Score submission round-trips: `generate-session` → match →
      `submit-score` → row appears in DB.
- [ ] Player without an NFT lands in the **No-NFT bracket**.
- [ ] Player with an active card lands in that card's division.
- [ ] `players.main_card_id` distinct from `players.active_card_id`
      and both are settable.
- [ ] Reward distribution math (100% main / 20% secondary) matches
      `docs/LEADERBOARD_AND_REWARDS.md` — verify with at least one
      seeded scenario.

### Mobile / desktop UI smoke tests

Run on a real device or DevTools device emulation.

- [ ] **Desktop ≥ 1280px** — `/`, `/marketplace`, `/leaderboard`,
      `/rewards`, `/roadmap`, `/options`, `/auth` render without
      horizontal scroll.
- [ ] **Tablet ~768px** — main menu carousel still readable; marketplace
      switches to its narrower layout cleanly.
- [ ] **Mobile ~390px** — NFT cards are tappable, names not clipped,
      bottom nav (if any) doesn't overlap content.
- [ ] In-game HUD (`GameHUD`) doesn't overflow on a 360px viewport.
- [ ] Game canvas resizes correctly on rotate.
- [ ] Wallet connect modal is reachable and dismissible on mobile.
- [ ] Reduced-motion preference is respected (no jarring animations).
- [ ] No console errors on initial load of any route (browser
      DevTools → Console).

---

## ⚠️ Known Risks — Pending Config Migration

From `docs/DEVELOPER_HANDOFF.md`. Be aware before touching:

1. **`src/game/pieces.ts`** — `COLS`, `ROWS`, `CELL` are duplicated
   conceptually in `BOARD` but Phaser scenes import directly. Editing
   these can shift the entire play field. Migrate carefully.
2. **`src/components/marketplace/NFTGrid.tsx`** — page-size literal
   not yet wired to `MARKETPLACE.PAGE_SIZE`. Confirm pagination math
   before changing.
3. **Marketing copy** in `src/pages/Rewards.tsx` and
   `src/pages/Roadmap.tsx` — strings "3%" and "40-day" are
   *editorial copy*, intentionally not interpolated. If you change the
   numbers in `economyConfig.ts`, update the copy by hand.
4. **`src/game/GameScene.ts`** — spawn timing, level cadence, and
   scoring multipliers are inlined. Lift to `gameConfig.ts → SCORING`
   / `PACING` only after locking gameplay.
5. **`src/lib/energySystem.ts`** — daily reset uses a `YYYY-MM-DD`
   date comparison, **not** the rolling 24h window the economy spec
   describes. This is a **behavior** discrepancy, not just a constant.
   Fix in a dedicated PR with tests.

---

## 🚫 Do Not Touch

These files are auto-generated, externally managed, or load-bearing in
non-obvious ways. Editing them will break the project or its tooling.

- `src/integrations/supabase/client.ts` — auto-generated.
- `src/integrations/supabase/types.ts` — auto-generated from DB schema.
- `src/components/ui/**` — shadcn primitives. Customize via variants in
  consumer components, not by editing primitives.
- `supabase/config.toml` — only `project_id` lives here; do not change it.
- `.env` — auto-generated under Lovable Cloud. For external deployment,
  recreate it manually using the variable list above.
- `package-lock.json` — let `npm install` manage it.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — base
  configs are tuned for Vite + Vitest; avoid speculative edits.
- Any file under `.lovable/` — internal memory and plan state.

---

## Final Smoke-Test Command Sequence

```bash
npm install
npx tsc --noEmit          # must exit 0
npm run lint              # warnings ok, errors not
npm run test              # all green
npm run build             # must succeed
npm run preview           # open the URL, click through every route
```

If all five pass and the manual checklists above are ticked, the
project is ready to hand off.
