// Gem NFT-ready system — 5 unique gems mapped to divisions
import { supabase } from '@/integrations/supabase/client';
import type { Division } from './divisionSystem';

export const TOTAL_GEM_SUPPLY = 5;
export const ENERGY_PER_GEM = 2;

// Chain targets
export const BASE_CHAIN_ID = 8453;
export const POLYGON_CHAIN_ID = 137;
export const TARGET_CHAIN = { id: BASE_CHAIN_ID, name: 'Base', fallback: POLYGON_CHAIN_ID };

export interface GemMetadata {
  tokenId: number;
  division: Division;
  name: string;
  colorHex: string;
  ownerWallet: string | null;
  ownerPlayerId: string | null;
  traits: Record<string, unknown>;
}

// ERC-721-compatible metadata for marketplace listing
export interface ERC721Metadata {
  name: string;
  description: string;
  image: string; // placeholder — future IPFS CID
  attributes: { trait_type: string; value: string | number }[];
  external_url: string;
}

export async function getGemsForPlayer(playerId: string): Promise<GemMetadata[]> {
  const { data } = await supabase
    .from('gems')
    .select('*')
    .eq('owner_player_id', playerId);

  if (!data) return [];

  return data.map(g => ({
    tokenId: g.token_id,
    division: g.division as Division,
    name: g.name,
    colorHex: g.color_hex,
    ownerWallet: g.owner_wallet,
    ownerPlayerId: g.owner_player_id,
    traits: (g.metadata as Record<string, unknown>) ?? {},
  }));
}

export async function getAllGems(): Promise<GemMetadata[]> {
  const { data } = await supabase
    .from('gems')
    .select('*')
    .order('token_id');

  if (!data) return [];

  return data.map(g => ({
    tokenId: g.token_id,
    division: g.division as Division,
    name: g.name,
    colorHex: g.color_hex,
    ownerWallet: g.owner_wallet,
    ownerPlayerId: g.owner_player_id,
    traits: (g.metadata as Record<string, unknown>) ?? {},
  }));
}

export function getGemMetadataForMarketplace(gem: GemMetadata): ERC721Metadata {
  return {
    name: gem.name,
    description: `Nebula Cascade ${gem.name} — Division ${gem.division.replace('gem_', '').toUpperCase()}. One of only ${TOTAL_GEM_SUPPLY} Gems in existence.`,
    image: '', // future: IPFS CID
    external_url: 'https://nebulacascade.gg',
    attributes: [
      { trait_type: 'Division', value: gem.division.replace('gem_', '').toUpperCase() },
      { trait_type: 'Color', value: gem.colorHex },
      { trait_type: 'Token ID', value: gem.tokenId },
      { trait_type: 'Element', value: (gem.traits.element as string) ?? 'unknown' },
      { trait_type: 'Tier', value: (gem.traits.tier as number) ?? 0 },
      { trait_type: 'Energy Per Day', value: ENERGY_PER_GEM },
    ],
  };
}
