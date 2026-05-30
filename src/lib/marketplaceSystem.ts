/**
 * marketplaceSystem.ts — Internal card trading marketplace
 *
 * Players can list owned cards for sale and buy listed cards.
 * Flat 3% fee on all secondary sales.
 * 30% of collected fees flow into the seasonal rewards pool.
 *
 * Listing flow:
 *   1. listCard() → Deactivates card, clears active_card_id, creates listing
 *   2. buyCard() → Transfers ownership, inits energy for buyer, marks sold
 *   3. cancelListing() → Sets status to 'cancelled' (card stays with seller)
 *
 * Database table: `marketplace_listings`
 * Statuses: 'active' | 'sold' | 'cancelled'
 */
import { supabase } from '@/integrations/supabase/client';
import { initCardEnergy } from './energySystem';
import { MARKETPLACE } from '@/config';

// Re-exported from central config. Edit in `src/config/economyConfig.ts`.
export const MARKETPLACE_FEE_PERCENT = MARKETPLACE.SECONDARY_FEE_PERCENT;

export interface MarketplaceListing {
  id: string;
  cardId: string;
  sellerPlayerId: string;
  priceCents: number;
  priceWei: string | null;
  feePercent: number;
  listedAt: string;
  soldAt: string | null;
  buyerPlayerId: string | null;
  status: string;
  onchainListingId?: number | null;
}

/**
 * Flat 3% fee on all secondary sales
 */
export async function calculateFee(_cardId: string): Promise<number> {
  return MARKETPLACE_FEE_PERCENT;
}

export async function listCard(cardId: string, sellerPlayerId: string, priceCents: number, onchainListingId: number | null = null, priceWei: string | null = null): Promise<boolean> {
  const fee = await calculateFee(cardId);

  // Mark card as not active if it was
  await supabase.from('cards').update({ is_active: false }).eq('id', cardId);

  // Clear active_card_id if this was the active card
  await supabase.from('players')
    .update({ active_card_id: null })
    .eq('id', sellerPlayerId)
    .eq('active_card_id', cardId);

  const { error } = await supabase.from('marketplace_listings').insert({
    card_id: cardId,
    seller_player_id: sellerPlayerId,
    price_cents: priceCents,
    price_wei: priceWei,
    fee_percent: fee,
    status: 'active',
    onchain_listing_id: onchainListingId,
  } as any);

  return !error;
}

export async function buyCard(listingId: string, buyerPlayerId: string): Promise<boolean> {
  // Get listing
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('id', listingId)
    .eq('status', 'active')
    .single();

  if (!listing) return false;

  // Transfer card ownership
  const { error: cardError } = await supabase
    .from('cards')
    .update({ owner_player_id: buyerPlayerId })
    .eq('id', listing.card_id);

  if (cardError) return false;

  // Init energy for new owner
  await initCardEnergy(listing.card_id);

  // Update listing
  const { error: listingError } = await supabase
    .from('marketplace_listings')
    .update({
      status: 'sold',
      sold_at: new Date().toISOString(),
      buyer_player_id: buyerPlayerId,
    })
    .eq('id', listingId);

  return !listingError;
}

export async function cancelListing(listingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'cancelled' })
    .eq('id', listingId);

  return !error;
}

export async function getActiveListings(): Promise<MarketplaceListing[]> {
  const { data } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('status', 'active')
    .order('listed_at', { ascending: false });

  if (!data) return [];
  return data.map(row => {
    const raw = row as any;
    return {
      id: raw.id,
      cardId: raw.card_id,
      sellerPlayerId: raw.seller_player_id,
      priceCents: raw.price_cents,
      priceWei: raw.price_wei ?? null,
      feePercent: raw.fee_percent,
      listedAt: raw.listed_at,
      soldAt: raw.sold_at,
      buyerPlayerId: raw.buyer_player_id,
      status: raw.status,
      onchainListingId: raw.onchain_listing_id ?? null,
    };
  });
}

export async function mirrorListingSoldOnChain(tokenId: number, buyerWallet: string): Promise<boolean> {
  const { data: card } = await supabase
    .from('cards')
    .select('id, owner_player_id')
    .eq('token_id', tokenId)
    .single();

  if (!card) return false;

  const { data: buyer } = await supabase
    .from('players')
    .select('id')
    .ilike('wallet_address', buyerWallet)
    .single();

  const buyerPlayerId = buyer?.id ?? null;
  const cardUpdates: Record<string, unknown> = {
    owner_player_id: buyerPlayerId,
    owner_wallet: buyerWallet,
  };

  const { error: cardError } = await supabase
    .from('cards')
    .update(cardUpdates)
    .eq('id', card.id);

  if (cardError) return false;

  const { error: playerError } = await supabase
    .from('players')
    .update({ active_card_id: null })
    .eq('id', card.owner_player_id)
    .eq('active_card_id', card.id);

  if (playerError) return false;

  const { error: listingError } = await supabase
    .from('marketplace_listings')
    .update({
      status: 'sold',
      buyer_player_id: buyerPlayerId,
      sold_at: new Date().toISOString(),
    })
    .eq('card_id', card.id)
    .eq('status', 'active');

  return !listingError;
}

export async function mirrorListingCanceledOnChain(tokenId: number): Promise<boolean> {
  const { data: card } = await supabase
    .from('cards')
    .select('id')
    .eq('token_id', tokenId)
    .single();

  if (!card) return false;

  const { error: cardError } = await supabase
    .from('cards')
    .update({ is_active: true })
    .eq('id', card.id);

  if (cardError) return false;

  const { error: listingError } = await supabase
    .from('marketplace_listings')
    .update({ status: 'cancelled' })
    .eq('card_id', card.id)
    .eq('status', 'active');

  return !listingError;
}
