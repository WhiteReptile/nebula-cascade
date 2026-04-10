import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Division } from '@/lib/divisionSystem';

export function usePlayerProfile() {
  const [playerDivision, setPlayerDivision] = useState<Division | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadPlayer = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setIsLoggedIn(false);
        setPlayerDivision(null);
        return;
      }
      setIsLoggedIn(true);
      const { data: player } = await supabase
        .from('players')
        .select('division')
        .eq('user_id', userData.user.id)
        .single();
      if (player) setPlayerDivision(player.division as Division);
    };
    loadPlayer();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadPlayer());
    return () => subscription.unsubscribe();
  }, []);

  return { playerDivision, isLoggedIn };
}
