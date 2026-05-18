# On-Chain Marketplace on Base — Custom Contract + UI

Replaces the off-chain `marketplace_listings` flow with a fully on-chain marketplace for the Nebula ERC-1155 collection. Native ETH only. 3% fee to treasury. 24h on-chain anti-flip lock. Mint tab untouched.

## 1. Solidity contract — `NebulaMarketplace.sol`

Delivered as a single, deploy-ready file in a code block (Remix → Base mainnet). Highlights:

- Solidity `^0.8.24`, OpenZeppelin `ReentrancyGuard`, `Ownable`, `IERC1155`, `IERC1155Receiver`, `ERC165`.
- Storage:
  - `mapping(uint256 => Listing) listings` where `Listing { seller, nftAddress, tokenId, amount, priceWei, createdAt, active }`
  - `mapping(address => mapping(uint256 => uint256)) lockedUntil` — per (nftAddress, tokenId) 24h cooldown
  - `address payable treasury` (init: `0x0000…0000`, owner-settable)
  - `uint96 feeBps = 300` (3%), owner-settable up to 1000 (10% safety cap)
  - `uint256 constant LOCK_SECONDS = 86400`
- Functions:
  - `listCard(address nftAddress, uint256 tokenId, uint256 priceWei)` — requires `priceWei > 0`, no active cooldown, contract holds the token (pull pattern via `safeTransferFrom` from `msg.sender` → contract; requires prior `setApprovalForAll`). Emits `CardListed`.
  - `buyCard(uint256 listingId) payable nonReentrant` — exact-value match, splits `feeBps` to treasury and remainder to seller via low-level `call`, transfers NFT to buyer, sets `lockedUntil[nft][id] = block.timestamp + LOCK_SECONDS`, marks inactive. Emits `CardSold`.
  - `cancelListing(uint256 listingId) nonReentrant` — seller-only, returns NFT, marks inactive. Emits `CardDelisted`.
  - `setTreasury(address payable)`, `setFeeBps(uint96)` — owner-only.
  - `onERC1155Received` / `onERC1155BatchReceived` — return selectors so the contract can custody tokens.
  - `getListing(uint256)` view, `isLocked(address,uint256)` view helpers for the UI.
- Events: `CardListed`, `CardSold`, `CardDelisted`, `TreasuryUpdated`, `FeeUpdated` — all indexed for cheap `viem` log subscriptions.
- Gas notes: single-storage-slot `Listing` packing where possible; `nonReentrant` only on payable + transfer paths.

User deploys via Remix using a Base RPC, pastes the address into `.env`.

## 2. Frontend wiring

**Dependencies** (`bun add`):
- `wagmi`, `viem`, `@tanstack/react-query` (already present for query)

**Wallet connector strategy:** keep the existing Thirdweb `ConnectButton` for wallet UX (already shipped + working with `useWalletSync`), but read the active EOA from Thirdweb and feed it into a thin `viem` `walletClient` for marketplace writes. No second connect modal. This avoids tearing out `useWalletSync`, mismatch modal, and chain switching.

### New files

```text
src/lib/marketplace/abi.ts                          — exported ABI (typed)
src/lib/marketplace/contract.ts                     — viem client, address from env, helpers
src/hooks/useMarketplaceContract.ts                 — reads, writes, event subscriptions
src/components/marketplace/TradeGrid.tsx            — grid + rarity chips + sort
src/components/marketplace/ListingCard.tsx          — single tile
src/components/marketplace/ListCardModal.tsx        — approval-gated list flow
src/components/marketplace/BuyCardModal.tsx         — REPLACES existing (on-chain)
src/components/marketplace/MyCardsPanel.tsx         — inventory + cancel
```

### Edited files

