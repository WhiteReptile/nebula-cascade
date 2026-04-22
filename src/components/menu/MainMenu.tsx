import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTick, playSelect } from '@/lib/sfx';
import GalaxyBackground from '@/components/shared/GalaxyBackground';

interface MainMenuProps {
  onStart: () => void;
}

const MENU_ITEMS = ['PLAY', 'OPTIONS', 'MARKETPLACE', 'REWARDS & RULES'] as const;
const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 2;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const MainMenu = ({ onStart }: MainMenuProps) => {
  const [selected, setSelected] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const navigate = useNavigate();

  // Keyboard navigation — looping wraparound
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (fadingOut) return;
      if (e.key === 'ArrowDown') { playTick(); setSelected(s => (s + 1) % MENU_ITEMS.length); }
      else if (e.key === 'ArrowUp') { playTick(); setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(selected); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, fadingOut]);

  const handleSelect = useCallback((index: number) => {
    if (fadingOut) return;
    playSelect();
    setFadingOut(true);
    setTimeout(() => {
      const item = MENU_ITEMS[index];
      if (item === 'PLAY') onStart();
      else if (item === 'OPTIONS') navigate('/options');
      else if (item === 'MARKETPLACE') navigate('/marketplace');
      else if (item === 'REWARDS & RULES') navigate('/rewards');
    }, 500);
  }, [fadingOut, onStart, navigate]);

  // Mouse wheel on viewport — looping
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (fadingOut) return;
    if (e.deltaY > 0) { playTick(); setSelected(s => (s + 1) % MENU_ITEMS.length); }
    else if (e.deltaY < 0) { playTick(); setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length); }
  }, [fadingOut]);

  const translateY = -(selected * ITEM_HEIGHT);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: '#050510' }}
    >
      <GalaxyBackground zIndex={0} />

      {/* Top corner buttons */}
      <button
        onClick={() => navigate('/roadmap')}
        className="absolute top-6 left-6 z-30 font-mono uppercase tracking-[0.2em] text-sm px-5 py-2 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer select-none"
        style={{ textShadow: '0 0 8px rgba(0,200,255,0.4)' }}
      >
        Roadmap
      </button>
      <button
        onClick={() => navigate('/auth')}
        className="absolute top-6 right-6 z-30 font-mono uppercase tracking-[0.2em] text-sm px-5 py-2 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer select-none"
        style={{ textShadow: '0 0 8px rgba(0,200,255,0.4)' }}
      >
        Login / Sign Up
      </button>

      <div className="relative z-20 flex flex-col items-center gap-2">

        {/* Title */}
        <div className="menu-title-container mb-2 select-none" style={{ paddingLeft: 'calc(5% + 5px)' }}>
          <h1 className="font-mono uppercase tracking-[0.5em] text-5xl md:text-7xl font-black whitespace-nowrap">
            <span className="menu-neon-title">NEBULA</span>{' '}
            <span className="menu-neon-title-red">CASCADE</span>
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
                onMouseEnter={() => { if (selected !== i) { playTick(); setSelected(i); } }}
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
