import { useEffect, useState } from 'react';
import { gameEvents } from '@/game/events';

type GravityState = { dir: -1 | 0 | 1; strength: number };

/**
 * GravityCompass — Inline HUD compass (lives inside the LEFT panel above Combo).
 * Doubled in size from the previous fixed-corner version.
 *
 *   dir = -1 → needle points down-left  (225°)
 *   dir =  0 → needle straight down, pulses (fast fall)
 *   dir = +1 → needle down-right (135°)
 */
const GravityCompass = () => {
  const [grav, setGrav] = useState<GravityState>({ dir: 0, strength: 0 });

  useEffect(() => {
    const onGravity = (g: GravityState) => setGrav(g);
    gameEvents.on('gravity', onGravity);
    return () => { gameEvents.off('gravity', onGravity); };
  }, []);

  const angle = grav.dir === -1 ? 225 : grav.dir === 1 ? 135 : 180;
  const isDown = grav.dir === 0;
  // Restrict to brand palette: yellow (down/fast), blue (left), white (right)
  const accent = isDown ? '#ffdd00' : grav.dir === -1 ? '#5599ff' : '#e0f8ff';
  const label = isDown ? 'DOWN · FAST' : grav.dir === -1 ? 'LEFT DRIFT' : 'RIGHT DRIFT';
  const pct = Math.round(grav.strength * 100);

  return (
    <div className="rounded-lg border border-yellow-500/30 bg-black/50 px-3 py-3 backdrop-blur-sm mb-3 font-mono select-none">
      <div
        className="text-xs uppercase tracking-[0.2em] mb-2 text-center"
        style={{ color: '#ffdd00', textShadow: '0 0 10px #ffdd00, 0 0 18px rgba(255,221,0,0.5)' }}
      >
        Gravity
      </div>

      <div
        className="flex items-center justify-center"
        style={{ animation: isDown ? 'gravityPulse 1.1s ease-in-out infinite' : undefined }}
      >
        <svg width="160" height="160" viewBox="-50 -50 100 100">
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

          <circle cx="0" cy="0" r="46" fill="url(#compassBg)" />
          <circle cx="0" cy="0" r="40" fill="none" stroke={`${accent}66`} strokeWidth="0.8" />
          <circle cx="0" cy="0" r="34" fill="none" stroke={`${accent}33`} strokeWidth="0.5" strokeDasharray="2 3" />

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
                stroke={`${accent}${isMain ? 'cc' : '66'}`}
                strokeWidth={isMain ? 1.2 : 0.6}
                strokeLinecap="round"
              />
            );
          })}

          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0px 0px',
              transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: `drop-shadow(0 0 5px ${accent}) drop-shadow(0 0 10px ${accent}aa)`,
            }}
          >
            <polygon points="0,8 -3,0 3,0" fill={`${accent}66`} />
            <polygon points="0,-30 -4.5,2 4.5,2" fill="url(#needleGrad)" />
            <line x1="0" y1="-28" x2="0" y2="0" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
          </g>

          <circle cx="0" cy="0" r="3.2" fill="#0a0a18" stroke={accent} strokeWidth="1" />
          <circle cx="0" cy="0" r="1.2" fill={accent} />
        </svg>
      </div>

      <div
        className="text-sm uppercase tracking-[0.2em] mt-1 text-center font-bold"
        style={{ color: '#e0f8ff', textShadow: '0 0 8px #e0f8ff, 0 0 14px rgba(224,248,255,0.5)' }}
      >
        {label}
      </div>
      <div
        className="text-xs tracking-[0.15em] mt-1 text-center"
        style={{ color: '#5599ff', textShadow: '0 0 6px #5599ff, 0 0 12px rgba(85,153,255,0.5)' }}
      >
        PULL {pct}%
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
