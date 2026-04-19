import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameEvents } from '../../game/events';
import { PieceDef } from '../../game/pieces';
import { logMatch } from '@/lib/matchLogger';
import DivisionBadge from './DivisionBadge';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import HypeOverlay from './HypeOverlay';
import GravityCompass from './GravityCompass';


const GameHUD = () => {
  const navigate = useNavigate();
  const { playerDivision, isLoggedIn } = usePlayerProfile();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [nextPiece, setNextPiece] = useState<PieceDef | null>(null);
  const [gameOverScore, setGameOverScore] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [chainCombo, setChainCombo] = useState(0);
  const [chainVisible, setChainVisible] = useState(false);
  const [triColorActive, setTriColorActive] = useState(false);

  // Galaxy background canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number; brightness: number }[]>([]);
  const nebulasRef = useRef<{ x: number; y: number; r: number; color: string; phase: number }[]>([]);

  useEffect(() => {
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.0001 + 0.00005,
      brightness: Math.random() * 0.6 + 0.4,
    }));
    nebulasRef.current = [
      { x: 0.3, y: 0.4, r: 180, color: '100, 255, 238', phase: 0 },
      { x: 0.7, y: 0.6, r: 150, color: '120, 80, 255', phase: 2 },
      { x: 0.5, y: 0.2, r: 120, color: '80, 160, 255', phase: 4 },
    ];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;
    const draw = () => {
      t += 1;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, w, h);
      for (const neb of nebulasRef.current) {
        const nx = neb.x * w + Math.sin(t * 0.003 + neb.phase) * 40;
        const ny = neb.y * h + Math.cos(t * 0.002 + neb.phase) * 30;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, neb.r);
        grad.addColorStop(0, `rgba(${neb.color}, 0.06)`);
        grad.addColorStop(1, `rgba(${neb.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(nx - neb.r, ny - neb.r, neb.r * 2, neb.r * 2);
      }
      for (const star of starsRef.current) {
        star.y += star.speed;
        if (star.y > 1) star.y = 0;
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.05 + star.x * 100);
        ctx.fillStyle = `rgba(200, 220, 255, ${star.brightness * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const onHUD = (data: { score: number; level: number; combo: number }) => {
      setScore(data.score); setLevel(data.level); setCombo(data.combo);
    };
    const onNext = (def: PieceDef) => setNextPiece(def);
    const onGameOver = (finalScore: number) => setGameOverScore(finalScore);
    const onPause = (p: boolean) => setPaused(p);
    const onRestart = () => setGameOverScore(null);
    const onChainCombo = (step: number) => {
      setChainCombo(step); setChainVisible(true); setTriColorActive(false);
    };
    const onTriColor = () => setTriColorActive(true);
    const onMatchEnd = (data: any) => { logMatch(data).catch(console.error); };

    gameEvents.on('hud', onHUD);
    gameEvents.on('nextPiece', onNext);
    gameEvents.on('gameover', onGameOver);
    gameEvents.on('pause', onPause);
    gameEvents.on('restart', onRestart);
    gameEvents.on('chainCombo', onChainCombo);
    gameEvents.on('triColor', onTriColor);
    gameEvents.on('matchEnd', onMatchEnd);
    return () => {
      gameEvents.off('hud', onHUD);
      gameEvents.off('nextPiece', onNext);
      gameEvents.off('gameover', onGameOver);
      gameEvents.off('pause', onPause);
      gameEvents.off('restart', onRestart);
      gameEvents.off('chainCombo', onChainCombo);
      gameEvents.off('triColor', onTriColor);
      gameEvents.off('matchEnd', onMatchEnd);
    };
  }, []);

  useEffect(() => {
    if (!chainVisible) return;
    const timer = setTimeout(() => setChainVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [chainVisible, chainCombo]);

  const handleRestart = () => { setGameOverScore(null); gameEvents.emit('restart'); };

  const chainGlowSize = Math.min(10 + chainCombo * 5, 40);
  const chainColor = triColorActive ? undefined : chainCombo >= 3 ? '#ff3344' : chainCombo >= 2 ? '#ffdd00' : '#3388ff';
  const chainLabel = triColorActive ? 'TRI-COLOR' : 'CHAIN';

  return (
    <>
      {/* Galaxy background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />
      <div className="menu-scanlines fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
      <HypeOverlay />
      <GravityCompass />

      {/* Unified 3-column layout */}
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <div className="flex items-stretch gap-4 md:gap-6 h-full max-h-[90vh] py-4">

          {/* LEFT PANEL */}
          <div className="flex flex-col justify-between w-[160px] md:w-[200px] font-mono select-none shrink-0">
            {/* Title */}
            <div className="text-center mb-3">
              <h1
                className="text-lg md:text-xl font-black tracking-[0.3em] uppercase"
                style={{ color: '#e0f8ff', textShadow: '0 0 8px rgba(102,255,238,0.9), 0 0 20px rgba(102,255,238,0.6)' }}
              >
                NEBULA
              </h1>
              <div
                className="text-[9px] md:text-[10px] uppercase tracking-[0.5em]"
                style={{ color: '#88cccc', textShadow: '0 0 6px rgba(102,255,238,0.5)' }}
              >
                CASCADE
              </div>
              <div className="mx-auto mt-2 mb-3" style={{ width: 100, height: 1, background: 'linear-gradient(90deg, transparent, rgba(102,255,238,0.5), transparent)' }} />
            </div>

            {/* Score */}
            <div className="rounded-lg border border-yellow-500/30 bg-black/50 px-4 py-3 backdrop-blur-sm mb-3">
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,221,0,0.7)' }}>Score</div>
              <div className="text-2xl md:text-3xl font-black" style={{ color: '#ffdd00', textShadow: '0 0 12px #ffdd00' }}>
                {score.toLocaleString()}
              </div>
            </div>

            {/* Level */}
            <div className="rounded-lg border border-blue-500/30 bg-black/50 px-4 py-3 backdrop-blur-sm mb-3">
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(80,160,255,0.7)' }}>Level</div>
              <div className="text-xl md:text-2xl font-bold" style={{ color: '#5599ff', textShadow: '0 0 10px #3388ff' }}>
                {level}
              </div>
            </div>

            {/* Combo */}
            <div
              className={`rounded-lg border bg-black/50 px-4 py-3 backdrop-blur-sm mb-3 transition-all duration-300 ${
                combo > 1 ? 'border-red-500/50' : 'border-white/10'
              }`}
              style={combo > 1 ? { boxShadow: '0 0 15px rgba(255,50,50,0.2)' } : undefined}
            >
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: combo > 1 ? 'rgba(255,80,80,0.8)' : 'rgba(255,255,255,0.3)' }}>Combo</div>
              <div
                className={`text-xl md:text-2xl font-bold transition-all duration-300 ${combo > 1 ? 'animate-pulse' : ''}`}
                style={{ color: combo > 1 ? '#ff4444' : 'rgba(255,255,255,0.2)', textShadow: combo > 1 ? '0 0 10px #ff3344' : 'none' }}
              >
                x{combo > 1 ? combo : 0}
              </div>
            </div>

            {/* Division */}
            {playerDivision && (
              <div className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm mb-3">
                <div className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Division</div>
                <DivisionBadge division={playerDivision} size="md" />
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Back to menu */}
            <button
              onClick={() => navigate('/')}
              className="text-xs uppercase tracking-[0.15em] py-2 rounded border border-white/10 bg-black/30 transition-colors hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              ← MENU
            </button>
          </div>

          {/* CENTER — Game Canvas with cyber frame */}
          <div className="game-cyber-frame relative shrink-0" style={{ padding: '3px' }}>
            <div
              className="relative rounded-lg overflow-hidden w-full h-full"
              style={{
                width: 'min(78vh, 620px)',
                height: 'min(85.8vh, 655px)',
              }}
              id="game-container"
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col justify-between w-[160px] md:w-[200px] font-mono select-none shrink-0">
            {/* Next Piece */}
            <div className="rounded-lg border border-yellow-500/20 bg-black/50 px-4 py-3 backdrop-blur-sm mb-3">
              <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,221,0,0.7)' }}>Next</div>
              <div className="flex items-center justify-center" style={{ width: 90, height: 90, margin: '0 auto' }}>
                {nextPiece && (
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <defs>
                      <radialGradient id="orbGlow">
                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="60%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {nextPiece.shapes[0].map(([r, c], i) => {
                      const cx = 18 + c * 22;
                      const cy = 18 + r * 22;
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r={12} fill={nextPiece.colorCSS} opacity={0.2} />
                          <circle cx={cx} cy={cy} r={9} fill={nextPiece.colorCSS} opacity={0.85} />
                          <circle cx={cx - 2} cy={cy - 2} r={3} fill="white" opacity={0.4} />
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm mb-3">
              <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Controls</div>
              <div className="text-sm space-y-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div className="flex justify-between"><span style={{ color: 'rgba(102,255,238,0.7)' }}>← →</span><span>Move</span></div>
                <div className="flex justify-between"><span style={{ color: 'rgba(102,255,238,0.7)' }}>↑</span><span>Rotate</span></div>
                <div className="flex justify-between"><span style={{ color: 'rgba(102,255,238,0.7)' }}>↓</span><span>Soft drop</span></div>
                <div className="flex justify-between"><span style={{ color: 'rgba(255,221,0,0.7)' }}>Z</span><span>Force drop</span></div>
                <div className="flex justify-between"><span style={{ color: 'rgba(255,221,0,0.7)' }}>Space</span><span>Pause</span></div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Leaderboard shortcut */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-xs uppercase tracking-[0.15em] py-2 rounded border border-blue-500/20 bg-black/30 transition-colors hover:bg-blue-500/10"
              style={{ color: 'rgba(80,160,255,0.6)' }}
            >
              🏆 LEADERBOARD
            </button>
          </div>
        </div>
      </div>

      {/* Chain combo counter — center screen overlay */}
      {chainVisible && chainCombo >= 1 && (
        <div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 10, animation: 'chainPop 0.4s ease-out forwards' }}
        >
          <div
            className="text-5xl font-black font-mono tracking-wider"
            style={{
              color: triColorActive ? undefined : chainColor ?? '#3388ff',
              background: triColorActive ? 'linear-gradient(90deg, #ffdd00, #ff3344, #3388ff)' : undefined,
              WebkitBackgroundClip: triColorActive ? 'text' : undefined,
              WebkitTextFillColor: triColorActive ? 'transparent' : undefined,
              textShadow: triColorActive
                ? `0 0 ${chainGlowSize}px #ffdd00, 0 0 ${chainGlowSize}px #ff3344, 0 0 ${chainGlowSize}px #3388ff`
                : `0 0 ${chainGlowSize}px ${chainColor}, 0 0 ${chainGlowSize * 2}px ${chainColor}40`,
              transform: `scale(${1 + chainCombo * 0.15})`,
            }}
          >
            {chainLabel} x{chainCombo}!
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {gameOverScore !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 20 }}>
          <div className="text-center font-mono">
            <div className="text-4xl font-bold mb-2" style={{ color: '#ff4444', textShadow: '0 0 20px #ff3344' }}>
              GAME OVER
            </div>
            <div className="text-lg mb-6" style={{ color: '#ffdd00' }}>
              Final Score: {gameOverScore.toLocaleString()}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="rounded-lg border border-yellow-500/50 bg-yellow-500/20 px-6 py-2 hover:bg-yellow-500/30 transition-colors"
                style={{ color: '#ffdd00', textShadow: '0 0 8px #ffdd00' }}
              >
                RESTART
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="rounded-lg border border-blue-500/50 bg-blue-500/20 px-6 py-2 hover:bg-blue-500/30 transition-colors"
                style={{ color: '#5599ff', textShadow: '0 0 8px #3388ff' }}
              >
                LEADERBOARD
              </button>
            </div>
            {!isLoggedIn && (
              <button
                onClick={() => navigate('/auth')}
                className="rounded-lg border border-green-500/50 bg-green-500/20 px-6 py-2 hover:bg-green-500/30 transition-colors mt-3"
                style={{ color: '#33ff88', textShadow: '0 0 8px #33ff88' }}
              >
                SIGN IN TO TRACK SCORES
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={() => navigate('/marketplace')}
                className="rounded-lg border border-purple-500/50 bg-purple-500/20 px-6 py-2 hover:bg-purple-500/30 transition-colors mt-3"
                style={{ color: '#aa88ff', textShadow: '0 0 8px #aa66ff' }}
              >
                🃏 CARDS
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {paused && gameOverScore === null && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
          <div className="text-3xl font-bold font-mono animate-pulse" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 0 20px #ffffff' }}>
            PAUSED
          </div>
        </div>
      )}

      <style>{`
        @keyframes chainPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes neonBorderSpin {
          0% { --angle: 0deg; }
          100% { --angle: 360deg; }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .game-cyber-frame {
          position: relative;
          border-radius: 12px;
          background:
            linear-gradient(135deg, rgba(102,255,238,0.25), rgba(140,100,255,0.2), rgba(80,160,255,0.25), rgba(102,255,238,0.25));
          background-size: 300% 300%;
          animation: neonBorderShift 4s ease infinite;
          box-shadow:
            0 0 15px rgba(102,255,238,0.15),
            0 0 40px rgba(102,255,238,0.06),
            0 0 80px rgba(140,100,255,0.04),
            inset 0 0 20px rgba(0,0,0,0.3);
        }

        @keyframes neonBorderShift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }

        /* Corner accent brackets */
        .game-cyber-frame::before,
        .game-cyber-frame::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          z-index: 3;
          pointer-events: none;
        }

        .game-cyber-frame::before {
          top: -1px;
          left: -1px;
          border-top: 2px solid rgba(102,255,238,0.6);
          border-left: 2px solid rgba(102,255,238,0.6);
          border-top-left-radius: 12px;
          box-shadow: -2px -2px 8px rgba(102,255,238,0.2);
        }

        .game-cyber-frame::after {
          bottom: -1px;
          right: -1px;
          border-bottom: 2px solid rgba(140,100,255,0.5);
          border-right: 2px solid rgba(140,100,255,0.5);
          border-bottom-right-radius: 12px;
          box-shadow: 2px 2px 8px rgba(140,100,255,0.2);
        }

        /* Circuit pattern overlay via pseudo on inner container */
        #game-container {
          position: relative;
        }

        #game-container::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          border-radius: 8px;
          background:
            /* Horizontal circuit lines */
            linear-gradient(0deg, transparent 49.5%, rgba(102,255,238,0.03) 49.5%, rgba(102,255,238,0.03) 50.5%, transparent 50.5%) 0 0 / 100% 40px,
            /* Vertical circuit lines */
            linear-gradient(90deg, transparent 49.5%, rgba(102,255,238,0.03) 49.5%, rgba(102,255,238,0.03) 50.5%, transparent 50.5%) 0 0 / 40px 100%,
            /* Circuit dots grid */
            radial-gradient(circle 1px, rgba(102,255,238,0.06) 1px, transparent 1px) 0 0 / 40px 40px;
        }

        /* Scanning line across game area */
        #game-container::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 2px;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(102,255,238,0.12), transparent);
          animation: scanLine 6s linear infinite;
        }

        /* Pulsing top/bottom neon edge lines */
        .game-cyber-frame > .neon-top,
        .game-cyber-frame > .neon-bottom {
          position: absolute;
          left: 15%;
          width: 70%;
          height: 1px;
          pointer-events: none;
          z-index: 3;
        }
      `}</style>
    </>
  );
};

export default GameHUD;
