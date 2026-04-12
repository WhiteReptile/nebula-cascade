

# Phase 1: Cards Economy System — Implementation Plan

## Overview
Replace the Gem system with Cards, add per-card energy, internal marketplace, session-based validation, and avg-top-3 leaderboard ranking. No real payments, no NFT minting, no blockchain, no production anti-cheat.

---

## Step 1: Database Migrations

One migration with all schema changes:

**Modify `gems` table → rename to `cards`:**
- `ALTER TABLE gems RENAME TO cards`
- Add columns: `image_url` (text, nullable), `flavor_text` (text, default ''), `price_cents` (int, default 0), `is_active` (boolean, default false)
- Recreate RLS policies under new table name

**Modify `players`:**
- Add `active_card_id` (uuid, nullable)

**New table `card_energy`:**
- `id` uuid PK, `card_id` uuid UNIQUE NOT NULL, `energy` int default 2, `max_energy` int default 2, `last_reset_at` date default CURRENT_DATE
- RLS: owner can view/update own (via card→player ownership join)

**New table `marketplace_listings`:**
- `id` uuid PK, `card_id` uuid, `seller_player_id` uuid, `price_cents` int, `fee_percent` real default 5, `listed_at` timestamptz default now(), `sold_at` timestamptz nullable, `buyer_player_id` uuid nullable, `status` text default 'active'
- RLS: everyone views active listings, sellers manage own

**New table `game_sessions`:**
- `id` uuid PK, `player_id` uuid, `card_id` uuid nullable, `seed` text, `started_at` timestamptz default now(), `completed` boolean default false, `cooldown_until` timestamptz nullable
- RLS: players manage own sessions

**Modify `match_logs`:**
- Add `card_id` uuid nullable, `session_seed` text nullable, `session_id` uuid nullable

**Modify `leaderboard`:**
- Add `avg_top3_score` bigint default 0

**Modify `reward_periods`:**
- Add `starts_at`, `ends_at`, `freeze_ends_at`, `payout_at` (timestamptz, nullable)

**Add enum values to `reward_period_status`:**
- `frozen`, `pending_payout`, `paid`

**Trigger:** Enforce max 10 cards per player (before INSERT/UPDATE on cards)

**Indexes:** `card_energy(card_id)`, `marketplace_listings(status)`, `game_sessions(player_id, completed)`

---

## Step 2: Core Libraries

**Delete** `src/lib/gemSystem.ts`

**Create** `src/lib/cardSystem.ts`:
- `CardMetadata` interface with all card fields
- Constants: `ENERGY_PER_CARD = 2`, `MAX_CARDS_PER_PLAYER = 10`
- `getCardsForPlayer(playerId)` — query cards table
- `getActiveCard(playerId)` — query players.active_card_id → cards
- `setActiveCard(playerId, cardId)` — update players.active_card_id
- `getHighestDivisionCard(cards)` — compare division priority (gem_i > gem_ii > ... > gem_v)

**Rewrite** `src/lib/energySystem.ts`:
- Per-card functions: `getCardEnergy(cardId)`, `consumeCardEnergy(cardId)`, `initCardEnergy(cardId)`
- Daily reset per card independently

**Update** `src/lib/divisionSystem.ts`:
- Change labels: `'Gem V'` → `'Division V'` through `'Division I'`
- Keep DB enum values as `gem_v`..`gem_i` (renaming enums is destructive)
- Add `DIVISION_PRIORITY` map for ranking comparisons
- Change `getCurrentPeriod()` to monthly format (`YYYY-MM`) instead of weekly

**Update** `src/lib/matchLogger.ts`:
- Include `card_id`, `session_seed`, `session_id` in match log inserts
- After inserting, compute avg_top3_score from player's top 3 match scores and update leaderboard

---

## Step 3: Marketplace Logic

**Create** `src/lib/marketplaceSystem.ts`:
- `calculateFee(sellerId, cardId)`: queries recent sales — 5% base, 7% if resold within 7 days, 10% if 2+ fast resales
- `listCard(cardId, priceCents)`: insert marketplace_listings, mark card is_active=false
- `buyCard(listingId, buyerPlayerId)`: transfer card ownership, create card_energy for buyer, apply fee
- `cancelListing(listingId)`: update status to 'cancelled'

