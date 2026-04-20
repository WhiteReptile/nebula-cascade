---
name: marketplace
description: Marketplace UI structure — Mint (live on-chain) and Trade (off-chain peer-to-peer) tabs, division mapping from NFT metadata, paginated NFT grid, wallet mismatch modal
type: feature
---
The Marketplace (`src/pages/Marketplace.tsx`) is the central trading + identity hub. Sidebar sections: MARKET, MY CARDS, PROFILE, WALLET. Cyber-retro red neon styling.

**MARKET section has two tabs:**
- **Mint** (default) — live read-only NFT grid from the Nebula collection on Base via `<NFTGrid />` (`src/components/marketplace/NFTGrid.tsx`). Pulls `getNFTs` (ERC-1155 extension) + per-token `getActiveClaimCondition`. Default page size 12. Skeleton/empty/error states. Pagination shown when >1 page exists.
- **Trade** — existing off-chain peer-to-peer listings from `marketplace_listings` table. Division filter buttons (V/IV/III/II/I/all). Flat 3% fee.

**NFTCard** (`src/components/marketplace/NFTCard.tsx`) renders: image (IPFS auto-resolved to gateway), name, token #, supply minted, division badge (from metadata), price (ETH primary + USD muted), claim status pill (`LIVE` / `STARTS Xh` / `SOLD OUT` / `NO CLAIM`). Claim button visible but disabled with tooltip "Live in Phase 4".

**Division extraction** (`src/lib/thirdweb/divisionFromMetadata.ts`) reads `metadata.attributes` for `trait_type === "Division"`. Accepts `I`/`II`/`III`/`IV`/`V`, `Division I..V`, or `gem_i..gem_v`. Missing/unknown → null + console warn → card renders without badge (no crash).

**Wallet mismatch UX:** When a user connects a wallet already linked to ANOTHER account, `useWalletSync` calls `onMismatch` callback → Marketplace opens `<WalletMismatchModal />` (Radix Dialog, red neon). Single CTA: "Sign Out" → Supabase signOut + Thirdweb disconnect + redirect home. Replaces the prior Sonner toast.

**RPC budget per Mint page load:** 1 `getNFTs` batch + up to 12 `getActiveClaimCondition` calls = ≤13 RPCs. Thirdweb's `useReadContract` dedupes & caches via React Query.

**Pricing:** ETH always primary, USD secondary (muted). USD via `useEthUsdPrice()` (`src/lib/priceFeed.ts`, CoinGecko free, 60s cache). Never displayed as a guarantee.
