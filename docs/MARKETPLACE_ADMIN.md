# Marketplace Admin Guide

Operational reference for the contract owner running the Nebula Cascade marketplace.
This is a **frontend guide** — it describes what the UI exposes against an already-deployed
marketplace contract. Contract logic itself lives outside this repo (OpenZeppelin-based).

## Access

The owner controls are gated by an on-chain `owner()` read at component mount.
Anyone else sees nothing — the panel doesn't render. There is no flag, env var, or
localStorage bypass; the wallet you connect with **must** match `owner()` byte-for-byte.

## Owner Controls Panel (Marketplace tab)

Located inside the Marketplace dashboard. Lets you:

- **Update treasury address** — destination wallet for fee accruals. UI validates `0x` + 40 hex chars.
- **Update fee basis points** — capped at **1000 bps (10%)** in the UI. The contract
  must also enforce this; the cap here is a guardrail, not a security boundary.

Each action sends a single tx, surfaces a pending toast, then a confirmed/reverted
toast with a BaseScan link. State auto-refreshes after confirmation.

## Treasury Widget (WALLET tab)

Owner-only widget that surfaces:

- **Accumulated lifetime volume** — sum of all successful sales (cached in `localStorage`
  under `nebula:vol:<chainId>:<contract>` with a 24h safety TTL).
- **Contract ETH balance** — direct `getBalance` against the marketplace contract.
- **Current treasury + fee bps** — sourced from the contract reads.

Use the **Refresh** button to bust the cache and re-pull volume from the chain.

## Anti-Flip Lock (MY CARDS)

Every freshly acquired card is locked for **24 hours** on-chain. The UI:

- Renders a countdown badge (HH:MM:SS) on each locked tile.
- Wraps the avatar in an SVG progress ring keyed to `secondsLeft / 86400`.
- Disables the **SELL** button until `lockedUntil <= now`; tooltip shows the exact unlock time.
- Sorts MY CARDS: unlocked first → locked (soonest first) → already listed.

## Verifying a transaction

Every write action returns a tx hash visible in the toast. Click through to BaseScan to:

1. Confirm the function called matches expectation.
2. Confirm `from` matches your wallet.
3. Confirm event logs (`TreasuryUpdated`, `FeeUpdated`, `Listed`, `Sold`, `Cancelled`).

## Env vars

- `VITE_MARKETPLACE_CONTRACT` — deployed marketplace contract address on Base (8453).
  If unset, the UI flags **NOT DEPLOYED** in the Blockchain Info panel.

## Future migration

The Thirdweb v5 read/write layer is isolated in `src/hooks/useMarketplaceContract.ts`
and `src/lib/marketplace/abi.ts`. When the OpenZeppelin contracts and custom backend
land, only those two files need to be re-pointed; the UI components are agnostic.
