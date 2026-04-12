/**
 * marketplaceSystem.ts — Internal card trading marketplace
 *
 * Players can list owned cards for sale and buy listed cards.
 * Dynamic fee structure discourages rapid flipping:
 *   - Base fee: 5%
 *   - 1 resale within 7 days: 7%
 *   - 2+ resales within 7 days: 10%
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

export interface MarketplaceListing {
  id: string;
  cardId: string;
  sellerPlayerId: string;
  priceCents: number;
  feePercent: number;
  listedAt: string;
  soldAt: string | null;
  buyerPlayerId: string | null;
  status: string;
}

/**
 * Dynamic fee: 5% base, 7% if resold within 7 days, 10% if 2+ fast resales
 */
export async function calculateFee(cardId: string): Promise<number> {
  const { data: recentSales } = await supabase
    .from('marketplace_listings')
    .select('sold_at, listed_at')
    .eq('card_id', cardId)
    .eq('status', 'sold')
    .order('sold_at', { ascending: false })
    .limit(5);

  if (!recentSales || recentSales.length === 0) return 5;

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  let fastResaleCount = 0;

  for (const sale of recentSales) {
    if (sale.sold_at && now - new Date(sale.sold_at).getTime() < sevenDays) {
      fastResaleCount++;
    }
  }

  if (fastResaleCount >= 2) return 10;
  if (fastResaleCount >= 1) return 7;
  return 5;
}

export async function listCard(cardId: string, sellerPlayerId: string, priceCents: number): Promise<boolean> {
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
    fee_percent: fee,
    status: 'active',
  });

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
  return data.map(row => ({
    id: row.id,
    cardId: row.card_id,
    sellerPlayerId: row.seller_player_id,
    priceCents: row.price_cents,
    feePercent: row.fee_percent,
    listedAt: row.listed_at,
    soldAt: row.sold_at,
    buyerPlayerId: row.buyer_player_id,
    status: row.status,
  }));
}
