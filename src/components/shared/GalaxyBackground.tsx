/**
 * GalaxyBackground — reusable cosmic canvas extracted from MainMenu.
 * 200 stars + 3 drifting nebulas + radial vignette + scanlines.
 * Mounts as a fixed full-screen layer behind page content.
 */
import { useEffect, useRef } from 'react';

interface Props {
  /** Stack order. Default 0 (sits at the bottom). */
  zIndex?: number;
}

const GalaxyBackground = ({ zIndex = 0 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number; brightness: number }[]>([]);
  const nebulasRef = useRef<{ x: number; y: number; r: number; color: string; phase: number }[]>([]);

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

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex, backgroundColor: '#050510' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="menu-scanlines absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
      />
    </div>
  );
};

export default GalaxyBackground;
