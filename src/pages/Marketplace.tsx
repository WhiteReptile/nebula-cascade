import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getActiveListings, buyCard, cancelListing, type MarketplaceListing } from '@/lib/marketplaceSystem';
import { DIVISION_LABELS, DIVISION_COLORS, type Division } from '@/lib/divisionSystem';

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<(MarketplaceListing & { cardName?: string; cardDivision?: Division; cardColor?: string })[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: player } = await supabase
          .from('players')
          .select('id')
          .eq('user_id', userData.user.id)
          .single();
        if (player) setPlayerId(player.id);
      }

      const active = await getActiveListings();

      // Enrich with card data
      const cardIds = active.map(l => l.cardId);
      const { data: cards } = await supabase
        .from('cards')
        .select('id, name, division, color_hex')
        .in('id', cardIds.length > 0 ? cardIds : ['00000000-0000-0000-0000-000000000000']);

      const cardMap = new Map(cards?.map(c => [c.id, c]) ?? []);

      setListings(active.map(l => {
        const card = cardMap.get(l.cardId);
        return {
          ...l,
          cardName: card?.name ?? 'Unknown',
          cardDivision: (card?.division as Division) ?? 'gem_v',
          cardColor: card?.color_hex ?? '#ffffff',
        };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const handleBuy = async (listingId: string) => {
    if (!playerId) return;
    await buyCard(listingId, playerId);
    // Refresh
    const active = await getActiveListings();
    setListings(active as any);
  };

  const handleCancel = async (listingId: string) => {
    await cancelListing(listingId);
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm">← Back</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          MARKETPLACE
        </h1>
        <div />
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="text-white/40 text-xs text-center mb-6 uppercase tracking-widest">
          Compete for rewards from the pool
        </p>

        {loading ? (
          <div className="text-center text-white/40 py-12">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-white/30 py-12">No active listings</div>
        ) : (
          <div className="space-y-3">
            {listings.map(listing => (
              <div
                key={listing.id}
                className="rounded-lg border border-white/10 bg-black/50 p-4 flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle, ${listing.cardColor}, ${listing.cardColor}60)`,
                    boxShadow: `0 0 12px ${listing.cardColor}40`,
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: listing.cardColor }}>{listing.cardName}</div>
                  <div className="text-[10px] text-white/40">
                    {DIVISION_LABELS[listing.cardDivision!]} • Fee: {listing.feePercent}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-400">
                    ${(listing.priceCents / 100).toFixed(2)}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {playerId && listing.sellerPlayerId !== playerId && (
                      <button
                        onClick={() => handleBuy(listing.id)}
                        className="text-[10px] px-2 py-0.5 rounded border border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        BUY
                      </button>
                    )}
                    {playerId && listing.sellerPlayerId === playerId && (
                      <button
                        onClick={() => handleCancel(listing.id)}
                        className="text-[10px] px-2 py-0.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
