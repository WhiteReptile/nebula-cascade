import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTermsAcceptance() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);

  useEffect(() => {
    const loadTermsAcceptance = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setHasAcceptedTerms(false);
        return;
      }

      const { data: player, error } = await supabase
        .from('players')
        .select('accepted_terms_version')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error || !player) {
        setHasAcceptedTerms(false);
        return;
      }

      setHasAcceptedTerms(player.accepted_terms_version === '1.0');
    };

    loadTermsAcceptance();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadTermsAcceptance());
    return () => subscription.unsubscribe();
  }, []);

  return { hasAcceptedTerms };
}
