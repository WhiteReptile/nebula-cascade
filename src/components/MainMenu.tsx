import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface MainMenuProps {
  onStart: () => void;
}

const MENU_ITEMS = ['START', 'WALLET', 'OPTIONS'] as const;

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

      // Nebula blobs
      for (const neb of nebulasRef.current) {
        const nx = neb.x * w + Math.sin(t * 0.003 + neb.phase) * 40;
        const ny = neb.y * h + Math.cos(t * 0.002 + neb.phase) * 30;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, neb.r);
        grad.addColorStop(0, `rgba(${neb.color}, 0.06)`);
        grad.addColorStop(1, `rgba(${neb.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(nx - neb.r, ny - neb.r, neb.r * 2, neb.r * 2);
      }

      // Stars
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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (fadingOut) return;
      if (e.key === 'ArrowDown') setSelected(s => (s + 1) % MENU_ITEMS.length);
      else if (e.key === 'ArrowUp') setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      else if (e.key === 'Enter') handleSelect(selected);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, fadingOut]);

  const handleSelect = useCallback((index: number) => {
    if (fadingOut) return;
    setFadingOut(true);
    setTimeout(() => {
      const item = MENU_ITEMS[index];
      if (item === 'START') onStart();
      else if (item === 'OPTIONS') navigate('/options');
      else if (item === 'WALLET') navigate('/wallet');
    }, 500);
  }, [fadingOut, onStart, navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#050510' }}
    >
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* CRT scanline overlay */}
      <div className="menu-scanlines absolute inset-0 pointer-events-none z-10" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-2">
        {/* Built-in neon title */}
        <div className="menu-title-container mb-2 select-none">
          <h1 className="menu-neon-title font-mono uppercase tracking-[0.5em] text-5xl md:text-7xl font-black">
            NEBULA
          </h1>
          <div className="menu-neon-subtitle font-mono uppercase tracking-[0.8em] text-xs md:text-sm mt-1 text-center">
            ColdLogic
          </div>
          {/* Decorative line */}
          <div className="menu-divider-line mx-auto mt-4 mb-2" />
        </div>

        {/* Decorative orb cluster — inline SVG to feel native */}
        <div className="menu-orb-cluster my-6 select-none">
          <svg width="120" height="60" viewBox="0 0 120 60" className="menu-hero-breathe drop-shadow-[0_0_30px_rgba(100,255,238,0.3)]">
            {/* Fire orb */}
            <circle cx="25" cy="30" r="12" fill="url(#fireGrad)" opacity="0.9" />
            {/* Water orb */}
            <circle cx="55" cy="20" r="14" fill="url(#waterGrad)" opacity="0.9" />
            {/* Electricity orb */}
            <circle cx="85" cy="30" r="11" fill="url(#elecGrad)" opacity="0.9" />
            {/* Shadow orb */}
            <circle cx="60" cy="45" r="10" fill="url(#shadowGrad)" opacity="0.7" />
            {/* Glow cores */}
            <circle cx="25" cy="30" r="4" fill="white" opacity="0.8" />
            <circle cx="55" cy="20" r="5" fill="white" opacity="0.8" />
            <circle cx="85" cy="30" r="3.5" fill="white" opacity="0.8" />
            <circle cx="60" cy="45" r="3" fill="white" opacity="0.6" />
            {/* Connecting tendrils */}
            <line x1="37" y1="28" x2="43" y2="22" stroke="rgba(100,255,238,0.2)" strokeWidth="1" />
            <line x1="67" y1="22" x2="75" y2="28" stroke="rgba(100,255,238,0.2)" strokeWidth="1" />
            <line x1="55" y1="34" x2="58" y2="38" stroke="rgba(100,255,238,0.15)" strokeWidth="1" />
            <defs>
              <radialGradient id="fireGrad"><stop offset="0%" stopColor="#ff8866" /><stop offset="100%" stopColor="#ff3344" /></radialGradient>
              <radialGradient id="waterGrad"><stop offset="0%" stopColor="#66aaff" /><stop offset="100%" stopColor="#3388ff" /></radialGradient>
              <radialGradient id="elecGrad"><stop offset="0%" stopColor="#ffee66" /><stop offset="100%" stopColor="#ffdd00" /></radialGradient>
              <radialGradient id="shadowGrad"><stop offset="0%" stopColor="#aaaacc" /><stop offset="100%" stopColor="#888899" /></radialGradient>
            </defs>
          </svg>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col items-center gap-5 mt-2">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setSelected(i)}
              className={`font-mono uppercase tracking-[0.25em] text-lg md:text-xl transition-all duration-300 bg-transparent border-none cursor-pointer select-none flex items-center gap-3 ${
                selected === i
                  ? 'menu-item-glow scale-105'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={selected === i ? { color: '#66ffee' } : undefined}
            >
              <span className={`text-xs transition-opacity duration-200 ${selected === i ? 'opacity-100' : 'opacity-0'}`}>
                ▶
              </span>
              {item}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MainMenu;
