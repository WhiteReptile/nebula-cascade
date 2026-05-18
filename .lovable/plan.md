# Minimalist Marketplace — Option A

Closed off-chain economy. No on-chain transfers, no Stripe yet. Uses the `marketplace_listings` + `cards` tables already in place.

## Scope (what ships)

**Trade tab in `src/pages/Marketplace.tsx`** gets a real, working flow:

1. **Browse listings** — grid of active listings (card image, name, division badge, price, seller display name, "Buy" button).
2. **Division filter** — V / IV / III / II / I / All chips (reuses existing styling).
3. **List a card** — "List for Sale" button on each card in MY CARDS → modal with price input (USD) → calls `listCard()`.
4. **Buy a card** — "Buy" button on listing → confirm modal → calls `buyCard()`.
5. **Cancel listing** — In MY CARDS, listed cards show "Cancel Listing" → calls `cancelListing()`.
6. **Realtime refresh** — Supabase channel on `marketplace_listings` so new/sold/cancelled listings appear instantly.
7. **Empty / loading / error states** for every panel.

## Out of scope (explicit, will not build)

- Real money movement (no Stripe, no ETH transfer, no escrow).
- On-chain NFT transfer or wallet-inventory trading.
- Fee distribution to reward pool (already a DB field, wiring later).
- Dispute resolution, refunds, offers/bids.
- The Mint tab — stays untouched.

## What I need from you (one decision)

**Currency display for v1:** USD cents only (e.g. "$4.99")?
- Pro: matches the existing `price_cents` column, no FX, no wallet needed, ships today.
- Con: not blockchain-native. ETH+USD dual display can be added later when real payment rails go in.

If yes → I build exactly the above.
If you'd rather show ETH+USD now even without payments → same UI, I just format the number differently.

## Files I'll touch (small, focused)

```text
src/pages/Marketplace.tsx               edit  — wire Trade tab to real data + actions
src/components/marketplace/TradeGrid.tsx        new  — listings grid + filter
src/components/marketplace/ListingCard.tsx      new  — single listing tile
src/components/marketplace/ListCardModal.tsx    new  — set price, confirm list
src/components/marketplace/BuyCardModal.tsx     new  — confirm buy
src/components/marketplace/MyCardsPanel.tsx     new  — owned cards + list/cancel actions
src/hooks/useMarketplaceListings.ts             new  — fetch + realtime sub
```

Zero changes to: game shell, Mint tab, DB schema, edge functions, auth.

## Risk

Near-zero. Pure frontend on top of code paths (`listCard`/`buyCard`/`cancelListing`) that already exist and are RLS-protected. Nothing here can break gameplay or the existing NFT view.

## After approval

I'll implement in one pass, verify the Trade tab end-to-end in the preview (list → see it appear → buy from another account → confirm ownership swap), and report back. Stripe top-ups and on-chain settlement get queued for Phase 4.