```text
src/pages/Marketplace.tsx        — Trade tab now mounts TradeGrid + MyCardsPanel
src/config/web3Config.ts         — add MARKETPLACE_ADDRESS from import.meta.env
src/hooks/useMarketplaceListings.ts  — DELETED (off-chain hook obsolete)
src/components/marketplace/BuyCardModal.tsx  — rewritten for on-chain payable call
```

### `useMarketplaceContract.ts` surface

```ts
useActiveListings(filters?: { division?: Division; sort?: 'price' | 'newest' })
  → { listings, isLoading, error }    // viem getContractEvents + getListing reads, live via watchContractEvent
useListCard()  → { list(nft, tokenId, priceEth), status, hash }
useBuyCard()   → { buy(listingId, priceWei),    status, hash }
useCancelListing() → { cancel(listingId),       status, hash }
useApprovalStatus(nft) → { isApproved, approve(), approving }
useIsLocked(nft, tokenId) → boolean
```

All writes show toasts: pending → confirmed (block hash) → error. React Query invalidation on event receipt.

### Component behavior

- **TradeGrid**: chips `V / IV / III / II / I / All` (existing styling), sort dropdown `Newest | Price ↑ | Price ↓`. Empty/loading/error states. Responsive: 1 col mobile, 2 sm, 3 md, 4 lg.
- **ListingCard**: card art, name, rarity badge, seller `0x12…ab34`, price `0.0042 ETH` primary + `$14.20` muted (via `useEthUsdPrice`), prominent BUY button (yellow neon, matches existing modal).
- **ListCardModal**: 2-step — (a) if `!isApproved` → "Approve marketplace" button → `setApprovalForAll`; (b) ETH price input + Confirm → `listCard`. Both steps show pending tx state.
- **BuyCardModal**: identity block + price + CONFIRM → `buyCard{ value: priceWei }`. Lock-warning subtext.
- **MyCardsPanel**: owned cards (read via existing `useOwnedNFTs` pattern from `nftQueries.ts`). For each token, query active listing → if listed, overlay "LISTED ON MARKET" + Cancel button; if `isLocked` → muted "LOCKED 23h" badge; else List button.

### Division mapping

Reuses `divisionFromMetadata.ts`. Listings store only `(nftAddress, tokenId)` on-chain; division/name/image are pulled from Thirdweb `getNFT` calls cached in React Query (same path `NFTGrid` already uses).

## 3. Out of scope (explicit)

- No Supabase tables, RLS, or edge functions added.
- No ERC-20 / USDC path.
- No bids/offers/auctions, no royalties beyond the flat 3% fee.
- No on-chain enforcement of the 10-card / 2-copy wallet caps (those stay UI-side via existing `cardSystem.ts` checks before listing).
- Mint tab and on-chain claim flow untouched.

## 4. What you need to do after I implement

1. Open `NebulaMarketplace.sol` in Remix, compile with `0.8.24`, deploy to Base (chain 8453) with your treasury wallet as the constructor arg. Cost: a few cents.
2. Copy the deployed address.
3. Add to project env as `VITE_MARKETPLACE_CONTRACT=0x…` (I'll wire `.env.example` and config to read it; if missing, the Trade tab shows a clean "Marketplace contract not configured" state instead of crashing).
4. Reload — Trade tab is live on-chain.

## 5. Risk + verification

- Contract: I'll include inline NatSpec + a list of suggested invariants for you to verify in Remix. I won't deploy for you.
- Frontend: I verify build passes, Trade tab renders empty state when no `VITE_MARKETPLACE_CONTRACT` is set, and renders skeleton + listing grid once set. End-to-end on-chain test requires your deployed address.
- Reverts: every write wraps in try/catch with toast; user-rejected tx is silent.

## 6. Why this is the right shape

- Zero recurring infra cost: no Thirdweb subscription, no Supabase edge functions on the hot path.
- Trustless: buyer's ETH and seller's NFT both move in one atomic `buyCard` tx.
- Same UI shell, same wallet UX, same rarity/price/USD display the rest of the app already uses.
