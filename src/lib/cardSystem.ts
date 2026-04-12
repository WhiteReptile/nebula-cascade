// Card system — replaces gemSystem.ts
import { supabase } from '@/integrations/supabase/client';
import type { Division } from './divisionSystem';

export const ENERGY_PER_CARD = 2;
export const MAX_CARDS_PER_PLAYER = 10;

// Division priority: gem_i (highest) → gem_v (lowest)
const DIVISION_PRIORITY: Record<Division, number> = {
  gem_i: 5,
  gem_ii: 4,
  gem_iii: 3,
  gem_iv: 2,
  gem_v: 1,
};

export interface CardMetadata {
  id: string;
  tokenId: number;
  division: Division;
  name: string;
  colorHex: string;
  imageUrl: string | null;
  flavorText: string;
  priceCents: number;
  isActive: boolean;
  ownerWallet: string | null;
  ownerPlayerId: string | null;
  metadata: Record<string, unknown>;
}

function mapRow(row: any): CardMetadata {
  return {
    id: row.id,
    tokenId: row.token_id,
    division: row.division as Division,
    name: row.name,
    colorHex: row.color_hex,
    imageUrl: row.image_url,
    flavorText: row.flavor_text ?? '',
    priceCents: row.price_cents ?? 0,
    isActive: row.is_active ?? false,
    ownerWallet: row.owner_wallet,
    ownerPlayerId: row.owner_player_id,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

export async function getCardsForPlayer(playerId: string): Promise<CardMetadata[]> {
  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('owner_player_id', playerId);
  if (!data) return [];
  return data.map(mapRow);
}

export async function getAllCards(): Promise<CardMetadata[]> {
  const { data } = await supabase
    .from('cards')
    .select('*')
    .order('token_id');
  if (!data) return [];
  return data.map(mapRow);
}

export async function getActiveCard(playerId: string): Promise<CardMetadata | null> {
  const { data: player } = await supabase
    .from('players')
    .select('active_card_id')
    .eq('id', playerId)
    .single();

  if (!player?.active_card_id) return null;

  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', player.active_card_id)
    .single();

  return card ? mapRow(card) : null;
}

export async function setActiveCard(playerId: string, cardId: string): Promise<boolean> {
  // Verify ownership
  const { data: card } = await supabase
    .from('cards')
    .select('id')
    .eq('id', cardId)
    .eq('owner_player_id', playerId)
    .single();

  if (!card) return false;

  const { error } = await supabase
    .from('players')
    .update({ active_card_id: cardId })
    .eq('id', playerId);

  return !error;
}

export function getHighestDivisionCard(cards: CardMetadata[]): CardMetadata | null {
  if (cards.length === 0) return null;
  return cards.reduce((best, card) =>
    DIVISION_PRIORITY[card.division] > DIVISION_PRIORITY[best.division] ? card : best
  );
}
