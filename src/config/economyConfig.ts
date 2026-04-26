/**
 * economyConfig.ts — Tunables for cards, energy, marketplace, rewards
 *
 * Single source of truth for all economic numbers. Update here, and the
 * rest of the codebase (cardSystem, energySystem, marketplaceSystem,
 * payoutIntegrations) picks up the change.
 */

// ── Card ownership ────────────────────────────────────────────────
export const CARDS = {
  MAX_PER_PLAYER: 10,
  MAX_COPIES_PER_TOKEN: 2,           // anti-hoarding (DB trigger enforced)
  SALE_LOCK_HOURS: 24,               // anti-flip lock after listing/transfer
} as const;

// ── Energy ────────────────────────────────────────────────────────
export const ENERGY = {
  PER_CARD: 2,                       // max energy per card
  CONSUME_CHANCE: 0.4,               // 40% chance per match-start
  CONSUME_COST: 2,                   // energy units consumed when triggered
  RESET_HOURS: 24,                   // rolling per-card reset window
} as const;

// ── Marketplace ───────────────────────────────────────────────────
export const MARKETPLACE = {
  SECONDARY_FEE_PERCENT: 3,          // flat % on secondary sales
  PRICE_REFRESH_SEC: 60,             // CoinGecko cache TTL
  PAGE_SIZE: 12,                     // NFTs per Mint-tab page
} as const;

// ── Reward pool ───────────────────────────────────────────────────
export const REWARDS = {
  POOL_SHARE_OF_FEES_PERCENT: 30,    // % of marketplace fees → reward pool
  SEASON_DAYS: 40,
  MAIN_CARD_SHARE_PERCENT: 100,      // main card earns 100% of its division pool
  SECONDARY_CARD_SHARE_PERCENT: 20,  // other-division cards earn 20% if eligible
} as const;

// ── Division supply estimates (rarity, not skill) ─────────────────
export const DIVISION_SUPPLY = {
  gem_i:   { label: 'Legendary', percent: 1 },
  gem_ii:  { label: 'Very Rare', percent: 4 },
  gem_iii: { label: 'Rare',      percent: 10 },
  gem_iv:  { label: 'Uncommon',  percent: 25 },
  gem_v:   { label: 'Common',    percent: 60 },
} as const;
