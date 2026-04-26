# NFT Rules

## Chain & Contract

- **Chain**: Base (ETH L2), chain ID `8453` — see `src/config/web3Config.ts`.
- **NFT Collection**: `0xa89C9d428321291fF9b3609D62861123690aa07e` (ERC-1155 Drop).
- **SDK**: Thirdweb v5 (`thirdweb` npm package).
- Marketplace V3 contract is **not** used — primary sales via the
  collection's own claim phases, secondary trading off-chain via Supabase.

## Divisions (Rarity, Not Skill)

| ID        | Label        | Rarity        | Approx. Supply |
|-----------|--------------|---------------|----------------|
| `gem_i`   | Division I   | Legendary     | ~1%            |
| `gem_ii`  | Division II  | Very Rare     | ~4%            |
| `gem_iii` | Division III | Rare          | ~10%           |
| `gem_iv`  | Division IV  | Uncommon      | ~25%           |
| `gem_v`   | Division V   | Common        | ~60%           |

Division is read from NFT metadata `attributes` where
`trait_type === "Division"`. See
`src/lib/thirdweb/divisionFromMetadata.ts`. Accepted values: `I`..`V`,
`Division I`..`Division V`, or `gem_i`..`gem_v`. Unknown → no badge, no
crash.

## Card Activation

Players have two distinct card slots on `players`:

- **`main_card_id`** — sticky designation. Qualifies for **100%** of that
  division's reward pool.
- **`active_card_id`** — per-match dynamic. Drives in-game VFX and
  determines the division placement for leaderboard purposes.

Holding cards in **other** divisions earns **20%** of those division pools
(eligibility gated by leaderboard rank within the division).

## Holding Rules

- Max 10 cards per wallet (`CARDS.MAX_PER_PLAYER`).
- Max 2 copies of any single `token_id` per wallet — enforced by DB trigger.
- 24h sale-lock after listing or transfer (`cards.sale_lock_until`) — anti-flip.

## Marketplace UX

- **Mint tab**: live read-only NFT grid via Thirdweb `getNFTs` +
  `getActiveClaimCondition`. Page size 12. Skeleton/empty/error states.
  Claim button currently disabled with tooltip "Live in Phase 4".
- **Trade tab**: off-chain peer-to-peer listings (Supabase
  `marketplace_listings`). Division filter buttons.
- **Wallet mismatch UX**: `WalletMismatchModal` opens when a connected
  wallet is already linked to another account. Single CTA: Sign Out.

## RPC Budget

≤13 RPC calls per Mint-tab page load (1 batch `getNFTs` + up to 12
`getActiveClaimCondition`). React Query dedupes/caches.
