import { useEffect, useState } from 'react';
import CosmicGame from '@/components/game/CosmicGame';
import GameHUD from '@/components/game/GameHUD';
import MainMenu from '@/components/menu/MainMenu';
import GuestNicknameModal from '@/components/menu/GuestNicknameModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { getGuestNickname } from '@/lib/guestSession';

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
