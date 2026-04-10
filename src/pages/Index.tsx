import CosmicGame from '../components/CosmicGame';
import GameHUD from '../components/GameHUD';

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ backgroundColor: '#050510' }}>
      <CosmicGame />
      <GameHUD />
    </div>
  );
};

export default Index;
