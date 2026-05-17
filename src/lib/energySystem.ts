/**
 * energySystem.ts — Per-card energy management
 *
 * ECONOMY RULE (from project memory: Card Economy):
 *   Each card has 2 energy points (ENERGY_PER_CARD) on a rolling 24h reset.
 *   When energy hits 0, a new full refill is scheduled for now + 24h.
 *   This is NOT a calendar-day reset — it is a true rolling window from the
 *   moment the card's energy was last consumed to empty (or initialized).
 *
 * Reset logic is read-on-access (no cron):
 *   getCardEnergy() lazily refills if `next_reset_at` is in the past.
 *
 * Flow:
 *   1. Player selects active card → getCardEnergy() refills if window elapsed
 *   2. On game start → consumeCardEnergy() deducts 1 (or 2 on 40% roll, handled upstream)
 *   3. When energy reaches 0 → next_reset_at is stamped to now + 24h
 *   4. On card purchase → initCardEnergy() sets full energy and 24h window
 *
 * Database table: `card_energy` (1:1 with `cards`)
 */
import { supabase } from '@/integrations/supabase/client';
import { ENERGY_PER_CARD } from './cardSystem';

const RESET_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface CardEnergy {
  energy: number;
  maxEnergy: number;
  lastResetAt: string;
  nextResetAt: string | null;
}

function nextResetIso(): string {
  return new Date(Date.now() + RESET_WINDOW_MS).toISOString();
}

export async function getCardEnergy(cardId: string): Promise<CardEnergy | null> {
  const { data } = await supabase
    .from('card_energy')
    .select('*')
    .eq('card_id', cardId)
    .single();

  if (!data) return null;

  const now = Date.now();
  const nextReset = data.next_reset_at ? new Date(data.next_reset_at).getTime() : 0;

  // Rolling 24h window expired → refill and schedule the next window.
  if (!data.next_reset_at || now >= nextReset) {
    const { data: updated } = await supabase
      .from('card_energy')
      .update({
        energy: data.max_energy,
        last_reset_at: new Date().toISOString().slice(0, 10),
        next_reset_at: nextResetIso(),
      })
      .eq('card_id', cardId)
      .select()
      .single();

    if (updated) {
      return {
        energy: updated.energy!,
        maxEnergy: updated.max_energy!,
        lastResetAt: updated.last_reset_at!,
        nextResetAt: updated.next_reset_at,
      };
    }
  }

  return {
    energy: data.energy!,
    maxEnergy: data.max_energy!,
    lastResetAt: data.last_reset_at!,
    nextResetAt: data.next_reset_at,
  };
}

export async function consumeCardEnergy(cardId: string): Promise<boolean> {
  // Guests have no auth session and no card_energy rows under RLS.
  // Skip entirely so guest matches never block on energy.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return true;

  const current = await getCardEnergy(cardId);
  if (!current || current.energy < 1) return false;

  // Rolling 24h per action: every consume restamps the window.
  const { error } = await supabase
    .from('card_energy')
    .update({
      energy: current.energy - 1,
      next_reset_at: nextResetIso(),
    })
    .eq('card_id', cardId);

  return !error;
}

export async function initCardEnergy(cardId: string): Promise<void> {
  await supabase.from('card_energy').upsert({
    card_id: cardId,
    energy: ENERGY_PER_CARD,
    max_energy: ENERGY_PER_CARD,
    last_reset_at: new Date().toISOString().slice(0, 10),
    next_reset_at: nextResetIso(),
  }, { onConflict: 'card_id' });
}
