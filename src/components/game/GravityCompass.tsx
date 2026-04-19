import { useEffect, useState } from 'react';
import { gameEvents } from '../../game/events';

type GravityState = { dir: -1 | 0 | 1; strength: number };

/**
 * GravityCompass — Cosmic-themed circular HUD compass that visualizes
 * the active piece's gravity bias. Listens to the 'gravity' event from
 * GameScene and animates needle rotation + state-driven glow.
 *
 *   dir = -1 → needle points down-left  (135° from up)
 *   dir =  0 → needle points straight down, pulses (down-bias = faster fall)
 *   dir = +1 → needle points down-right (-135° from up, i.e. 225°)
 */
const GravityCompass = () => {
  const [grav, setGrav] = useState<GravityState>({ dir: 0, strength: 0 });

  useEffect(() => {
    const onGravity = (g: GravityState) => setGrav(g);
    gameEvents.on('gravity', onGravity);
    return () => { gameEvents.off('gravity', onGravity); };
  }, []);

  // Needle rotation (0deg = pointing up). Down = 180, DL = 225, DR = 135.
  const angle = grav.dir === -1 ? 225 : grav.dir === 1 ? 135 : 180;

  const isDown = grav.dir === 0;
  // Color theme by direction
  const accent = isDown ? '#ffdd00' : grav.dir === -1 ? '#66ffee' : '#aa88ff';
  const label = isDown ? 'DOWN · FAST' : grav.dir === -1 ? 'LEFT DRIFT' : 'RIGHT DRIFT';
  const pct = Math.round(grav.strength * 100);

  return (
    <div
      className="fixed font-mono select-none pointer-events-none"
      style={{ top: 16, right: 16, zIndex: 5 }}
    >
      <div
        className="rounded-xl backdrop-blur-md flex flex-col items-center"
        style={{
          padding: '10px 12px 8px',
          background: 'rgba(5, 5, 16, 0.55)',
          border: `1px solid ${accent}40`,
          boxShadow: `0 0 14px ${accent}33, inset 0 0 10px ${accent}1a`,
          animation: isDown ? 'gravityPulse 1.1s ease-in-out infinite' : undefined,
        }}
      >
        <div
          className="text-[9px] uppercase tracking-[0.3em] mb-1.5"
          style={{ color: `${accent}cc`, textShadow: `0 0 6px ${accent}99` }}
        >
          Gravity
        </div>

        <svg width="72" height="72" viewBox="-50 -50 100 100">
          <defs>
            <radialGradient id="compassBg">
              <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.04" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="needleGrad" x1="0" y1="-1" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="50%" stopColor={accent} />
              <stop offset="100%" stopColor={accent} stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Nebula glow disc */}
          <circle cx="0" cy="0" r="46" fill="url(#compassBg)" />

          {/* Outer ring */}
          <circle
            cx="0" cy="0" r="40"
            fill="none"
            stroke={`${accent}55`}
            strokeWidth="0.8"
          />
          <circle
            cx="0" cy="0" r="34"
            fill="none"
            stroke={`${accent}22`}
            strokeWidth="0.5"
            strokeDasharray="2 3"
          />

          {/* Cardinal tick marks (N/E/S/W + diagonals) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const isMain = deg % 90 === 0;
            const r1 = isMain ? 34 : 36;
            const r2 = 40;
            return (
              <line
                key={deg}
                x1={Math.sin(rad) * r1}
                y1={-Math.cos(rad) * r1}
                x2={Math.sin(rad) * r2}
                y2={-Math.cos(rad) * r2}
                stroke={`${accent}${isMain ? 'aa' : '55'}`}
                strokeWidth={isMain ? 1.2 : 0.6}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0px 0px',
              transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: `drop-shadow(0 0 5px ${accent}) drop-shadow(0 0 10px ${accent}88)`,
            }}
          >
            {/* Tail */}
            <polygon
              points="0,8 -3,0 3,0"
              fill={`${accent}66`}
            />
            {/* Head */}
            <polygon
              points="0,-30 -4.5,2 4.5,2"
              fill="url(#needleGrad)"
            />
            {/* Highlight stripe */}
            <line
              x1="0" y1="-28" x2="0" y2="0"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.6"
            />
          </g>

          {/* Hub */}
          <circle cx="0" cy="0" r="3.2" fill="#0a0a18" stroke={accent} strokeWidth="1" />
          <circle cx="0" cy="0" r="1.2" fill={accent} />
        </svg>

        <div
          className="text-[9px] uppercase tracking-[0.2em] mt-1"
          style={{ color: `${accent}dd`, textShadow: `0 0 5px ${accent}99` }}
        >
          {label}
        </div>
        <div
          className="text-[8px] tracking-[0.15em] mt-0.5"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          PULL {pct}%
        </div>
      </div>

      <style>{`
        @keyframes gravityPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.04); filter: brightness(1.25); }
        }
      `}</style>
    </div>
  );
};

export default GravityCompass;
