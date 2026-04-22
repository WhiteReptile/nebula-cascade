import { useEffect, useState } from 'react';
import CosmicGame from '@/components/game/CosmicGame';
import GameHUD from '@/components/game/GameHUD';
import MainMenu from '@/components/menu/MainMenu';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);

  // Lock document scroll while the game/menu is mounted (this is the only fullscreen route)
  useEffect(() => {
    document.documentElement.classList.add('game-shell-active');
    document.body.classList.add('game-shell-active');
    return () => {
      document.documentElement.classList.remove('game-shell-active');
      document.body.classList.remove('game-shell-active');
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#050510', width: '100vw', height: '100vh' }}>
      {showMenu ? (
        <MainMenu onStart={() => setShowMenu(false)} />
      ) : (
        <>
          <GameHUD />
          <CosmicGame />
        </>
      )}
    </div>
  );
};

export default Index;
