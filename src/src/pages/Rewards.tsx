/**
 * Rewards Page — Immersive galaxy-themed rewards hub
 *
 * Conceptual only — explains the rewards system clearly,
 * builds hype, and matches the cyber-retro / cosmic aesthetic.
 *
 * Sections:
 * 1. Hero — animated galaxy background
 * 2. How It Works — 3-step flow
 * 3. Divisions — tier hierarchy with glow
 * 4. Reward Pool — conceptual explanation
 * 5. Player Types — Card vs Free
 * 6. Core Rule — permanent segmentation
 * 7. Reward Cycle — 40-day timeline
 * 8. Beta Status — transparent notice
 */
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIVISION_LABELS, DIVISION_COLORS, type Division } from '@/lib/divisionSystem';

const DIVISIONS_ORDERED: { key: Division; label: string; color: string; glow: string; tier: number; desc: string }[] = [
  { key: 'gem_i',   label: 'Division I',   color: '#66ffee', glow: 'rgba(102,255,238,0.5)',  tier: 5, desc: 'The apex. Elite players with the highest stakes and the greatest rewards.' },
  { key: 'gem_ii',  label: 'Division II',  color: '#aa44ff', glow: 'rgba(170,68,255,0.5)',   tier: 4, desc: 'Proven competitors. High-level play rewarded with serious recognition.' },
  { key: 'gem_iii', label: 'Division III', color: '#3388ff', glow: 'rgba(51,136,255,0.5)',   tier: 3, desc: 'Rising talent. Strong performance opens the path to higher tiers.' },
  { key: 'gem_iv',  label: 'Division IV',  color: '#ffdd00', glow: 'rgba(255,221,0,0.5)',    tier: 2, desc: 'Building momentum. Consistent play here earns your first rewards.' },
  { key: 'gem_v',   label: 'Division V',   color: '#ff3344', glow: 'rgba(255,51,68,0.5)',    tier: 1, desc: 'Entry tier. Every journey through the cosmos begins here.' },
];