---

## Step 4: Edge Functions

**Create** `supabase/functions/generate-session/index.ts`:
- Validate auth JWT in code
- Check 60s cooldown (query latest completed game_session)
- Generate crypto seed (`crypto.randomUUID()`)
- Insert game_sessions row
- Return `{ sessionId, seed }`

**Create** `supabase/functions/submit-score/index.ts`:
- Validate auth + session ownership + not already completed
- Accept score, level, combo stats, card_id
- Run anti-cheat flags (same heuristics as current matchLogger)
- Insert match_logs (using service role key — bypasses RLS)
- Compute avg_top3_score, update leaderboard
- Mark session completed, set cooldown_until
- Update player stats

---

## Step 5: UI Updates

**`src/components/game/GameHUD.tsx`:**
- Import cardSystem, fetch active card on mount
- Show active card placeholder image + energy `⚡ X/2` in left panel (between Division and spacer)
- Replace "WALLET & GEMS" button → "CARDS" in game-over overlay

**`src/components/game/DivisionBadge.tsx`:**
- Labels now come from updated divisionSystem (Division V instead of Gem V) — no component changes needed

**`src/pages/Wallet.tsx`:**
- Rename to Cards page: show owned cards (max 10), per-card energy, active card toggle
- Keep wallet address section

**`src/pages/Marketplace.tsx`:**
- Replace placeholder with functional listing browser
- Show card art placeholder, division, price, fee tier
- Buy/sell/cancel actions (internal only, no real payments)

**`src/pages/Rewards.tsx`:**
- Show current 30-day competition period with countdown
- Show division reward pool info
- Show eligibility based on active card
- Language: "compete for rewards from the pool"

**`src/pages/Leaderboard.tsx`:**
- Division tabs use new labels (Division V, etc.)
- Rank by `avg_top3_score` instead of `total_score`
- Show avg_top3_score column

**`src/pages/AdminRewards.tsx`:**
- 30-day periods instead of weekly
- New status badges: frozen, pending_payout, paid
- Revenue tracking section (card sales + marketplace fees)

**`src/components/menu/MainMenu.tsx`:**
- Change 'WALLET' → 'CARDS' in MENU_ITEMS
- Route to `/cards`

**`src/App.tsx`:**
- Add `/cards` route pointing to updated Wallet/Cards page
- Keep `/wallet` redirecting to `/cards`

**`src/hooks/usePlayerProfile.ts`:**
- Fetch active card info alongside division

---

## Step 6: GameScene Integration

**`src/game/GameScene.ts`** and **`src/components/game/CosmicGame.tsx`:**
- On game start: call `generate-session` edge function, store sessionId+seed
- On game over: call `submit-score` edge function instead of client-side matchLogger
- Pass card_id from active card selection

---

## Files Summary

| Action | File |
|--------|------|
| Migration | DB schema (all changes in one migration) |
| Delete | `src/lib/gemSystem.ts` |
| Create | `src/lib/cardSystem.ts` |
| Create | `src/lib/marketplaceSystem.ts` |
| Create | `supabase/functions/generate-session/index.ts` |
| Create | `supabase/functions/submit-score/index.ts` |
| Modify | `src/lib/energySystem.ts` |
| Modify | `src/lib/divisionSystem.ts` |
| Modify | `src/lib/matchLogger.ts` |
| Modify | `src/hooks/usePlayerProfile.ts` |
| Modify | `src/components/game/GameHUD.tsx` |
| Modify | `src/components/game/CosmicGame.tsx` |
| Modify | `src/game/GameScene.ts` |
| Modify | `src/pages/Wallet.tsx` |
| Modify | `src/pages/Marketplace.tsx` |
| Modify | `src/pages/Rewards.tsx` |
| Modify | `src/pages/Leaderboard.tsx` |
| Modify | `src/pages/AdminRewards.tsx` |
| Modify | `src/components/menu/MainMenu.tsx` |
| Modify | `src/App.tsx` |

Each step will be implemented sequentially, confirmed before moving to the next.

