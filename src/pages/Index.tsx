import { useState } from 'react';
import CosmicGame from '../components/CosmicGame';
import GameHUD from '../components/GameHUD';
import MainMenu from '../components/MainMenu';

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ backgroundColor: '#050510' }}>
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