const Rewards = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());

  // Enable scrolling on this page (body has overflow:hidden for the game)
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Galaxy background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const stars: { x: number; y: number; r: number; speed: number; alpha: number; phase: number }[] = [];
    const nebulas: { x: number; y: number; radius: number; color: string; phase: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight * 5);
    };
    resize();
    // Re-check size after DOM settles
    const resizeTimer = setTimeout(resize, 500);

    // Generate stars
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        alpha: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Generate nebulas
    const nebulaConfigs = [
      { x: 0.2, y: 0.08, radius: 250, color: '102,255,238' },
      { x: 0.8, y: 0.15, radius: 200, color: '170,68,255' },
      { x: 0.5, y: 0.3,  radius: 300, color: '51,136,255' },
      { x: 0.3, y: 0.45, radius: 180, color: '255,51,68' },
      { x: 0.7, y: 0.6,  radius: 220, color: '255,221,0' },
      { x: 0.4, y: 0.75, radius: 260, color: '102,255,238' },
      { x: 0.6, y: 0.9,  radius: 200, color: '170,68,255' },
    ];
    nebulaConfigs.forEach((n, i) => {
      nebulas.push({ ...n, x: n.x * canvas.width, y: n.y * canvas.height, phase: i * 1.2 });
    });

    let time = 0;
    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Nebulas
      nebulas.forEach(n => {
        const pulse = Math.sin(time + n.phase) * 0.02 + 0.04;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, `rgba(${n.color}, ${pulse})`);
        grad.addColorStop(1, `rgba(${n.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
      });

      // Stars
      stars.forEach(s => {
        const twinkle = Math.sin(time * 2 + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${s.alpha * twinkle})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Intersection observer for fade-in sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sectionClass = (id: string) =>
    `transition-all duration-1000 ${visible.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className="relative min-h-screen bg-[#050510] text-white font-mono overflow-x-hidden">
      {/* Galaxy canvas background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none menu-scanlines" style={{ zIndex: 1, opacity: 0.3 }} />

      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>

        {/* ═══════════════════════════════════════════
            HEADER — Sticky nav
            ═══════════════════════════════════════════ */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#050510]/70 border-b border-cyan-500/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
            <button
              onClick={() => navigate('/')}
              className="text-cyan-400/60 hover:text-cyan-300 transition-colors text-sm tracking-wider"
            >
              &larr; BACK
            </button>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/20">Nebula Cascade</div>
            <div className="w-16" />
          </div>
        </header>

        {/* ═══════════════════════════════════════════
            SECTION 1 — HERO
            ═══════════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          {/* Central glow */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(102,255,238,0.06) 0%, rgba(102,255,238,0) 70%)',
              filter: 'blur(60px)',
              animation: 'heroBreathe 6s ease-in-out infinite',
            }}
          />

          <div className="relative space-y-6">
            {/* Decorative line */}
            <div className="mx-auto menu-divider-line" />

            <h1
              className="menu-neon-title text-5xl md:text-7xl font-black uppercase tracking-[0.4em]"
              style={{ letterSpacing: '0.4em' }}
            >
              REWARDS
            </h1>

            <p className="menu-neon-subtitle text-sm md:text-base uppercase tracking-[0.5em]">
              Compete. Climb. Earn your place.
            </p>

            {/* Decorative line */}
            <div className="mx-auto menu-divider-line" />

            {/* Scroll indicator */}
            <div className="pt-12 animate-bounce">
              <div className="w-6 h-10 mx-auto rounded-full border border-cyan-500/30 flex items-start justify-center pt-2">
                <div className="w-1 h-2 rounded-full bg-cyan-400/60 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2 — HOW IT WORKS
            ═══════════════════════════════════════════ */}
        <section id="how-it-works" data-reveal className={`py-24 px-6 ${sectionClass('how-it-works')}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-xs uppercase tracking-[0.5em] text-cyan-400/60 mb-12">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'COMPETE',
                  desc: 'Players compete using cards or as free players. Every match counts toward your standing.',
                  icon: '⬡',
                  color: '#66ffee',
                },
                {
                  step: '02',
                  title: 'CLIMB',
                  desc: 'Your performance determines your position. Consistency and skill push you through the divisions.',
                  icon: '△',
                  color: '#aa44ff',
                },
                {
                  step: '03',
                  title: 'EARN',
                  desc: 'Each system has its own leaderboard. Top performers compete for rewards from the pool.',
                  icon: '◇',
                  color: '#ffdd00',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04]"
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${item.color}08 0%, transparent 70%)` }}
                  />
                  <div className="relative">
                    <div className="text-3xl mb-4" style={{ color: item.color, filter: `drop-shadow(0 0 8px ${item.color})` }}>
                      {item.icon}
                    </div>
                    <div className="text-[10px] tracking-[0.3em] text-white/30 mb-2">{item.step}</div>
                    <h3 className="text-lg font-bold tracking-[0.2em] mb-3" style={{ color: item.color }}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting line */}
            <div className="hidden md:block mx-auto mt-8 menu-divider-line" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 3 — DIVISIONS
            ═══════════════════════════════════════════ */}
        <section id="divisions" data-reveal className={`py-24 px-6 ${sectionClass('divisions')}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-xs uppercase tracking-[0.5em] text-cyan-400/60 mb-3">Divisions</h2>
            <p className="text-center text-white/25 text-xs tracking-wider mb-12">
              Higher divisions mean higher competition and greater reward potential
            </p>

            <div className="space-y-4">
              {DIVISIONS_ORDERED.map((div, i) => (
                <div
                  key={div.key}
                  className="group relative rounded-xl border transition-all duration-500 hover:scale-[1.01]"
                  style={{
                    borderColor: `${div.color}15`,
                    background: `linear-gradient(135deg, ${div.color}05 0%, transparent 60%)`,
                  }}
                >
                  {/* Glow bar on left */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-500 group-hover:w-1.5"
                    style={{
                      background: div.color,
                      boxShadow: `0 0 15px ${div.glow}, 0 0 30px ${div.glow}`,
                    }}
                  />

                  <div className="flex items-center gap-6 py-5 px-8 pl-10">
                    {/* Tier badge */}
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-black"
                      style={{
                        color: div.color,
                        background: `${div.color}10`,
                        border: `1px solid ${div.color}25`,
                        textShadow: `0 0 12px ${div.glow}`,
                      }}
                    >
                      {div.tier === 5 ? 'I' : div.tier === 4 ? 'II' : div.tier === 3 ? 'III' : div.tier === 2 ? 'IV' : 'V'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold tracking-[0.15em]" style={{ color: div.color }}>
                          {div.label}
                        </h3>
                        {div.tier === 5 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full tracking-widest uppercase"
                            style={{ background: `${div.color}15`, color: div.color, border: `1px solid ${div.color}30` }}>
                            Apex
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/35 leading-relaxed">{div.desc}</p>
                    </div>

                    {/* Reward indicator */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Reward Tier</div>
                      <div className="flex gap-0.5 justify-end">
                        {Array.from({ length: div.tier }).map((_, j) => (
                          <div
                            key={j}
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{
                              background: div.color,
                              boxShadow: `0 0 6px ${div.glow}`,
                              opacity: 0.7 + (j * 0.06),
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[10px] text-white/20 mt-8 tracking-wider">
              Players only compete within their own division
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4 — REWARD POOL
            ═══════════════════════════════════════════ */}
        <section id="reward-pool" data-reveal className={`py-24 px-6 ${sectionClass('reward-pool')}`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xs uppercase tracking-[0.5em] text-cyan-400/60 mb-12">The Reward Pool</h2>

            <div className="relative rounded-2xl border border-cyan-500/10 bg-white/[0.02] p-10 overflow-hidden">
              {/* Background glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 30%, rgba(102,255,238,0.04) 0%, transparent 60%)' }}
              />

              <div className="relative space-y-8">
                {/* 40% indicator */}
                <div>
                  <div
                    className="inline-block text-6xl font-black tracking-tight"
                    style={{
                      color: '#66ffee',
                      textShadow: '0 0 20px rgba(102,255,238,0.4), 0 0 60px rgba(102,255,238,0.15)',
                    }}
                  >
                    40%
                  </div>
                  <p className="text-sm text-white/40 mt-3 tracking-wider">
                    of platform activity flows into the rewards pool
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-auto menu-divider-line" />

                {/* Sources */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  {[
                    { label: 'Marketplace Activity', icon: '◈' },
                    { label: 'Ecosystem Participation', icon: '⬡' },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="text-xl mb-2" style={{ color: '#66ffee', filter: 'drop-shadow(0 0 6px rgba(102,255,238,0.4))' }}>
                        {s.icon}
                      </div>
                      <div className="text-[10px] text-white/35 tracking-wider uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-white/20 tracking-wider max-w-md mx-auto">
                  The pool grows with platform activity. No fixed amounts. No guarantees. Pure performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 5 — PLAYER TYPES
            ═══════════════════════════════════════════ */}
        <section id="player-types" data-reveal className={`py-24 px-6 ${sectionClass('player-types')}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-xs uppercase tracking-[0.5em] text-cyan-400/60 mb-12">Player Types</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Players */}
              <div className="relative rounded-2xl border border-purple-500/15 bg-purple-500/[0.02] p-8 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: 'radial-gradient(circle, rgba(170,68,255,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: 'rgba(170,68,255,0.12)', border: '1px solid rgba(170,68,255,0.25)', color: '#aa44ff' }}>
                      ◆
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-[0.15em]" style={{ color: '#aa44ff' }}>CARD PLAYERS</h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full tracking-widest uppercase"
                        style={{ background: 'rgba(170,68,255,0.1)', color: '#aa44ff', border: '1px solid rgba(170,68,255,0.2)' }}>
                        NFT
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-xs text-white/40">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-400 mt-0.5">›</span>
                      <span>Use energy per card to compete</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-400 mt-0.5">›</span>
                      <span>Compete within their division tier</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-400 mt-0.5">›</span>
                      <span>Higher reward exposure through the pool</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-400 mt-0.5">›</span>
                      <span>Must play each card separately</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Free Players */}
              <div className="relative rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.02] p-8 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: 'radial-gradient(circle, rgba(102,255,238,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: 'rgba(102,255,238,0.12)', border: '1px solid rgba(102,255,238,0.25)', color: '#66ffee' }}>
                      ○
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-[0.15em]" style={{ color: '#66ffee' }}>FREE PLAYERS</h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full tracking-widest uppercase"
                        style={{ background: 'rgba(102,255,238,0.1)', color: '#66ffee', border: '1px solid rgba(102,255,238,0.2)' }}>
                        FREE
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-xs text-white/40">
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-0.5">›</span>
                      <span>No cards required to compete</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-0.5">›</span>
                      <span>Can be logged-in or anonymous</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-0.5">›</span>
                      <span>Compete in a separate leaderboard</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-0.5">›</span>
                      <span>Lower reward exposure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 6 — CORE RULE
            ═══════════════════════════════════════════ */}
        <section id="core-rule" data-reveal className={`py-24 px-6 ${sectionClass('core-rule')}`}>
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-red-500/15 bg-red-500/[0.02] p-10 overflow-hidden">
              {/* Warning glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,51,68,0.03) 0%, transparent 60%)' }} />

              <div className="relative text-center space-y-6">
                <div className="text-[10px] uppercase tracking-[0.5em] text-red-400/60">Important Rule</div>

                <div className="mx-auto menu-divider-line" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,51,68,0.5), transparent)',
                  boxShadow: '0 0 8px rgba(255,51,68,0.3)',
                }} />

                <h3 className="text-xl md:text-2xl font-bold tracking-[0.15em] leading-relaxed"
                  style={{ color: '#ff6677', textShadow: '0 0 15px rgba(255,51,68,0.3)' }}>
                  PERMANENT SEGMENTATION
                </h3>

                <p className="text-sm text-white/50 leading-relaxed max-w-lg mx-auto">
                  If you have <span style={{ color: '#ff6677' }}>ever owned a card</span>, you are permanently part of
                  the card-based system and cannot enter the free leaderboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                  {['Even with no energy', 'Even with zero cards', 'Even if cards are sold'].map(text => (
                    <div key={text} className="rounded-lg border border-red-500/10 bg-red-500/[0.03] py-2.5 px-3">
                      <span className="text-[10px] text-red-400/60 tracking-wider">{text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-white/20 tracking-wider pt-2">
                  This ensures fair competition across both systems
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7 — REWARD CYCLE
            ═══════════════════════════════════════════ */}
        <section id="reward-cycle" data-reveal className={`py-24 px-6 ${sectionClass('reward-cycle')}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xs uppercase tracking-[0.5em] text-cyan-400/60 mb-3">Reward Cycle</h2>
            <p className="text-white/25 text-xs tracking-wider mb-12">Performance is measured over time</p>

            {/* Timeline visual */}
            <div className="relative max-w-2xl mx-auto">
              {/* Central line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(102,255,238,0.3), rgba(102,255,238,0.3), transparent)' }} />

              {[
                { day: 'DAY 1', title: 'Cycle Begins', desc: 'A new competition period starts. All positions reset.', color: '#66ffee', side: 'left' },
                { day: 'DAY 10', title: 'Momentum Builds', desc: 'Early leaders emerge. Every match shapes the standings.', color: '#3388ff', side: 'right' },
                { day: 'DAY 25', title: 'Final Push', desc: 'Positions solidify. Top performers separate from the rest.', color: '#aa44ff', side: 'left' },
                { day: 'DAY 40', title: 'Cycle Ends', desc: 'Winners are determined. Rewards are distributed from the pool.', color: '#ffdd00', side: 'right' },
              ].map((phase, i) => (
                <div key={phase.day} className={`relative flex items-center gap-6 py-8 ${phase.side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: `${phase.color}80` }}>{phase.day}</div>
                    <h4 className="text-sm font-bold tracking-[0.15em] mb-1" style={{ color: phase.color }}>{phase.title}</h4>
                    <p className="text-xs text-white/35">{phase.desc}</p>
                  </div>

                  {/* Node */}
                  <div className="relative flex-shrink-0 z-10">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        borderColor: phase.color,
                        background: `${phase.color}30`,
                        boxShadow: `0 0 12px ${phase.color}50, 0 0 24px ${phase.color}20`,
                      }}
                    />
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1" />
                </div>
              ))}

              {/* Loop indicator */}
              <div className="relative z-10 flex justify-center pt-4">
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-5 py-2">
                  <span className="text-[10px] text-cyan-400/60 tracking-[0.3em] uppercase">Then the cycle repeats</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 8 — BETA STATUS
            ═══════════════════════════════════════════ */}
        <section id="beta-status" data-reveal className={`py-24 px-6 ${sectionClass('beta-status')}`}>
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.02] p-10 overflow-hidden text-center">
              {/* Subtle glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,221,0,0.03) 0%, transparent 60%)' }} />

              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-yellow-400/80">Beta Phase</span>
                </div>

                <h3 className="text-xl font-bold tracking-[0.15em]"
                  style={{ color: '#ffdd00', textShadow: '0 0 15px rgba(255,221,0,0.3)' }}>
                  REWARDS ARE CURRENTLY INACTIVE
                </h3>

                <p className="text-sm text-white/40 leading-relaxed max-w-md mx-auto">
                  The system is fully functional, but reward distribution will
                  activate after the NFT debut. Everything you do now is building
                  toward launch.
                </p>

                <div className="mx-auto menu-divider-line" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,221,0,0.4), transparent)',
                  boxShadow: '0 0 8px rgba(255,221,0,0.2)',
                }} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  {[
                    { label: 'System', value: 'LIVE', color: '#66ffee' },
                    { label: 'Rewards', value: 'PENDING', color: '#ffdd00' },
                    { label: 'NFT Debut', value: 'SOON', color: '#aa44ff' },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] py-3 px-4">
                      <div className="text-[9px] uppercase tracking-widest text-white/20 mb-1">{item.label}</div>
                      <div className="text-sm font-bold tracking-wider" style={{ color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER — Back to game
            ═══════════════════════════════════════════ */}
        <section className="py-20 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 px-8 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400/80 text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-300"
          >
            &larr; BACK TO GAME
          </button>
          <div className="mt-6 text-[10px] text-white/15 tracking-wider">
            Nebula Cascade by ColdLogic
          </div>
        </section>

      </div>
    </div>
  );
};

export default Rewards;
