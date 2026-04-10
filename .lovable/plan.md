

# Web3 Readiness: Pearls → Gems Rebrand + NFT Architecture

## Summary
Rename Pearls to Gems across the entire codebase, remove black/void orbs from gameplay, add wallet preparation, and build the Gems NFT-ready data layer with energy system — all without deploying any blockchain code.

## Database Migration

**Migration 1: Rename division enum + add wallet + gems tables**

```sql
-- Rename enum values: pearl_* → gem_*
ALTER TYPE pearl_division RENAME TO gem_division;
ALTER TYPE pearl_division RENAME VALUE 'pearl_v' TO 'gem_v';
-- (repeat for iv, iii, ii, i)

-- Add wallet_address to players
ALTER TABLE players ADD COLUMN wallet_address text;

-- Gems NFT metadata table (prep only, 5 total supply)
CREATE TABLE gems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id integer UNIQUE NOT NULL,          -- 1-5
  division gem_division NOT NULL,
  name text NOT NULL,
  color_hex text NOT NULL,
  owner_wallet text,                          -- future mapping
  owner_player_id uuid REFERENCES players(id),
  metadata jsonb DEFAULT '{}',               -- NFT marketplace traits
  created_at timestamptz DEFAULT now()
);

-- Seed the 5 gems
INSERT INTO gems (token_id, division, name, color_hex, metadata) VALUES
  (1, 'gem_v',   'Ruby Gem',     '#ff3344', '{"element":"fire","tier":5}'),
  (2, 'gem_iv',  'Topaz Gem',    '#ffdd00', '{"element":"electricity","tier":4}'),
  (3, 'gem_iii', 'Sapphire Gem', '#3388ff', '{"element":"water","tier":3}'),
  (4, 'gem_ii',  'Amethyst Gem', '#aa44ff', '{"element":"arcane","tier":2}'),
  (5, 'gem_i',   'Diamond Gem',  '#66ffee', '{"element":"cosmic","tier":1}');

-- Energy system table
CREATE TABLE player_energy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  energy integer DEFAULT 0,
  max_energy integer DEFAULT 0,
  last_reset_at date DEFAULT CURRENT_DATE,
  UNIQUE(player_id)
);

-- RLS for gems and energy tables
```

## Code Changes

### 1. Remove Void/Black orbs from gameplay
- **`src/game/pieces.ts`**: Remove the void entry from `COLORS` array (index 4). Only 4 elements remain: Fire, Water, Electricity, Shadow.
- **`src/game/rendering/orbRenderer.ts`**: Remove the `VOID` constant and its rendering branch.

### 2. Rename Pearl → Gem everywhere
- **`src/lib/divisionSystem.ts`**: Change type `Division` to use `gem_v` through `gem_i`. Update labels ("Gem V"..."Gem I"). Update colors to match new division identity:
  - V → `#ff3344` (Red)
  - IV → `#ffdd00` (Yellow)
  - III → `#3388ff` (Blue)
  - II → `#aa44ff` (Purple)
  - I → `#66ffee` (White/Cyan)
- **`src/components/DivisionBadge.tsx`**: No structural change, just consumes updated constants.
- **`src/pages/Leaderboard.tsx`**, **`src/pages/AdminRewards.tsx`**, **`src/hooks/usePlayerProfile.ts`**, **`src/lib/matchLogger.ts`**: Update type references from `pearl_*` to `gem_*`.

### 3. New file: `src/lib/gemSystem.ts`
- Define `GemMetadata` interface: `tokenId`, `division`, `name`, `colorHex`, `ownerWallet`, `ownerPlayerId`, `traits`
- `getGemsForPlayer(playerId)` — query gems table
- `getGemMetadataForMarketplace(tokenId)` — return ERC-721-compatible metadata JSON structure
- Constants: `TOTAL_GEM_SUPPLY = 5`, `ENERGY_PER_GEM = 2`, target chain config (`BASE_CHAIN_ID = 8453`, fallback `POLYGON_CHAIN_ID = 137`)

### 4. New file: `src/lib/energySystem.ts`
- `getPlayerEnergy(playerId)` — fetch from `player_energy`, auto-reset if `last_reset_at < today`
- `consumeEnergy(playerId, amount)` — deduct energy (for reward match entry)
- `calculateMaxEnergy(ownedGemCount)` — returns `ownedGemCount * 2`
- Players with 0 gems get 0 energy (can play but can't enter reward matches)

### 5. New file: `src/lib/walletSystem.ts`
- Define supported wallet types: `metamask | coinbase_wallet | walletconnect | guest`
- `linkWallet(userId, address, type)` — update players.wallet_address
- `unlinkWallet(userId)` — clear wallet_address
- `getWalletForPlayer(userId)` — read wallet_address
- All stub implementations (no actual Web3 calls)

### 6. New component: `src/components/WalletConnect.tsx`
- UI placeholder with 4 buttons: MetaMask, Coinbase Wallet, WalletConnect, Guest
- Each shows a toast "Coming soon — wallet connection will be available when Web3 launches"
- Displays current wallet_address if linked
- Accessible from a profile/settings area

### 7. Update `src/lib/payoutIntegrations.ts`
- Add `baseChainConfig` and `polygonChainConfig` objects with chain ID, RPC URL placeholders, and Thirdweb contract address placeholder
- Update `thirdwebProvider` stub to reference Base chain config

### 8. Update `src/components/GameHUD.tsx`
- Show energy count if player owns gems
- Add wallet icon/link to WalletConnect page

### 9. Add `/wallet` route in `src/App.tsx`
- New page `src/pages/Wallet.tsx` wrapping the WalletConnect component with player gem display

## What stays the same
- All game mechanics, scoring, speed, and difficulty unchanged
- No blockchain calls, no contract deployments, no minting
- Leaderboard remains server-authoritative
- Game fully playable without wallet or gems

## Files summary
- **New**: `src/lib/gemSystem.ts`, `src/lib/energySystem.ts`, `src/lib/walletSystem.ts`, `src/components/WalletConnect.tsx`, `src/pages/Wallet.tsx`
- **Modified**: `src/game/pieces.ts`, `src/game/rendering/orbRenderer.ts`, `src/lib/divisionSystem.ts`, `src/lib/matchLogger.ts`, `src/lib/payoutIntegrations.ts`, `src/components/GameHUD.tsx`, `src/components/DivisionBadge.tsx`, `src/pages/Leaderboard.tsx`, `src/pages/AdminRewards.tsx`, `src/hooks/usePlayerProfile.ts`, `src/App.tsx`
- **Migration**: 1 SQL migration for enum rename, wallet column, gems table, energy table

