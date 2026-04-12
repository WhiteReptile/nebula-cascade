import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getActiveListings, buyCard, cancelListing, type MarketplaceListing } from '@/lib/marketplaceSystem';
import { getCardsForPlayer, setActiveCard, type CardMetadata } from '@/lib/cardSystem';
import { getCardEnergy, type CardEnergy } from '@/lib/energySystem';
import { DIVISION_LABELS, DIVISION_COLORS, type Division } from '@/lib/divisionSystem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WalletConnect from '@/components/wallet/WalletConnect';

type EnrichedListing = MarketplaceListing & { cardName?: string; cardDivision?: Division; cardColor?: string };

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // My Cards state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [cards, setCards] = useState<CardMetadata[]>([]);
  const [cardEnergies, setCardEnergies] = useState<Record<string, CardEnergy>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: player } = await supabase
          .from('players')
          .select('id, wallet_address, active_card_id')
          .eq('user_id', userData.user.id)
          .single();
        if (player) {
          setPlayerId(player.id);
          setWalletAddress(player.wallet_address ?? null);
          setActiveCardId(player.active_card_id ?? null);

          // Load owned cards + energies
          const playerCards = await getCardsForPlayer(player.id);
          setCards(playerCards);
          const energies: Record<string, CardEnergy> = {};
          for (const card of playerCards) {
            const energy = await getCardEnergy(card.id);
            if (energy) energies[card.id] = energy;
          }
          setCardEnergies(energies);
        }
      }

      // Load marketplace listings
      const active = await getActiveListings();
      const cardIds = active.map(l => l.cardId);
      const { data: listingCards } = await supabase
        .from('cards')
        .select('id, name, division, color_hex')
        .in('id', cardIds.length > 0 ? cardIds : ['00000000-0000-0000-0000-000000000000']);
      const cardMap = new Map(listingCards?.map(c => [c.id, c]) ?? []);

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
    const active = await getActiveListings();
    setListings(active as any);
  };

  const handleCancel = async (listingId: string) => {
    await cancelListing(listingId);
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  const handleSetActive = async (cardId: string) => {
    if (!playerId) return;
    const ok = await setActiveCard(playerId, cardId);
    if (ok) setActiveCardId(cardId);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm">← Back</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          MARKETPLACE
        </h1>
        <div />
      </div>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="w-full bg-black/60 border border-white/10 rounded-lg p-1 mb-6">
            <TabsTrigger
              value="marketplace"
              className="flex-1 font-mono uppercase tracking-widest text-xs data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 data-[state=active]:shadow-none text-white/40 rounded-md transition-all"
            >
              Marketplace
            </TabsTrigger>
            <TabsTrigger
              value="my-cards"
              className="flex-1 font-mono uppercase tracking-widest text-xs data-[state=active]:bg-yellow-400/10 data-[state=active]:text-yellow-400 data-[state=active]:shadow-none text-white/40 rounded-md transition-all"
            >
              My Cards / Wallet
            </TabsTrigger>
          </TabsList>

          {/* ── MARKETPLACE TAB ── */}
          <TabsContent value="marketplace">
            <p className="text-white/40 text-xs text-center mb-6 uppercase tracking-widest">
              Browse & trade cards
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
          </TabsContent>

          {/* ── MY CARDS / WALLET TAB ── */}
          <TabsContent value="my-cards">
            <div className="space-y-6">
              {/* Owned cards */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
                <h2 className="text-sm uppercase tracking-widest text-white/40 font-mono mb-4">
                  Your Cards ({cards.length}/10)
                </h2>
                {loading ? (
                  <div className="text-center text-white/40 py-8">Loading...</div>
                ) : cards.length === 0 ? (
                  <div className="text-white/30 text-center py-8">No cards yet</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cards.map(card => {
                      const energy = cardEnergies[card.id];
                      const isActive = card.id === activeCardId;
                      return (
                        <div
                          key={card.id}
                          className={`rounded-lg border p-4 flex flex-col gap-2 transition-all cursor-pointer ${
                            isActive ? 'ring-2 ring-yellow-400/50' : ''
                          }`}
                          style={{
                            borderColor: isActive ? '#ffdd0060' : `${card.colorHex}40`,
                            background: `${card.colorHex}08`,
                          }}
                          onClick={() => handleSetActive(card.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                              style={{
                                background: `radial-gradient(circle, ${card.colorHex}, ${card.colorHex}60)`,
                                boxShadow: `0 0 12px ${card.colorHex}60`,
                              }}
                            >
                              {card.tokenId}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold" style={{ color: card.colorHex }}>{card.name}</div>
                              <div className="text-[10px] text-white/40">
                                {DIVISION_LABELS[card.division]} {isActive && <span className="text-yellow-400">• ACTIVE</span>}
                              </div>
                            </div>
                            {energy && (
                              <div className="text-sm font-bold" style={{ color: energy.energy > 0 ? '#66ffee' : '#ff4444' }}>
                                ⚡ {energy.energy}/{energy.maxEnergy}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Wallet connection */}
              <WalletConnect currentAddress={walletAddress} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
