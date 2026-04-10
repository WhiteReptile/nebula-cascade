// Energy system — each Gem provides 2 energy per day, resets daily
import { supabase } from '@/integrations/supabase/client';
import { ENERGY_PER_GEM } from './gemSystem';

export interface PlayerEnergy {
  energy: number;
  maxEnergy: number;
  lastResetAt: string;
}

export function calculateMaxEnergy(ownedGemCount: number): number {
  return ownedGemCount * ENERGY_PER_GEM;
}

export async function getPlayerEnergy(playerId: string): Promise<PlayerEnergy | null> {
  const { data } = await supabase
    .from('player_energy')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (!data) return null;

  const today = new Date().toISOString().slice(0, 10);
  if (data.last_reset_at < today) {
    // Auto-reset energy for the new day
    const { data: updated } = await supabase
      .from('player_energy')
      .update({ energy: data.max_energy, last_reset_at: today })
      .eq('player_id', playerId)
      .select()
      .single();

    if (updated) {
      return { energy: updated.energy, maxEnergy: updated.max_energy, lastResetAt: updated.last_reset_at };
    }
  }

  return { energy: data.energy, maxEnergy: data.max_energy, lastResetAt: data.last_reset_at };
}

export async function consumeEnergy(playerId: string, amount: number): Promise<boolean> {
  const current = await getPlayerEnergy(playerId);
  if (!current || current.energy < amount) return false;

  const { error } = await supabase
    .from('player_energy')
    .update({ energy: current.energy - amount })
    .eq('player_id', playerId);

  return !error;
}

export async function initPlayerEnergy(playerId: string, gemCount: number): Promise<void> {
  const maxEnergy = calculateMaxEnergy(gemCount);
  await supabase.from('player_energy').upsert({
    player_id: playerId,
    energy: maxEnergy,
    max_energy: maxEnergy,
    last_reset_at: new Date().toISOString().slice(0, 10),
  }, { onConflict: 'player_id' });
}
