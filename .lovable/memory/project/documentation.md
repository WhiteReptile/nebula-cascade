---
name: documentation
description: Rewards & Rules page UI structure and locked economy copy (rarity + reward pool split, 40% energy roll, 24h rolling reset, ETH+USD display)
type: feature
---
The 'Rewards & Rules' page (`src/pages/Rewards.tsx`) is a tabbed interface with 5 tabs: Divisions, Cards, No-NFT, Rewards, Season. Cyber-retro neon styling matching site theme.

**Scroll behavior:** outermost wrapper uses only `min-h-screen w-full` (no `overflow-y-auto`, no `flex-1`) so the document body handles scrolling natively. Works at 100/120/150% browser zoom. Bottom padding `pb-32` for safe scroll-past room. Two sticky bars: header `top-0`, tabs `top-[60px]`.

**Locked content rules (must stay in sync with `mem://features/card-economy`):**
- Two real differences between divisions: **rarity** (supply %) and **reward pool access** (Main 100% / Secondary 20%). NOT just scarcity.
- Energy: **40% chance per match-start** to consume **2 energy** from active card. **Rolling 24h reset per card** (not global midnight).
- Holding caps: **10 cards per wallet**, **2 copies per token ID**.
- **Main Card** (sticky) = 100% of its division's pool. **Active Card** (per-match) = VFX + division placement.
- **24h sale-lock** on listing/transfer (anti-flip).
- No-NFT bracket uses same 40% energy roll on shared `player_energy` pool.
- All prices shown as **ETH + live USD** (CoinGecko, 60s cache via `src/lib/priceFeed.ts`).
