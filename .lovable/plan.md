

## Update Rewards & Rules — Economy Corrections + Scroll Fix + Marketplace Roadmap

### 1. Content updates in `src/pages/Rewards.tsx`

**Divisions tab — fix the "only difference is scarcity" claim**

Replace the current paragraph that says scarcity is the only difference. The two real differences are **rarity** (supply) and **reward pool eligibility** (Main Card = 100%, Secondary Cards = 20%). Updated copy:

> "Two things separate divisions: **rarity** (how many cards exist) and **reward pool access** (how the season prize money flows to you). Gameplay itself is identical across all five tiers — same rules, same energy, same scoring. A Division V player can outscore a Division I player. What changes is which leaderboard you compete in and how you earn from the prize pool."
>
> "Your **Main Card** earns you **100%** of its division's reward pool (if you rank). Any other cards you hold from different divisions earn **20%** of those pools. Hold a deep roster, earn from multiple brackets — but each extra card costs energy to activate."

**Cards tab — full rewrite to match locked economy**

Current copy is wrong on several key rules. Replace with:
- **2 energy per match-start roll**: each match has a **40% chance** to consume 2 energy from your active card (not "2 per day automatic")
- **24-hour rolling reset per card** (not UTC midnight global) — each card's energy refills 24h after last consumption
- **Max 10 cards per wallet**, **max 2 copies of any single token_id**
- **Main Card vs Active Card**: Main = sticky designation for 100% reward pool eligibility; Active = per-match card driving VFX & division placement
- **24h sale-lock**: listing or transferring a card locks it from in-game use for 24 hours (anti-flip)
- **Energy depleted = card unusable** until its rolling reset
- Replace KeyFacts grid with: `40% ROLL` / `2 ENERGY` / `10 MAX CARDS` / `2 COPY CAP`

**No-NFT tab — minor correction**
- Energy mechanics: free players use `player_energy` fallback; same 40% trigger logic, same fluid wallet-based bracket
- Keep existing copy mostly intact, just align the "50% chance" line with the **40%** locked rule

**Rewards tab — add Main/Secondary split clarity**
- Keep 30% pool funding from fees
- Add explicit callout: "**Main Card** = 100% of one division's pool. **Secondary Cards** = 20% of each additional division's pool. Both require leaderboard placement."
- Add "Pricing displayed in **ETH + USD equivalent** (live CoinGecko feed)"

**Season tab** — keep mostly intact, no major rule changes

### 2. Scroll fix (the actual bug)

Root cause: the page uses `min-h-screen` + `overflow-y-auto` on the outermost div with multiple `sticky` headers. At 120% browser zoom the sticky elements + flex layout collapse the scroll context.

Fix:
- Change outermost wrapper from `min-h-screen w-full overflow-y-auto flex flex-col` to `min-h-screen w-full` (let the document body handle scroll naturally)
- Remove `flex-1` on content area, replace with normal block layout
- Keep sticky header + sticky tab bar but verify their `top` offsets stack correctly (header `top-0`, tabs `top-[60px]`)
- Add `pb-32` to bottom of content for safe scroll-past room at any zoom

This makes scroll work at 100%, 120%, 150% zoom and on all viewport sizes.

### 3. Memory update
- `mem://project/documentation` — refresh to reflect the corrected Rewards content (rarity + rewards pool as the two differentiators, 40% energy roll, 24h rolling reset, Main/Secondary split, ETH+USD display)

### Files touched
- `src/pages/Rewards.tsx` — content rewrites for Divisions/Cards/No-NFT/Rewards tabs + scroll layout fix
- `mem://project/documentation` — sync to new copy

### Files untouched
Everything else — game, marketplace, wallet, DB, edge functions.

---

## What's next for Marketplace × Thirdweb

Phase 2 (wallet connect + DB schema) is live. Recommended next step:

### Phase 3 — Live NFT Grid (read-only)
Pull your collection from Base (`0xa89C…aa07e`) and render it inside the Marketplace.

**What it does**
- Fetch all token IDs from your ERC-1155 contract via Thirdweb's `getNFTs()` / `getActiveClaimCondition()`
- For each token: image, name, description, total minted, max supply, current claim phase (price + start time)
- Render as a grid card layout matching Nebula's red neon aesthetic
- Show ETH price + live USD equivalent (using the `priceFeed.ts` already built)
- "Claim" button is visible but disabled (Phase 4 wires it live)

**Why this before claim/mint**
- Lets you visually QA the contract integration before money moves
- Confirms metadata, images, supply numbers match what's deployed on Base
- Gets the UI shell ready so Phase 4 is just wiring the transaction

**After Phase 3**
- **Phase 3.5**: Main Card selector UI + 24h cooldown countdown widgets
- **Phase 4**: Live `claimTo` mint flow + DB sync to `cards` table on success
- **Phase 5**: Match-start 40% energy roll integration (`generate-session` edge fn)
- **Phase 6**: 100%/20% reward split math in payout calculator

Approve this plan and I'll execute the Rewards updates + scroll fix in one pass, then we line up Phase 3 separately.

