import { useEffect, useRef } from 'react';

const MachineFrame = ({ children }: { children: React.ReactNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      t += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Circuit traces
      ctx.strokeStyle = 'rgba(102, 255, 238, 0.07)';
      ctx.lineWidth = 1;
      const circuits = [
        // Left side circuits
        [[8, 40], [8, 80], [24, 80], [24, 120], [8, 120], [8, 200]],
        [[16, 60], [30, 60], [30, 100], [16, 100]],
        [[8, h - 200], [8, h - 140], [24, h - 140], [24, h - 100], [8, h - 100], [8, h - 40]],
        // Right side circuits
        [[w - 8, 40], [w - 8, 80], [w - 24, 80], [w - 24, 120], [w - 8, 120], [w - 8, 200]],
        [[w - 16, 60], [w - 30, 60], [w - 30, 100], [w - 16, 100]],
        [[w - 8, h - 200], [w - 8, h - 140], [w - 24, h - 140], [w - 24, h - 100], [w - 8, h - 100], [w - 8, h - 40]],
        // Top circuits
        [[60, 8], [120, 8], [120, 20], [160, 20], [160, 8], [240, 8]],
        [[w - 60, 8], [w - 120, 8], [w - 120, 20], [w - 160, 20], [w - 160, 8], [w - 240, 8]],
        // Bottom circuits
        [[60, h - 8], [120, h - 8], [120, h - 20], [160, h - 20], [160, h - 8], [240, h - 8]],
        [[w - 60, h - 8], [w - 120, h - 8], [w - 120, h - 20], [w - 160, h - 20], [w - 160, h - 8], [w - 240, h - 8]],
      ];

      for (const path of circuits) {
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          if (i === 0) ctx.moveTo(path[i][0], path[i][1]);
          else ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.stroke();
      }

      // Circuit nodes (small dots at junctions)
      const nodes = [
        [8, 80], [24, 80], [24, 120], [8, 120],
        [w - 8, 80], [w - 24, 80], [w - 24, 120], [w - 8, 120],
        [8, h - 140], [24, h - 140], [24, h - 100], [8, h - 100],
        [w - 8, h - 140], [w - 24, h - 140], [w - 24, h - 100], [w - 8, h - 100],
        [120, 8], [120, 20], [160, 20], [160, 8],
        [w - 120, 8], [w - 120, 20], [w - 160, 20], [w - 160, 8],
        [120, h - 8], [120, h - 20], [160, h - 20], [160, h - 8],
        [w - 120, h - 8], [w - 120, h - 20], [w - 160, h - 20], [w - 160, h - 8],
      ];
      for (const [nx, ny] of nodes) {
        ctx.fillStyle = 'rgba(102, 255, 238, 0.15)';
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Animated pulse lights along edges
      const pulsePositions = [
        // Left edge
        { x: 4, y: h * 0.3, color: '102, 255, 238' },
        { x: 4, y: h * 0.7, color: '140, 100, 255' },
        // Right edge
        { x: w - 4, y: h * 0.3, color: '140, 100, 255' },
        { x: w - 4, y: h * 0.7, color: '102, 255, 238' },
        // Top
        { x: w * 0.3, y: 4, color: '80, 160, 255' },
        { x: w * 0.7, y: 4, color: '102, 255, 238' },
        // Bottom
        { x: w * 0.3, y: h - 4, color: '102, 255, 238' },
        { x: w * 0.7, y: h - 4, color: '80, 160, 255' },
      ];

      for (let i = 0; i < pulsePositions.length; i++) {
        const p = pulsePositions[i];
        const pulse = 0.3 + 0.7 * Math.sin(t * 0.03 + i * 1.5);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        grad.addColorStop(0, `rgba(${p.color}, ${0.6 * pulse})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
      }

      // Scanning line effect (very subtle)
      const scanY = (t * 0.5) % h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, 'rgba(102, 255, 238, 0)');
      scanGrad.addColorStop(0.5, 'rgba(102, 255, 238, 0.03)');
      scanGrad.addColorStop(1, 'rgba(102, 255, 238, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, w, 4);

      requestAnimationFrame(draw);
    };
    const raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="relative" style={{ padding: '6px' }}>
      {/* Outer metallic frame */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(30,35,50,0.95), rgba(15,18,30,0.98))',
          border: '2px solid rgba(60,70,100,0.6)',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.05),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            0 0 40px rgba(102,255,238,0.08),
            0 0 80px rgba(100,80,255,0.05)
          `,
        }}
      />

      {/* Inner bevel */}
      <div
        className="absolute rounded-lg"
        style={{
          inset: '4px',
          border: '1px solid rgba(102,255,238,0.12)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      />

      {/* Corner accents */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
        const isTop = corner.includes('top');
        const isLeft = corner.includes('left');
        return (
          <div
            key={corner}
            className="absolute"
            style={{
              [isTop ? 'top' : 'bottom']: '2px',
              [isLeft ? 'left' : 'right']: '2px',
              width: '20px',
              height: '20px',
              borderTop: isTop ? '2px solid rgba(102,255,238,0.4)' : 'none',
              borderBottom: !isTop ? '2px solid rgba(102,255,238,0.4)' : 'none',
              borderLeft: isLeft ? '2px solid rgba(102,255,238,0.4)' : 'none',
              borderRight: !isLeft ? '2px solid rgba(102,255,238,0.4)' : 'none',
              [isTop && isLeft ? 'borderTopLeftRadius' : isTop && !isLeft ? 'borderTopRightRadius' : !isTop && isLeft ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: '8px',
            }}
          />
        );
      })}

      {/* Neon edge glow lines */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '1px', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(102,255,238,0.5), transparent)' }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '1px', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(140,100,255,0.4), transparent)' }} />
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '1px', width: '1px', height: '60%', background: 'linear-gradient(180deg, transparent, rgba(80,160,255,0.3), transparent)' }} />
      <div className="absolute top-1/2 -translate-y-1/2" style={{ right: '1px', width: '1px', height: '60%', background: 'linear-gradient(180deg, transparent, rgba(80,160,255,0.3), transparent)' }} />

      {/* Circuit + pulse canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default MachineFrame;
