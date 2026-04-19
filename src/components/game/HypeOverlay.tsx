import { useEffect, useState, useRef } from 'react';
import { gameEvents } from '@/game/events';

interface HypeMessage {
  id: number;
  text: string;
  tier: number;
}

const TIER_STYLES: Record<number, { color: string; glow: string; gradient?: string }> = {
  1: { color: '#ffe066', glow: '#ffdd00' },
  2: { color: '#ff9933', glow: '#ff7700' },
  3: { color: '#ff4444', glow: '#ff2233' },
  4: { color: '#ff44ff', glow: '#cc00ff' },
  5: { color: '#66ffee', glow: '#00ffcc' },
  6: { color: '#ffffff', glow: '#ffffff', gradient: 'linear-gradient(90deg,#ffdd00,#ff3344,#cc00ff,#3388ff,#66ffee,#ffdd00)' },
};

let nextId = 1;

const HypeOverlay = () => {
  const [queue, setQueue] = useState<HypeMessage[]>([]);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    const onHype = (data: { text: string; tier: number }) => {
      const now = performance.now();
      // Throttle: ignore if same hype within 250ms
      if (now - lastEmitRef.current < 250) return;
      lastEmitRef.current = now;
      const msg: HypeMessage = { id: nextId++, text: data.text, tier: data.tier };
      setQueue((q) => [...q.slice(-2), msg]);
      // auto-remove after animation
      setTimeout(() => {
        setQueue((q) => q.filter((m) => m.id !== msg.id));
      }, 1400);
    };
    gameEvents.on('hype', onHype);
    return () => { gameEvents.off('hype', onHype); };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 12 }}>
        {queue.map((msg, idx) => {
          const style = TIER_STYLES[msg.tier] || TIER_STYLES[3];
          const offsetY = -60 - idx * 70;
          const fontSize = 48 + msg.tier * 10;
          return (
            <div
              key={msg.id}
              className="absolute font-black uppercase select-none"
              style={{
                fontFamily: 'Impact, "Bebas Neue", "Arial Black", sans-serif',
                fontSize: `${fontSize}px`,
                letterSpacing: '0.04em',
                top: '40%',
                transform: `translateY(${offsetY}px)`,
                animation: 'hypePop 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                color: style.color,
                background: style.gradient,
                WebkitBackgroundClip: style.gradient ? 'text' : undefined,
                WebkitTextFillColor: style.gradient ? 'transparent' : undefined,
                backgroundClip: style.gradient ? 'text' : undefined,
                WebkitTextStroke: '3px #000',
                textShadow: `0 0 18px ${style.glow}, 0 0 36px ${style.glow}, 0 4px 0 #000, 4px 4px 0 rgba(0,0,0,0.6)`,
                filter: `drop-shadow(0 0 24px ${style.glow})`,
              }}
            >
              {/* Burst halo */}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 block"
                style={{
                  background: `radial-gradient(circle, ${style.glow}55 0%, transparent 60%)`,
                  transform: 'scale(2.5)',
                  filter: 'blur(20px)',
                }}
              />
              {msg.text}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes hypePop {
          0%   { opacity: 0; transform: translateY(var(--ty, -60px)) scale(0.3) rotate(-6deg) skewX(-8deg); }
          18%  { opacity: 1; transform: translateY(var(--ty, -60px)) scale(1.25) rotate(2deg) skewX(-4deg); }
          28%  { transform: translateY(var(--ty, -60px)) scale(1.0) rotate(-1deg) skewX(-3deg); }
          38%  { transform: translateY(var(--ty, -60px)) scale(1.08) rotate(1deg) skewX(-3deg); }
          70%  { opacity: 1; transform: translateY(calc(var(--ty, -60px) - 20px)) scale(1.0) rotate(0deg) skewX(-2deg); }
          100% { opacity: 0; transform: translateY(calc(var(--ty, -60px) - 80px)) scale(0.95) rotate(0deg) skewX(0deg); }
        }
      `}</style>
    </>
  );
};

export default HypeOverlay;
