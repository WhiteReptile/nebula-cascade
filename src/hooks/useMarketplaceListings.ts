/**
 * useMarketplaceListings — Active listings + realtime refresh.
 *
 * Subscribes to `marketplace_listings` so the Trade tab updates instantly
 * when anyone (including the current user in another tab) lists, buys,
 * or cancels a card. Card metadata (name/division/color) is joined client-side.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getActiveListings, type MarketplaceListing } from '@/lib/marketplaceSystem';
import type { Division } from '@/lib/divisionSystem';

export type EnrichedListing = MarketplaceListing & {
  cardName?: string;
  cardDivision?: Division;
  cardColor?: string;
};

export function useMarketplaceListings() {
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const active = await getActiveListings();
    const cardIds = active.map((l) => l.cardId);
    const { data: cards } = await supabase
      .from('cards')
      .select('id, name, division, color_hex')
      .in('id', cardIds.length > 0 ? cardIds : ['00000000-0000-0000-0000-000000000000']);
    const map = new Map(cards?.map((c) => [c.id, c]) ?? []);
    setListings(
      active.map((l) => {
        const c = map.get(l.cardId);
        return {
          ...l,
          cardName: c?.name ?? 'Unknown',
          cardDivision: (c?.division as Division) ?? 'gem_v',
          cardColor: c?.color_hex ?? '#5599ff',
        };
      })
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel('marketplace_listings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_listings' },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { listings, loading, refresh };
}
