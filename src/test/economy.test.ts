/**
 * economy.test.ts — Pure-math sanity checks for the economy config.
 *
 * These guard against accidental edits to the central economy constants.
 * If a value here is intentionally changed, update the test alongside it.
 */
import { describe, it, expect } from 'vitest';
import { CARDS, ENERGY, MARKETPLACE, REWARDS } from '@/config';

describe('Economy config invariants', () => {
  it('caps card ownership at 10 per player', () => {
    expect(CARDS.MAX_PER_PLAYER).toBe(10);
    expect(CARDS.MAX_COPIES_PER_TOKEN).toBe(2);
  });

  it('uses a 24h rolling reset with 2 energy per card', () => {
    expect(ENERGY.PER_CARD).toBe(2);
    expect(ENERGY.RESET_HOURS).toBe(24);
    expect(ENERGY.CONSUME_CHANCE).toBeGreaterThan(0);
    expect(ENERGY.CONSUME_CHANCE).toBeLessThanOrEqual(1);
  });

  it('charges a flat 3% marketplace fee', () => {
    expect(MARKETPLACE.SECONDARY_FEE_PERCENT).toBe(3);

    // Fee math sanity: $100 listing → $3 fee, $97 to seller.
    const priceCents = 10000;
    const feeCents = Math.round(priceCents * (MARKETPLACE.SECONDARY_FEE_PERCENT / 100));
    expect(feeCents).toBe(300);
    expect(priceCents - feeCents).toBe(9700);
  });

  it('splits rewards 100% main / 20% secondary per division pool', () => {
    expect(REWARDS.MAIN_CARD_SHARE_PERCENT).toBe(100);
    expect(REWARDS.SECONDARY_CARD_SHARE_PERCENT).toBe(20);
    expect(REWARDS.SEASON_DAYS).toBe(40);
    expect(REWARDS.POOL_SHARE_OF_FEES_PERCENT).toBe(30);
  });

  it('routes 30% of marketplace fees into the reward pool', () => {
    // $1,000 in monthly fees → $300 into the seasonal pool.
    const monthlyFeesCents = 100_000;
    const poolCents = Math.round(monthlyFeesCents * (REWARDS.POOL_SHARE_OF_FEES_PERCENT / 100));
    expect(poolCents).toBe(30_000);
  });
});
