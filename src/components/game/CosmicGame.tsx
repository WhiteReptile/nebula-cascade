import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../../game/GameScene';

interface CosmicGameProps {
  onReady?: () => void;
}

const CosmicGame = ({ onReady }: CosmicGameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

export default CosmicGame;
