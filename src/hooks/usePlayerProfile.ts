import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Division } from '@/lib/divisionSystem';
import type { CardMetadata } from '@/lib/cardSystem';

export function usePlayerProfile() {
  const [playerDivision, setPlayerDivision] = useState<Division | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardMetadata | null>(null);

  useEffect(() => {
    const loadPlayer = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setIsLoggedIn(false);
        setPlayerDivision(null);
        setPlayerId(null);
        setActiveCard(null);
        return;
      }
      setIsLoggedIn(true);
      const { data: player } = await supabase
        .from('players')
        .select('id, division, active_card_id')
        .eq('user_id', userData.user.id)
        .single();

      if (player) {
        setPlayerDivision(player.division as Division);
        setPlayerId(player.id);

        if (player.active_card_id) {
          const { data: card } = await supabase
            .from('cards')
            .select('*')
            .eq('id', player.active_card_id)
            .single();

          if (card) {
            setActiveCard({
              id: card.id,
              tokenId: card.token_id,
              division: card.division as Division,
              name: card.name,
              colorHex: card.color_hex,
              imageUrl: card.image_url,
              flavorText: card.flavor_text ?? '',
              priceCents: card.price_cents ?? 0,
              isActive: card.is_active ?? false,
              ownerWallet: card.owner_wallet,
              ownerPlayerId: card.owner_player_id,
              metadata: (card.metadata as Record<string, unknown>) ?? {},
            });
          }
        }
      }
    };
    loadPlayer();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadPlayer());
    return () => subscription.unsubscribe();
  }, []);

  return { playerDivision, isLoggedIn, playerId, activeCard };
}
