/**
 * energySystem.ts — Per-card energy management
 *
 * Each card has 2 energy points (ENERGY_PER_CARD) that reset daily.
 * Playing a game consumes 1 energy from the active card.
 * Energy resets are date-based (YYYY-MM-DD comparison).
 *
 * Flow:
 *   1. Player selects active card → getCardEnergy() checks remaining
 *   2. On game start → consumeCardEnergy() deducts 1
 *   3. If energy = 0, player must wait for daily reset or use another card
 *   4. On card purchase → initCardEnergy() sets full energy
 *
 * Database table: `card_energy` (1:1 with `cards`)
 */
import { supabase } from '@/integrations/supabase/client';
import { ENERGY_PER_CARD } from './cardSystem';

export interface CardEnergy {
  energy: number;
  maxEnergy: number;
  lastResetAt: string;
}

export async function getCardEnergy(cardId: string): Promise<CardEnergy | null> {
  const { data } = await supabase
    .from('card_energy')
    .select('*')
    .eq('card_id', cardId)
    .single();

  if (!data) return null;

  const today = new Date().toISOString().slice(0, 10);
  if (data.last_reset_at && data.last_reset_at < today) {
    const { data: updated } = await supabase
      .from('card_energy')
      .update({ energy: data.max_energy, last_reset_at: today })
      .eq('card_id', cardId)
      .select()
      .single();

    if (updated) {
      return { energy: updated.energy!, maxEnergy: updated.max_energy!, lastResetAt: updated.last_reset_at! };
    }
  }

  return { energy: data.energy!, maxEnergy: data.max_energy!, lastResetAt: data.last_reset_at! };
}

export async function consumeCardEnergy(cardId: string): Promise<boolean> {
  const current = await getCardEnergy(cardId);
  if (!current || current.energy < 1) return false;

  const { error } = await supabase
    .from('card_energy')
    .update({ energy: current.energy - 1 })
    .eq('card_id', cardId);

  return !error;
}

export async function initCardEnergy(cardId: string): Promise<void> {
  await supabase.from('card_energy').upsert({
    card_id: cardId,
    energy: ENERGY_PER_CARD,
    max_energy: ENERGY_PER_CARD,
    last_reset_at: new Date().toISOString().slice(0, 10),
  }, { onConflict: 'card_id' });
}
