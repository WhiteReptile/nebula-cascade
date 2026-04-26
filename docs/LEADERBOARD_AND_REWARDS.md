# Leaderboard & Rewards

## Leaderboard

- **Period format**: `YYYY-MM` monthly seasons (see
  `divisionSystem.ts → getCurrentPeriod`).
- **Season length**: `REWARDS.SEASON_DAYS` (40 days) — competitive cycle.
- A player's leaderboard division is determined by their **active card's**
  division at the time the score is submitted.
- Players without an NFT card play in the **No-NFT bracket**, with
  placement based on current wallet holdings.

## Score Submission Flow

1. Client requests session seed → `supabase/functions/generate-session`.
2. Match runs in Phaser; final stats emitted via `gameEvents.matchEnd`.
3. `src/lib/matchLogger.ts` calls `supabase/functions/submit-score`.
4. Edge function validates the seed + score window + persists to DB.

This loop prevents trivial client-side score forgery.

## Reward Pool

- Pool is funded by **`REWARDS.POOL_SHARE_OF_FEES_PERCENT` (30%)** of
  platform fees (which themselves come from the **3%** marketplace fee).
- Pool is denominated in ETH; informational USD shown via priceFeed.

## Distribution Rules

For each division (I → V):

- The player whose **main card** is in that division and who places highest
  on the division leaderboard receives **`REWARDS.MAIN_CARD_SHARE_PERCENT`
  (100%)** of the slice allocated to that division.
- Players with **secondary cards** in the same division (not their main
  card) receive **`REWARDS.SECONDARY_CARD_SHARE_PERCENT` (20%)** of their
  applicable share, if their leaderboard rank qualifies.

## Payout Integration Placeholders

`src/lib/payoutIntegrations.ts` exposes export adapters for:

- Stripe (fiat off-ramp)
- Coinbase (crypto exchange)
- Circle (USDC settlement)

These are scaffolds — real keys must be wired in via Lovable Cloud secrets
before going live.
