import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTick, playSelect } from '@/lib/sfx';
import GalaxyBackground from '@/components/shared/GalaxyBackground';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { signInWithGoogle } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

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
  const { isLoggedIn } = usePlayerProfile();
  const { toast } = useToast();

  const handleGoogle = useCallback(async () => {
    const { error } = await signInWithGoogle();
    if (error) toast({ title: 'Google sign-in failed', description: error, variant: 'destructive' });
  }, [toast]);

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
      {!isLoggedIn && (
        <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
          <button
            onClick={() => navigate('/auth')}
            className="font-mono uppercase tracking-[0.2em] text-sm px-5 py-2 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer select-none"
            style={{ textShadow: '0 0 8px rgba(0,200,255,0.4)' }}
          >
            Login / Sign Up
          </button>
          <button
            onClick={handleGoogle}
            className="font-mono uppercase tracking-[0.18em] text-[11px] px-3 py-1.5 rounded border border-cyan-500/30 bg-black/40 text-cyan-200/80 hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:text-cyan-200 transition-all duration-300 cursor-pointer select-none flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      )}

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
