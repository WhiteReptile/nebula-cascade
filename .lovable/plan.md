

## Phase 2 Plan — Locked & Ready (with Economy Schema Foundations)

All economy answers locked. Bundling Phase 2 (real wallet connect) with the **schema foundations** needed for the rules you just gave me, so the DB is shaped correctly before NFT data starts flowing in.

---

### Phase 2A — Real Wallet Connect (Thirdweb)

**Provider**
- Wrap `<App />` with `<ThirdwebProvider>` in `src/main.tsx`

**WalletConnect rewrite** (`src/components/wallet/WalletConnect.tsx`)
- Replace stub with Thirdweb `<ConnectButton />`
- Wallets: `inAppWallet({ auth: ['email', 'google'] })` + `createWallet('io.metamask')`, `createWallet('com.coinbase.wallet')`, `createWallet('me.rainbow')`
- `chain={nebulaChain}` (Base 8453) with auto-switch
- Themed to red neon glass-panel aesthetic

**New hook** `src/hooks/useWalletSync.ts`
- Watches `useActiveAccount()`
- On connect:
  1. Pre-check: `players.wallet_address = address AND user_id != current` → if hit, force disconnect + toast: *"This wallet is already linked to another Nebula account."*
  2. If clean → `linkWallet(userId, address, 'thirdweb')` + toast *"Wallet linked ✓"*
- On disconnect → `unlinkWallet(userId)` + toast
- On wrong chain → auto `switchChain(base)`

**Marketplace cleanup**
- Remove Phase 1 verification `useEffect` + toast from `src/pages/Marketplace.tsx`
- Mount `useWalletSync()` at the page level

---

### Phase 2B — Economy Schema Foundations (DB migration)

These are needed before Phase 3 NFT data lands. None of them break existing functionality.

**1. Wallet uniqueness (anti-abuse)**
```sql
CREATE UNIQUE INDEX players_wallet_address_unique
  ON players (LOWER(wallet_address))
  WHERE wallet_address IS NOT NULL;
```

**2. Main card vs. active card split**
```sql
ALTER TABLE players ADD COLUMN main_card_id UUID;
-- active_card_id stays as-is (per-match dynamic)
-- main_card_id = sticky designation, drives 100% reward pool eligibility
```

**3. 24-hour rolling locks (anti-flip + energy)**
```sql
ALTER TABLE cards ADD COLUMN sale_lock_until TIMESTAMPTZ;
ALTER TABLE card_energy ADD COLUMN next_reset_at TIMESTAMPTZ;
-- Migrate existing card_energy.last_reset_at semantics to rolling 24h via app logic
```

**4. Two-copy holding limit per token_id**
- Replace existing `enforce_max_cards_per_player` trigger with one that checks BOTH:
  - Total cards owned ≤ 10
  - Cards owned with same `token_id` ≤ 2

**5. Division correction**
- `src/lib/divisionSystem.ts`: `gem_i.rarity` → `'Legendary'` (was `'Super Rare'`)

**6. ERC-1155 readiness**
- `cards.token_id` already INTEGER ✓ — works for ERC-1155 token IDs
- Add `cards.contract_standard TEXT DEFAULT 'erc1155'` for future-proofing
- Add `cards.max_supply INTEGER` (e.g. King Cold = 80) — informational, contract is source of truth

---

### Phase 2C — ETH/USD Price Display (CoinGecko)

**New module** `src/lib/priceFeed.ts`
- Fetches `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
- Cached 60s in `localStorage` to respect free-tier rate limits (10–30 req/min)
- Exports `useEthUsdPrice()` hook returning `{ ethUsd, loading, error }`
- No API key needed (CoinGecko free tier)

**Memory update**
- `mem://index.md` core line: remove *"NEVER display dollar estimates"* → *"Always display ETH + USD equivalent (CoinGecko feed)"*
- Update `mem://features/card-economy` with all new rules above

*(Actual price rendering in card UIs comes in Phase 3 — this just lays the rails.)*

---

### Files touched

**New**
- `src/hooks/useWalletSync.ts`
- `src/lib/priceFeed.ts`

**Modified**
- `src/main.tsx` — add `ThirdwebProvider`
- `src/components/wallet/WalletConnect.tsx` — full rewrite, real ConnectButton
- `src/pages/Marketplace.tsx` — remove temp verification, mount `useWalletSync()`
- `src/lib/divisionSystem.ts` — Legendary rename
- `src/lib/cardSystem.ts` — add `mainCardId` to types, helper `setMainCard()`

**DB migration** (one file)
- Unique index on `players.wallet_address`
- `players.main_card_id` column
- `cards.sale_lock_until` + `cards.contract_standard` + `cards.max_supply` columns
- `card_energy.next_reset_at` column
- Updated `enforce_max_cards_per_player` trigger (10 total + 2-per-token cap)

**Memory**
- `mem://features/card-economy` (full rewrite with new rules)
- `mem://index.md` (core line update)

### Files untouched
Game logic, auth, Phaser scenes, edge functions, all other pages, leaderboard, marketplace listings UI.

---

### What NOT in this phase (queued)
- **Phase 3**: NFT grid live from Base (image, name, supply, claim phase, ETH+USD display)
- **Phase 3.5**: Main-card UI selector + 24h cooldown countdown widgets
- **Phase 4**: Live `claimTo` mint flow + DB sync to `cards`
- **Phase 5**: 40% energy roll integration with match start (`generate-session` edge fn)
- **Phase 6**: 100%/20% reward split math in payout calculator

### What you'll see after Phase 2 lands
- Marketplace "Connect Wallet" panel shows real Thirdweb modal
- Connect → address persists, survives refresh, wrong chain auto-prompts switch to Base
- Wallet already on another account → blocked with clear toast
- Division I now correctly labeled "Legendary" everywhere
- DB ready to receive NFT data, main-card designations, sale locks, and 24h rolling resets
- ETH/USD price feed hook ready for Phase 3 to consume

### Open mini-question before I execute
**Wallet disconnect behavior** — when a user clicks disconnect:
- (a) Unlink from account immediately (next login = no wallet)
- (b) Just disconnect UI session, keep `wallet_address` saved (next login auto-shows linked wallet)

Recommend **(b)** — the wallet is bound to the account; "disconnect" is just session-level. Re-linking a different wallet would require explicit unlink action. Confirm or pick (a), then I execute Phase 2 in one pass.

