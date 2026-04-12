import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import WalletConnect from '@/components/wallet/WalletConnect';
import { getCardsForPlayer, setActiveCard, type CardMetadata } from '@/lib/cardSystem';
import { getCardEnergy, type CardEnergy } from '@/lib/energySystem';
import { DIVISION_LABELS, DIVISION_COLORS } from '@/lib/divisionSystem';

const Cards = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [cards, setCards] = useState<CardMetadata[]>([]);
  const [cardEnergies, setCardEnergies] = useState<Record<string, CardEnergy>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          setWalletAddress(player.wallet_address ?? null);
          setActiveCardId(player.active_card_id ?? null);
          setPlayerId(player.id);
          const playerCards = await getCardsForPlayer(player.id);
          setCards(playerCards);

          // Load energies
          const energies: Record<string, CardEnergy> = {};
          for (const card of playerCards) {
            const energy = await getCardEnergy(card.id);
            if (energy) energies[card.id] = energy;
          }
          setCardEnergies(energies);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSetActive = async (cardId: string) => {
    if (!playerId) return;
    const ok = await setActiveCard(playerId, cardId);
    if (ok) setActiveCardId(cardId);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center font-mono">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm">← Back</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          CARDS
        </h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <WalletConnect currentAddress={walletAddress} />

        {/* Cards display */}
        <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
          <h2 className="text-sm uppercase tracking-widest text-white/40 font-mono mb-4">
            Your Cards ({cards.length}/10)
          </h2>
          {cards.length === 0 ? (
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
      </div>
    </div>
  );
};

export default Cards;
