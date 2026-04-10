import { useEffect, useState } from 'react';
import { gameEvents } from '../game/GameScene';
import { PieceDef } from '../game/pieces';

const GameHUD = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [nextPiece, setNextPiece] = useState<PieceDef | null>(null);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [chainCombo, setChainCombo] = useState(0);
  const [chainVisible, setChainVisible] = useState(false);

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
    const onChainCombo = (step: number) => {
      setChainCombo(step);
      setChainVisible(true);
    };

    gameEvents.on('hud', onHUD);
    gameEvents.on('nextPiece', onNext);
    gameEvents.on('gameover', onGameOver);
    gameEvents.on('pause', onPause);
    gameEvents.on('restart', onRestart);
    gameEvents.on('chainCombo', onChainCombo);

    return () => {
      gameEvents.off('hud', onHUD);
      gameEvents.off('nextPiece', onNext);
      gameEvents.off('gameover', onGameOver);
      gameEvents.off('pause', onPause);
      gameEvents.off('restart', onRestart);
      gameEvents.off('chainCombo', onChainCombo);
    };
  }, []);

  // Auto-hide chain counter after 2s
  useEffect(() => {
    if (!chainVisible) return;
    const timer = setTimeout(() => setChainVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [chainVisible, chainCombo]);

  const handleRestart = () => {
    setGameOverScore(null);
    gameEvents.emit('restart');
  };

  // Chain glow intensity scales with combo step
  const chainGlowSize = Math.min(10 + chainCombo * 5, 40);
  const chainColor = chainCombo >= 3 ? '#ff3344' : chainCombo >= 2 ? '#ffdd00' : '#3388ff';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Left panel */}
      <div className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 font-mono">
        <div className="rounded-lg border border-yellow-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-yellow-400/70">Score</div>
          <div className="text-2xl font-bold text-yellow-300" style={{ textShadow: '0 0 10px #ffdd00' }}>
            {score.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-black/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-blue-400/70">Level</div>
          <div className="text-xl font-bold text-blue-300">{level}</div>
        </div>
        {combo > 1 && (
          <div className="rounded-lg border border-red-500/50 bg-black/60 px-4 py-3 backdrop-blur-sm animate-pulse">
            <div className="text-[10px] uppercase tracking-widest text-red-400/70">Combo</div>
            <div className="text-xl font-bold text-red-300" style={{ textShadow: '0 0 10px #ff3344' }}>
              x{combo}
            </div>
          </div>
        )}
      </div>

      {/* Right panel - Next piece */}
      <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2">
        <div className="rounded-lg border border-yellow-500/20 bg-black/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-widest text-yellow-400/70 font-mono mb-2">Next</div>
          {nextPiece && (
            <div className="flex items-center justify-center" style={{ width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <defs>
                  <radialGradient id="orbGlow">
                    <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {nextPiece.shapes[0].map(([r, c], i) => {
                  const cx = 14 + c * 18;
                  const cy = 14 + r * 18;
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r={10} fill={nextPiece.colorCSS} opacity={0.2} />
                      <circle cx={cx} cy={cy} r={7} fill={nextPiece.colorCSS} opacity={0.85} />
                      <circle cx={cx - 2} cy={cy - 2} r={2.5} fill="white" opacity={0.4} />
                    </g>
                  );
                })}
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

      {/* Chain combo counter — center screen */}
      {chainVisible && chainCombo >= 1 && (
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            animation: 'chainPop 0.4s ease-out forwards',
          }}
        >
          <div
            className="text-5xl font-black font-mono tracking-wider"
            style={{
              color: chainColor,
              textShadow: `0 0 ${chainGlowSize}px ${chainColor}, 0 0 ${chainGlowSize * 2}px ${chainColor}40`,
              transform: `scale(${1 + chainCombo * 0.15})`,
            }}
          >
            CHAIN x{chainCombo}!
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {gameOverScore !== null && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-400 font-mono mb-2" style={{ textShadow: '0 0 20px #ff3344' }}>
              GAME OVER
            </div>
            <div className="text-lg text-yellow-300 font-mono mb-6">
              Final Score: {gameOverScore.toLocaleString()}
            </div>
            <button
              onClick={handleRestart}
              className="rounded-lg border border-yellow-500/50 bg-yellow-500/20 px-6 py-2 font-mono text-yellow-300 hover:bg-yellow-500/30 transition-colors"
              style={{ textShadow: '0 0 8px #ffdd00' }}
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
        <h1 className="text-xl font-bold font-mono tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          COSMIC ORBS
        </h1>
      </div>

      {/* Chain pop animation keyframes */}
      <style>{`
        @keyframes chainPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GameHUD;
