import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import menuHero from '../assets/menu-hero.png';

interface MainMenuProps {
  onStart: () => void;
}

const MENU_ITEMS = ['START', 'OPTIONS', 'WALLET'] as const;

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
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.0001 + 0.00005,
      brightness: Math.random() * 0.6 + 0.4,
    }));
    starsRef.current = stars;

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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
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
        const alpha = star.brightness * twinkle;
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (fadingOut) return;
      if (e.key === 'ArrowDown') {
        setSelected(s => (s + 1) % MENU_ITEMS.length);
      } else if (e.key === 'ArrowUp') {
        setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      } else if (e.key === 'Enter') {
        handleSelect(selected);
      }
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
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-2">
        {/* Title */}
        <h1 className="menu-title-glow font-mono uppercase tracking-[0.4em] text-4xl md:text-6xl font-bold select-none"
          style={{ color: '#e0f0ff' }}
        >
          NEBULA
        </h1>
        <p className="menu-title-glow font-mono uppercase tracking-[0.6em] text-sm md:text-base select-none mb-6"
          style={{ color: '#88cccc' }}
        >
          ColdLogic
        </p>

        {/* Hero image */}
        <div className="menu-hero-breathe mb-10">
          <img
            src={menuHero}
            alt="Nebula ColdLogic"
            className="w-[55vw] max-w-[500px] h-auto drop-shadow-[0_0_40px_rgba(100,255,238,0.3)]"
            draggable={false}
          />
        </div>

        {/* Menu items */}
        <nav className="flex flex-col items-center gap-5">
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
              <span
                className={`text-xs transition-opacity duration-200 ${selected === i ? 'opacity-100' : 'opacity-0'}`}
              >
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
