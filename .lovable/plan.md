## Goal
Prepare the frontend admin and anti-flip UX before contract deployment, fully on top of the existing Thirdweb v5 stack. Three additions, all in the Marketplace dashboard.

---

## 1. Extend ABI + contract hooks

**`src/lib/marketplace/abi.ts`** — add functions already in the Solidity contract but missing from the ABI:
- `owner() view → address`
- `setTreasury(address)` (nonpayable)
- `setFeeBps(uint96)` (nonpayable)
- `lockedUntil(address, uint256) view → uint64` (raw mapping read for exact countdown)

**`src/hooks/useMarketplaceContract.ts`** — add:
- `useMarketplaceOwner()` → `{ owner, isOwner }` (compares to `useActiveAccount`)
- `useTreasuryStats()` → `{ treasury, feeBps, contractBalanceWei, refresh }` using `useReadContract` (treasury, feeBps) + `eth_getBalance` via Thirdweb `getRpcClient` for the contract address. Refetch every 30s.
- `useSetTreasury()` / `useSetFeeBps()` wrappers around `useTx` (toasts + refresh on success).
- `useLockExpiry(tokenId)` → `{ lockedUntil: bigint, isLocked, secondsLeft }` reading the `lockedUntil` mapping; expose a tick (`useEffect` + `setInterval(1000)`) so `secondsLeft` updates each second client-side without spamming RPC.

All hooks no-op gracefully when `MARKETPLACE_CONFIGURED === false`.

---

## 2. Owner Controls panel (Marketplace tab)

New component **`src/components/marketplace/OwnerControlsPanel.tsx`**:
- Visible only when `useMarketplaceOwner().isOwner === true`.
- Two stacked forms inside the existing `panel` style (cyber-retro neon, semantic tokens):
  - **Treasury address** — input + "UPDATE TREASURY" button. Validates `0x` + 40 hex. Disabled while pending.
  - **Fee (basis points)** — number input 0–1000, helper text shows `= X.XX%`. Rejects > 1000 client-side ("MAX 10%"). "UPDATE FEE" button.
- Live current values rendered above each form (from `useTreasuryStats`).
- Toasts surface tx hash / errors via existing `useTx`.

Mounted inside `section === 'marketplace'`, above the Mint/Trade tab bar, behind the `isOwner` gate.

---

## 3. Treasury widget (Wallet tab)

New component **`src/components/marketplace/TreasuryWidget.tsx`**, rendered in the Wallet section only when `isOwner`:
- Shows: **Treasury address**, **Current fee** (`feeBps/100`%), **Contract ETH balance** (live, formatted to 6 decimals + USD via existing `priceFeed`), **Lifetime volume** (sum of `priceWei` from past `CardSold` events queried via Thirdweb `getContractEvents` with a reasonable `fromBlock` — Base deployment block of the marketplace, captured the first time we see it; cached in `localStorage`).
- Refresh button + auto-refresh 30s.

Plays nicely with the "Coming Soon"-free Wallet panel already in place.

---

## 4. 24h lock countdown badge in MY CARDS

In `src/pages/Marketplace.tsx`, inside the cards `.map`:
- Call `useLockExpiry(BigInt(card.tokenId))` (extract a tiny `<MyCardTile>` sub-component to keep hook usage legal inside the loop).
- When `isLocked`, render a red neon badge next to "ACTIVE / LISTED" lines: `🔒 LOCKED · 23:59:42` formatted as `HH:MM:SS`, updating every second.
- Disable the **SELL ON-CHAIN** button (`disabled`, opacity-40, tooltip-ish title attr `"24h anti-flip lock active"`) until expiry.
- Cancel-listing button is unaffected (cancel is always allowed).

---

## Files touched

```text
src/lib/marketplace/abi.ts                              (edit: +4 functions)
src/hooks/useMarketplaceContract.ts                     (edit: +5 hooks)
src/components/marketplace/OwnerControlsPanel.tsx       (new)
src/components/marketplace/TreasuryWidget.tsx           (new)
src/components/marketplace/MyCardTile.tsx               (new — extracted)
src/pages/Marketplace.tsx                               (edit: mount panel + widget, swap inline card markup for <MyCardTile/>)
```

No backend, no Supabase, no contract changes. All gated behind `MARKETPLACE_CONFIGURED` so the UI stays clean pre-deployment; owner-gated sections simply don't render until the connected wallet matches `owner()` post-deploy.
