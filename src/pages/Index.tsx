import { useState } from 'react';
import CosmicGame from '../components/game/CosmicGame';
import GameHUD from '../components/game/GameHUD';
import MainMenu from '../components/menu/MainMenu';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#050510', width: '100vw', height: '100vh' }}>
      {showMenu ? (
        <MainMenu onStart={() => setShowMenu(false)} />
      ) : (
        <>
          <CosmicGame />
          <GameHUD />
        </>
      )}
    </div>
  );
};

export default Index;
