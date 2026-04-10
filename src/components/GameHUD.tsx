import { useEffect, useState } from 'react';
import { gameEvents } from '../game/GameScene';
import { PIECES, PieceDef, CELL } from '../game/pieces';

const GameHUD = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [nextPiece, setNextPiece] = useState<PieceDef | null>(null);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onHUD = (data: { score: number; level: number; combo: number }) => {
      setScore(data.score);
      setLevel(data.level);
      setCombo(data.combo);
    };
    const onNext = (def: PieceDef) => setNextPiece(def);
    const onGameOver = (finalScore: number) => setGameOverScore(finalScore);
    const onPause = (p: boolean) => setPaused(p);
    const onRestart = () => setGameOverScore(null);

    gameEvents.on('hud', onHUD);
    gameEvents.on('nextPiece', onNext);
    gameEvents.on('gameover', onGameOver);
    gameEvents.on('pause', onPause);
    gameEvents.on('restart', onRestart);

    return () => {
      gameEvents.off('hud', onHUD);
      gameEvents.off('nextPiece', onNext);
      gameEvents.off('gameover', onGameOver);
      gameEvents.off('pause', onPause);
      gameEvents.off('restart', onRestart);
    };
  }, []);

  const handleRestart = () => {
    setGameOverScore(null);
    gameEvents.emit('restart');
  };

  const previewSize = 16;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Left panel */}
      <div className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 font-mono">
        <div className="rounded-lg border border-cyan-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-cyan-400/70">Score</div>
          <div className="text-2xl font-bold text-cyan-300" style={{ textShadow: '0 0 10px #00ffff' }}>
            {score.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-purple-400/70">Level</div>
          <div className="text-xl font-bold text-purple-300">{level}</div>
        </div>
        {combo > 1 && (
          <div className="rounded-lg border border-yellow-500/50 bg-black/60 px-4 py-3 backdrop-blur-sm animate-pulse">
            <div className="text-[10px] uppercase tracking-widest text-yellow-400/70">Combo</div>
            <div className="text-xl font-bold text-yellow-300" style={{ textShadow: '0 0 10px #ffdd00' }}>
              x{combo}
            </div>
          </div>
        )}
      </div>

      {/* Right panel - Next piece */}
      <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2">
        <div className="rounded-lg border border-cyan-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-cyan-400/70 font-mono mb-2">Next</div>
          {nextPiece && (
            <div className="flex items-center justify-center" style={{ width: 64, height: 64 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                {nextPiece.shapes[0].map(([r, c], i) => (
                  <rect
                    key={i}
                    x={8 + c * previewSize}
                    y={8 + r * previewSize}
                    width={previewSize - 2}
                    height={previewSize - 2}
                    fill={nextPiece.colorCSS}
                    opacity={0.9}
                    rx={2}
                  />
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 rounded-lg border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-sm">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mb-1">Controls</div>
          <div className="text-[10px] text-white/50 font-mono space-y-0.5">
            <div>← → Move</div>
            <div>↑ Rotate</div>
            <div>↓ Soft drop</div>
            <div>Z Force drop</div>
            <div>Space Pause</div>
          </div>
        </div>
      </div>

      {/* Game over overlay */}
      {gameOverScore !== null && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-400 font-mono mb-2" style={{ textShadow: '0 0 20px #ff4444' }}>
              GAME OVER
            </div>
            <div className="text-lg text-cyan-300 font-mono mb-6">
              Final Score: {gameOverScore.toLocaleString()}
            </div>
            <button
              onClick={handleRestart}
              className="rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-6 py-2 font-mono text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              style={{ textShadow: '0 0 8px #00ffff' }}
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {paused && gameOverScore === null && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-3xl font-bold text-white/80 font-mono animate-pulse" style={{ textShadow: '0 0 20px #ffffff' }}>
            PAUSED
          </div>
        </div>
      )}

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <h1 className="text-xl font-bold font-mono tracking-[0.3em] text-cyan-400/80" style={{ textShadow: '0 0 15px #00ffff' }}>
          COSMIC BLOCKS
        </h1>
      </div>
    </div>
  );
};

export default GameHUD;
