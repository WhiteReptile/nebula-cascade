

# Rewrite Rewards Page + Update System Constants

## Files to Modify (7 files)

### 1. `src/components/menu/MainMenu.tsx`
- Remove `'SWAP'` from `MENU_ITEMS` array
- Remove `navigate('/swap')` case in `handleSelect`

### 2. `src/lib/divisionSystem.ts`
- Remove point-based `DIVISION_THRESHOLDS`, `getDivisionForPoints()`, `getNextDivisionThreshold()`, `REWARD_TIERS`
- Add `DIVISION_RARITY` map: rarity label + estimated supply % per division (I: ~1%, II: ~4%, III: ~10%, IV: ~25%, V: ~60%)
- Keep colors, labels, priority, `getCurrentPeriod()`

### 3. `src/lib/marketplaceSystem.ts`
- Replace dynamic fee (5/7/10%) with flat **3%** on all sales
- `calculateFee()` → always returns 3

### 4. `src/lib/cardSystem.ts`
- No hard-coded copies constant — supply varies per card, market-determined
- Update docs to reflect variable supply

### 5. `src/pages/Rewards.tsx` — Full Rewrite
Replace the 682-line scroll page with a compact, button-driven single-screen.

**Style**: Same cosmic theme (`bg-[#050510]`, `font-mono`, neon glows), CSS gradients (no canvas).

**Layout**: Header → title → 5 nav pill buttons → dynamic content panel

**Buttons**: `DIVISIONS` · `CARDS` · `NO NFT` · `REWARDS` · `SEASON`

Each section has 300+ words of compacted detail:

- **DIVISIONS**: 5 color-coded cards. Rarity labels, estimated supply %. "Rarity only, not skill. Worst player can own Div I. Must earn leaderboard spot. Supply estimates (~1% to ~60%), market determines final value."
- **CARDS**: 2 energy/card/day, 1 energy = 1 ranked run, max 10 cards = 20 energy/day, UTC midnight reset, no energy = unranked play. Supply per card varies. Art is cosmetic. NFT via Thirdweb on Sui.
- **NO NFT**: Account via Thirdweb (Google/email). 2 energy/day, random activation on game start. Separate leaderboard. Permanent rule: wallet ever held ANY NFT → permanently in NFT leaderboard.
- **REWARDS**: 30% platform fees → pool. 3% marketplace fee + primary sales. 40-day accumulation. Off-chain payout calc. Merkle proof claims.
- **SEASON**: 40-day cycles. Leaderboard resets. Claim period. Beta notice.

### 6. `src/lib/walletSystem.ts` — Update comments to Sui + Thirdweb

### 7. `src/lib/payoutIntegrations.ts` — Update comments to Sui + Thirdweb

