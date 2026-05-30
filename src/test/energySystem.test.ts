import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let select: ReturnType<typeof vi.fn>;
let eq: ReturnType<typeof vi.fn>;
let single: ReturnType<typeof vi.fn>;
let update: ReturnType<typeof vi.fn>;
let upsert: ReturnType<typeof vi.fn>;
let energySystem: Awaited<ReturnType<typeof import('@/lib/energySystem')>>;

beforeEach(async () => {
  vi.resetModules();

  select = vi.fn().mockReturnThis();
  eq = vi.fn().mockReturnThis();
  update = vi.fn().mockReturnThis();
  upsert = vi.fn().mockReturnThis();
  single = vi.fn();
  const from = vi.fn(() => ({ select, eq, single, update, upsert }));

  vi.doMock('@/integrations/supabase/client', () => ({
    supabase: { from },
  }));

  energySystem = await import('@/lib/energySystem');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('energySystem', () => {
  it('resets energy at UTC midnight when last_reset_at is before today', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T08:00:00.000Z'));

    single
      .mockResolvedValueOnce({ data: { card_id: 'card-1', energy: 0, max_energy: 2, last_reset_at: '2026-05-28' } })
      .mockResolvedValueOnce({ data: { card_id: 'card-1', energy: 2, max_energy: 2, last_reset_at: '2026-05-29' } });

    const energy = await energySystem.getCardEnergy('card-1');

    expect(update).toHaveBeenCalledWith({ energy: 2, last_reset_at: '2026-05-29' });
    expect(energy).toEqual({ energy: 2, maxEnergy: 2, lastResetAt: '2026-05-29' });
  });

  it('does not reset energy when last_reset_at is today', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T08:00:00.000Z'));

    single.mockResolvedValueOnce({ data: { card_id: 'card-1', energy: 1, max_energy: 2, last_reset_at: '2026-05-29' } });

    const energy = await energySystem.getCardEnergy('card-1');

    expect(update).not.toHaveBeenCalled();
    expect(energy).toEqual({ energy: 1, maxEnergy: 2, lastResetAt: '2026-05-29' });
  });

  it('does not consume energy when there is none left', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T08:00:00.000Z'));

    single.mockResolvedValueOnce({ data: { card_id: 'card-1', energy: 0, max_energy: 2, last_reset_at: '2026-05-29' } });

    const result = await energySystem.consumeCardEnergy('card-1');

    expect(result).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('consumes one energy when there is enough remaining', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T08:00:00.000Z'));

    single.mockResolvedValueOnce({ data: { card_id: 'card-1', energy: 2, max_energy: 2, last_reset_at: '2026-05-29' } });

    const result = await energySystem.consumeCardEnergy('card-1');

    expect(result).toBe(true);
    expect(update).toHaveBeenCalledWith({ energy: 1 });
  });

  it('initializes card energy with today UTC date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T08:00:00.000Z'));

    await energySystem.initCardEnergy('card-1');

    expect(upsert).toHaveBeenCalledWith(
      {
        card_id: 'card-1',
        energy: 2,
        max_energy: 2,
        last_reset_at: '2026-05-29',
      },
      { onConflict: 'card_id' }
    );
  });
});
