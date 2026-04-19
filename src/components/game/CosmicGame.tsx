import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '@/game/GameScene';

interface CosmicGameProps {
  onReady?: () => void;
}

const CosmicGame = ({ onReady }: CosmicGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const container = document.getElementById('game-container');
    if (!container || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container,
      width: 600,
      height: 720,
      backgroundColor: '#050510',
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: { default: 'arcade' },
      render: { antialias: true, pixelArt: false },
    };

    gameRef.current = new Phaser.Game(config);
    onReady?.();

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return null;
};

export default CosmicGame;
