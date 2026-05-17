/**
 * pacing.test.ts — Guard rails for gameplay tunables.
 */
import { describe, it, expect } from 'vitest';
import { PACING, SCORING, BOARD } from '@/config';

describe('Pacing / Scoring invariants', () => {
  it('keeps gravity within playable bounds', () => {
    expect(PACING.BASE_GRAVITY).toBeGreaterThan(0);
    expect(PACING.MAX_FALL_SPEED).toBeGreaterThan(PACING.BASE_GRAVITY);
    expect(PACING.LEVEL_BOOST_PER_LEVEL).toBeGreaterThan(0);
    expect(PACING.LEVEL_BOOST_PER_LEVEL).toBeLessThan(1);
  });

  it('triggers urgency after the warm-up window', () => {
    expect(PACING.URGENCY_START_SEC).toBeGreaterThanOrEqual(20);
    expect(PACING.URGENCY_RAMP_PER_SEC).toBeGreaterThan(0);
    expect(PACING.URGENCY_FADE_IN_SEC).toBeGreaterThan(0);
  });

  it('enforces a match cooldown', () => {
    expect(PACING.MATCH_COOLDOWN_SEC).toBeGreaterThanOrEqual(30);
  });

  it('has a level threshold > 0', () => {
    expect(PACING.POINTS_PER_LEVEL).toBeGreaterThan(0);
    expect(SCORING.POINTS_PER_ORB).toBeGreaterThan(0);
  });

  it('keeps board geometry consistent', () => {
    expect(BOARD.COLS).toBeGreaterThan(0);
    expect(BOARD.ROWS).toBeGreaterThan(0);
    expect(BOARD.CELL).toBeGreaterThan(0);
  });
});
