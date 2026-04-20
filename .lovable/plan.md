

## Phase 3a — Live NFT Mint Grid (read-only, metadata-driven, paginated)

Locked decisions: division read from NFT metadata `attributes`, 12 per page, reuse existing `cards` table.

---

### What ships

**1. Marketplace tab refactor** (`src/pages/Marketplace.tsx`)
- Add tab bar at top: **Mint** (primary, live from contract) / **Trade** (existing peer-to-peer listings UI, untouched)
- Default tab: Mint
- Cyber-retro red neon styling, matches Rewards tabs

**2. Live NFT data layer** (`src/lib/thirdweb/nftQueries.ts` — new)
- `useCollectionNFTs(page, pageSize=12)` — wraps `getNFTs(contract, { start, count })` from `thirdweb/extensions/erc1155`
- `useTokenClaimCondition(tokenId)` — wraps `getActiveClaimCondition` (price, currency, max claimable, start time)
- `useTokenSupply(tokenId)` — wraps ERC-1155 `totalSupply`
- All hooks built on Thirdweb's `useReadContract` (built-in React Query caching, deduping, stale-time)
- Stale time: 60s for metadata, 30s for claim conditions

**3. Division extractor** (`src/lib/thirdweb/divisionFromMetadata.ts` — new)
- `extractDivisionFromNFT(nft): Division | null`
- Reads `nft.metadata.attributes` array, finds `trait_type === 'Division'`, normalizes value (`"I"`, `"Division I"`, `"gem_i"` → `'gem_i'`)
- Returns null + console warn if missing/unrecognized → card renders without badge instead of crashing

**4. NFT grid components**
- `src/components/marketplace/NFTGrid.tsx` — grid container
  - Loading state: 12 skeleton cards (matches card dimensions)
  - Empty state: "No cards deployed yet" with neon styling
  - Error state: retry button + error message
  - Pagination controls: Previous / Next + "Page X of Y" (uses existing `Pagination` UI component)
- `src/components/marketplace/NFTCard.tsx` — single card
  - NFT image with red neon border + glow on hover
  - Name (heading)
  - `<DivisionBadge />` if division extracted from metadata
  - Supply: "X / Y minted" (Y from `max_supply` claim condition)
  - Price: **ETH primary** + **USD muted secondary** (uses `useEthUsdPrice()` from `priceFeed.ts`)
  - Claim window status pill: `LIVE` (green glow) / `STARTS IN Xh` (yellow) / `ENDED` (gray)
  - "Claim" button — visible, **disabled**, tooltip: "Live in Phase 4"
  - Subtle scale + glow intensification on hover

**5. Wallet Mismatch modal upgrade** (`src/components/wallet/WalletMismatchModal.tsx` — new)
- Replace toast in `useWalletSync` with proper Radix Dialog
- Title: "Wallet Already Linked"
- Body: "This wallet is bound to another Nebula account. Sign out and switch accounts to use it."
- Single CTA: "Sign Out" → triggers Supabase signOut + Thirdweb disconnect
- Triggered from `useWalletSync` when collision detected
- Cyber-retro red neon styling

---

### Files touched

**New**
- `src/lib/thirdweb/nftQueries.ts`
- `src/lib/thirdweb/divisionFromMetadata.ts`
- `src/components/marketplace/NFTGrid.tsx`
- `src/components/marketplace/NFTCard.tsx`
- `src/components/wallet/WalletMismatchModal.tsx`

**Modified**
- `src/pages/Marketplace.tsx` — add Mint/Trade tab structure, mount `<NFTGrid />` in Mint tab
- `src/hooks/useWalletSync.ts` — replace mismatch toast with modal trigger (lifted state via small Zustand-free React context or boolean state in Marketplace)

**Memory**
- `mem://features/marketplace` — add Mint tab spec, metadata-driven division mapping, pagination rules

### Files untouched
DB (no migration), wallet connect button, auth, game, edge functions, all other pages, existing listings/Trade UI logic.

---

### Performance guarantees
- Max **13 RPC calls per page load**: 1 `getNFTs` batch + 12 individual `getActiveClaimCondition` (Thirdweb dedupes/caches automatically)
- CoinGecko: 1 call per 60s shared across all cards (already cached)
- Pagination prevents the 200+ call scenario
- Skeleton loaders so UI never feels frozen

### What you'll see after Phase 3a
- Marketplace opens to **Mint** tab with up to 12 live NFT cards from Base contract
- Each card: image, name, division badge (from metadata), supply count, ETH+USD price, claim status
- Pagination at bottom if >12 tokens deployed
- **Trade** tab still shows existing peer-to-peer listings, unchanged
- Connecting an already-linked wallet → proper modal (not toast) with Sign Out CTA
- Claim button visible everywhere, inert (Phase 4 wires it)

### Metadata requirement (one-time setup on your end)
Each NFT's metadata JSON needs an `attributes` entry like:
```json
{ "trait_type": "Division", "value": "I" }
```
Accepted values: `I`/`II`/`III`/`IV`/`V`, `Division I`...`Division V`, or `gem_i`...`gem_v`. If missing, card renders without a badge + console warn — no crash.

### Queued after Phase 3a
- **Phase 3b**: Main Card selector UI + 24h cooldown countdown widgets
- **Phase 4**: Live `claimTo` mint flow + DB sync to `cards`
- **Phase 5**: 40% energy roll integration in `generate-session`
- **Phase 6**: 100%/20% reward split math in payout calculator

