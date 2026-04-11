import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface MainMenuProps {
  onStart: () => void;
}

const MENU_ITEMS = ['PLAY', 'WALLET', 'OPTIONS', 'MARKETPLACE', 'RULES', 'REWARDS'] as const;
const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 2;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const MainMenu = ({ onStart }: MainMenuProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number; brightness: number }[]>([]);
  const nebulasRef = useRef<{ x: number; y: number; r: number; color: string; phase: number }[]>([]);
  const [selected, setSelected] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const navigate = useNavigate();

  // Initialize stars & nebulas
  useEffect(() => {
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
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

  // Canvas animation
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
      const w = canvas.width;
      const h = canvas.height;

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

  // Keyboard navigation — looping wraparound
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (fadingOut) return;
      if (e.key === 'ArrowDown') setSelected(s => (s + 1) % MENU_ITEMS.length);
      else if (e.key === 'ArrowUp') setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(selected); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, fadingOut]);

  const handleSelect = useCallback((index: number) => {
    if (fadingOut) return;
    setFadingOut(true);
    setTimeout(() => {
      const item = MENU_ITEMS[index];
      if (item === 'PLAY') onStart();
      else if (item === 'OPTIONS') navigate('/options');
      else if (item === 'WALLET') navigate('/wallet');
      else if (item === 'MARKETPLACE') navigate('/marketplace');
      else if (item === 'RULES') navigate('/rules');
      else if (item === 'REWARDS') navigate('/rewards');
    }, 500);
  }, [fadingOut, onStart, navigate]);

  // Mouse wheel on viewport — looping
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (fadingOut) return;
    if (e.deltaY > 0) setSelected(s => (s + 1) % MENU_ITEMS.length);
    else if (e.deltaY < 0) setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
  }, [fadingOut]);

  const translateY = -(selected * ITEM_HEIGHT);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#050510' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="menu-scanlines absolute inset-0 pointer-events-none z-10" />
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
      />

      <div className="relative z-20 flex flex-col items-center gap-2">
        {/* Login / Sign Up button — above menu */}
        <button
          onClick={() => navigate('/auth')}
          className="font-mono uppercase tracking-[0.2em] text-sm px-5 py-2 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer select-none"
          style={{ marginBottom: 94, textShadow: '0 0 8px rgba(0,200,255,0.4)' }}
        >
          Login / Sign Up
        </button>

        {/* Title */}
        <div className="menu-title-container mb-2 select-none" style={{ paddingLeft: 'calc(5% + 5px)' }}>
          <h1 className="menu-neon-title font-mono uppercase tracking-[0.5em] text-5xl md:text-7xl font-black">
            NEBULA
          </h1>
          <div className="menu-neon-subtitle font-mono uppercase tracking-[0.8em] text-xs md:text-sm mt-1 text-center">
            ColdLogic
          </div>
          <div className="menu-divider-line mx-auto mt-4 mb-2" />
        </div>

        {/* Carousel viewport */}
        <nav
          className="relative mt-2"
          style={{ height: VIEWPORT_HEIGHT, overflow: 'hidden' }}
          onWheel={handleWheel}
        >
          {/* Top fade mask */}
          <div className="absolute top-0 left-0 right-0 h-3 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #050510, transparent)' }} />

          {/* Sliding list */}
          <div
            className="flex flex-col items-center"
            style={{
              transform: `translateY(${translateY}px)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item}
                onClick={() => handleSelect(i)}
                onMouseEnter={() => setSelected(i)}
                className={`font-mono uppercase tracking-[0.25em] text-lg md:text-xl bg-transparent border-none cursor-pointer select-none flex items-center justify-center gap-3 transition-all duration-300 ${
                  selected === i ? 'menu-item-glow-red scale-105' : 'text-red-900/60 hover:text-red-400/80'
                }`}
                style={{
                  height: ITEM_HEIGHT,
                  minWidth: 280,
                  ...(selected === i ? { color: '#ff3333', textShadow: '0 0 10px rgba(255,50,50,0.6), 0 0 30px rgba(255,50,50,0.3)' } : {}),
                }}
              >
                <span
                  className={`text-xs transition-opacity duration-200 ${selected === i ? 'opacity-100' : 'opacity-0'}`}
                  style={selected === i ? { color: '#ff3333' } : undefined}
                >
                  ▶
                </span>
                {item}
              </button>
            ))}
          </div>

          {/* Bottom fade mask */}
          <div className="absolute bottom-0 left-0 right-0 h-3 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #050510, transparent)' }} />
        </nav>
      </div>
    </div>
  );
};

export default MainMenu;
