import { useEffect, useState } from 'react';
import CosmicGame from '@/components/game/CosmicGame';
import GameHUD from '@/components/game/GameHUD';
import MainMenu from '@/components/menu/MainMenu';
import GuestNicknameModal from '@/components/menu/GuestNicknameModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { getGuestNickname } from '@/lib/guestSession';
import SEO from '@/components/SEO';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [guestPrompt, setGuestPrompt] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('game-shell-active');
    document.body.classList.add('game-shell-active');
    return () => {
      document.documentElement.classList.remove('game-shell-active');
      document.body.classList.remove('game-shell-active');
    };
  }, []);

  // Play pressed: if not logged in and no guest nickname yet, prompt one.
  const handleStart = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user && !getGuestNickname()) {
      setGuestPrompt(true);
      return;
    }
    setShowMenu(false);
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#050510', width: '100vw', height: '100vh' }}>
      <SEO
        title="Nebula Cascade — Cosmic Card Puzzle on Base"
        description="Skill-based cosmic card puzzle. Match orbs, climb divisions, earn rewards. NFT cards on Base by ColdLogic."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: 'Nebula Cascade',
          alternateName: 'Nebula: ColdLogic',
          genre: ['Puzzle', 'Match-3'],
          gamePlatform: 'Web Browser',
          applicationCategory: 'Game',
          operatingSystem: 'Any (Web)',
          publisher: { '@type': 'Organization', name: 'ColdLogic' },
        }}
      />
      {showMenu ? (
        <MainMenu onStart={handleStart} />
      ) : (
        <>
          <GameHUD />
          <ErrorBoundary>
            <CosmicGame />
          </ErrorBoundary>
        </>
      )}

      <GuestNicknameModal
        open={guestPrompt}
        onConfirm={() => { setGuestPrompt(false); setShowMenu(false); }}
        onCancel={() => setGuestPrompt(false)}
      />
    </div>
  );
};

export default Index;
