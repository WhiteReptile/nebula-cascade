---
name: card-economy
description: Cards as ERC-1155 NFTs on Base. Rarity divisions, 2-copy wallet cap, main/secondary card reward split (100%/20%), 24h rolling locks, 40% energy roll.
type: feature
---
**Cards = NFTs on Base** (ERC-1155, contract `0xa89C…aa07e`). Each card has `token_id`, `division`, `energy`, `max_energy`, `rarity`.

**Divisions (rarity-based, NOT skill):**
- I: Legendary (~1%)
- II: Very Rare (~4%)
- III: Rare (~10%)
- IV: Uncommon (~25%)
- V: Common (~60%)

**Holding rules:**
- Max 10 cards total per player
- Max 2 copies of any single `token_id` per wallet (DB trigger enforced)
- Anti-flip: 24h sale-lock on a card after listing/transfer (`cards.sale_lock_until`)

**Main vs Active card:**
- `players.main_card_id` — sticky designation, qualifies for 100% of that division's reward pool
- `players.active_card_id` — per-match dynamic, drives in-game VFX & division placement
- Holding cards in OTHER divisions earns 20% of those reward pools (eligibility via leaderboard rank)

**Energy:**
- Per-card energy via `card_energy` (`energy`, `max_energy`, `next_reset_at`)
- 40% chance per match-start to consume 2 energy
- Rolling 24h reset PER CARD (not global daily)
- `player_energy` fallback for the No-NFT bracket

**Marketplace:**
- Flat 3% fee on secondary sales (off-chain via `marketplace_listings`)
- Primary sales via collection's claim phases on Base

**Pricing display:**
- Always show ETH + USD equivalent (CoinGecko free API, 60s cache via `src/lib/priceFeed.ts`)
