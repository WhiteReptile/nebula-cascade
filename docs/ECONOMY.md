# Economy

All numbers below are tunable in `src/config/economyConfig.ts`.

## Currency Display

- **ETH always primary**, USD secondary (muted).
- USD via CoinGecko free API, cached `MARKETPLACE.PRICE_REFRESH_SEC` (60s).
- Source: `src/lib/priceFeed.ts` → `useEthUsdPrice()`.
- USD is **never displayed as a guaranteed value**.

## Card Ownership Caps

| Rule                          | Value                       | Enforced where            |
|-------------------------------|-----------------------------|---------------------------|
| Max cards per wallet          | `CARDS.MAX_PER_PLAYER` (10) | `cardSystem.ts` + DB      |
| Max copies of one token       | `CARDS.MAX_COPIES_PER_TOKEN` (2) | DB trigger          |
| Anti-flip sale-lock           | `CARDS.SALE_LOCK_HOURS` (24)| `cards.sale_lock_until`   |

## Energy

- Each card holds `ENERGY.PER_CARD` energy points.
- **40% chance per match-start** (`ENERGY.CONSUME_CHANCE`) to consume
  `ENERGY.CONSUME_COST` (2) energy from the active card.
- Rolling **24h reset per card** (`ENERGY.RESET_HOURS`) — *not* a global
  daily reset.
- Players without NFTs use the `player_energy` fallback bracket.

## Marketplace Fees

- Flat **`MARKETPLACE.SECONDARY_FEE_PERCENT` (3%)** on secondary sales.
- Primary mints go through the collection's claim phases on Base — no fee
  taken by us on primary sales.
- `REWARDS.POOL_SHARE_OF_FEES_PERCENT` (30%) of platform fees flow into the
  reward pool.

## Reward Pool Distribution

See `docs/LEADERBOARD_AND_REWARDS.md`.

## Assumptions

- USD/ETH price is informational only; settlement is in ETH on Base.
- Reward pool is funded by realised fees, not promised yields.
- Supply per card design is market-determined; division percentages in
  `economyConfig.ts → DIVISION_SUPPLY` are estimates only.
