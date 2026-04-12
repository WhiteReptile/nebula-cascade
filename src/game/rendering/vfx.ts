import { COLS, ROWS, CELL, COLORS } from '../pieces';
import type { Particle, OrbState } from '../types';

export function createForceDropParticles(
  particles: Particle[],
  cells: number[][],
  color: number,
  offsetX: number,
  offsetY: number,
  col: number,
  row: number,
) {
  for (const [r, c] of cells) {
    const px = offsetX + (col + c) * CELL + CELL / 2;
    const py = offsetY + (row + r) * CELL + CELL / 2;
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 35, maxLife: 35,
        color, size: 3 + Math.random() * 4,
      });
    }
  }
}

export function blockImplosionVFX(
  particles: Particle[],
  cells: [number, number][],
  color: number,
  chainStep: number,
  offsetX: number,
  offsetY: number,
): { shakeAmount: number; flashAlpha: number; slowMoTimer: number } {
  const scale = 1 + chainStep * 0.5;
  let sumX = 0, sumY = 0;
  for (const [r, c] of cells) {
    sumX += offsetX + c * CELL + CELL / 2;
    sumY += offsetY + r * CELL + CELL / 2;
  }
  const cx = sumX / cells.length;
  const cy = sumY / cells.length;

  const ringCount = Math.floor(40 * scale);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const dist = 80 + Math.random() * 50;
    particles.push({
      x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
      vx: -Math.cos(angle) * (4 + Math.random() * 3),
      vy: -Math.sin(angle) * (4 + Math.random() * 3),
      life: 25 + Math.random() * 10, maxLife: 35,
      color, size: (3 + Math.random() * 3) * Math.min(scale, 2),
    });
  }

  const burstCount = Math.floor(30 * scale);
  for (let i = 0; i < burstCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1 + Math.random() * 2) * Math.min(scale, 1.5);
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 15, maxLife: 35,
      color: 0xffffff, size: (2 + Math.random() * 4) * Math.min(scale, 2),
    });
  }

  for (const [r, c] of cells) {
    const px = offsetX + c * CELL + CELL / 2;
    const py = offsetY + r * CELL + CELL / 2;
    const dirX = cx - px, dirY = cy - py;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: px, y: py,
        vx: (dirX / len) * (3 + Math.random() * 2) + (Math.random() - 0.5),
        vy: (dirY / len) * (3 + Math.random() * 2) + (Math.random() - 0.5),
        life: 18 + Math.random() * 12, maxLife: 30,
        color, size: 2 + Math.random() * 2,
      });
    }
  }

  return {
    shakeAmount: Math.min(6 * (1 + chainStep * 0.4), 20),
    flashAlpha: Math.min(0.25 * (1 + chainStep * 0.3), 0.9),
    slowMoTimer: 20 + chainStep * 10,
  };
}

export function triColorFusionVFX(
  particles: Particle[],
  cells: [number, number][],
  chainStep: number,
  offsetX: number,
  offsetY: number,
  grid: (OrbState | null)[][],
): { shakeAmount: number; flashAlpha: number; slowMoTimer: number } {
  const scale = 1 + chainStep * 0.5;
  const colors = COLORS.map(c => c.color);
  let sumX = 0, sumY = 0;
  for (const [r, c] of cells) {
    sumX += offsetX + c * CELL + CELL / 2;
    sumY += offsetY + r * CELL + CELL / 2;
  }
  const cx = sumX / cells.length;
  const cy = sumY / cells.length;

  for (let ci = 0; ci < colors.length; ci++) {
    const ringCount = Math.floor(25 * scale);
    for (let i = 0; i < ringCount; i++) {
      const angle = (ci / colors.length) * Math.PI * 2 + (i / ringCount) * Math.PI * 2;
      const dist = 40 + i * 3 + Math.random() * 30;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * speed + Math.sin(angle) * 1.5,
        vy: -Math.sin(angle) * speed - Math.cos(angle) * 1.5,
        life: 30 + Math.random() * 15, maxLife: 45,
        color: colors[ci], size: (3 + Math.random() * 3) * Math.min(scale, 2),
      });
    }
  }

  const burstCount = Math.floor(50 * scale);
  for (let i = 0; i < burstCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 5) * Math.min(scale, 2);
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 20, maxLife: 45,
      color: colors[Math.floor(Math.random() * colors.length)], size: (3 + Math.random() * 5) * Math.min(scale, 2),
    });
  }

  for (const [r, c] of cells) {
    const orb = grid[r]?.[c];
    if (!orb) continue;
    const px = offsetX + c * CELL + CELL / 2;
    const py = offsetY + r * CELL + CELL / 2;
    const dirX = cx - px, dirY = cy - py;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: px, y: py,
        vx: (dirX / len) * 4 + (Math.random() - 0.5) * 2,
        vy: (dirY / len) * 4 + (Math.random() - 0.5) * 2,
        life: 20 + Math.random() * 10, maxLife: 30,
        color: orb.color, size: 2 + Math.random() * 2,
      });
    }
  }

  return {
    shakeAmount: Math.min(10 * (1 + chainStep * 0.4), 25),
    flashAlpha: Math.min(0.35 * (1 + chainStep * 0.3), 0.9),
    slowMoTimer: 30 + chainStep * 10,
  };
}

export function lineDestroyVFX(
  particles: Particle[],
  rows: number[],
  chainStep: number,
  offsetX: number,
  offsetY: number,
  grid: (OrbState | null)[][],
): { shakeAmount: number; flashAlpha: number; slowMoTimer: number } {
  const scale = 1 + chainStep * 0.5;
  for (const row of rows) {
    for (let c = 0; c < COLS; c++) {
      const orb = grid[row]?.[c];
      const px = offsetX + c * CELL + CELL / 2;
      const py = offsetY + row * CELL + CELL / 2;
      const clr = orb?.color || 0xffffff;
      const pCount = Math.floor(8 * scale);
      for (let pi = 0; pi < pCount; pi++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({ x: px, y: py, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, life: 45 + Math.random() * 25, maxLife: 70, color: clr, size: 3 + Math.random() * 3 });
      }
      for (let pi = 0; pi < 4; pi++) {
        particles.push({ x: px, y: py, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 2, life: 30, maxLife: 30, color: 0xffffff, size: 1.5 + Math.random() * 2 });
      }
    }
  }
  return {
    shakeAmount: Math.min(5 * (1 + chainStep * 0.4), 20),
    flashAlpha: Math.min(0.4 * (1 + chainStep * 0.3), 0.9),
    slowMoTimer: 35 + chainStep * 10,
  };
}

export function cosmicWipeVFX(
  particles: Particle[],
  chainStep: number,
  offsetX: number,
  offsetY: number,
): { shakeAmount: number; flashAlpha: number; slowMoTimer: number } {
  const scale = 1 + chainStep * 0.3;
  const cx = offsetX + (COLS * CELL) / 2;
  const cy = offsetY + (ROWS * CELL) / 2;
  const pCount = Math.floor(150 * scale);
  for (let pi = 0; pi < pCount; pi++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 10;
    particles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 70 + Math.random() * 50, maxLife: 120, color: [0xffdd00, 0xff3344, 0x3388ff, 0xffffff][Math.floor(Math.random() * 4)], size: 4 + Math.random() * 6 });
  }
  for (let pi = 0; pi < 60; pi++) {
    const angle = (pi / 60) * Math.PI * 2;
    const dist = 150 + Math.random() * 100;
    particles.push({ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, vx: -Math.cos(angle) * 4, vy: -Math.sin(angle) * 4, life: 40, maxLife: 40, color: 0xffffff, size: 2 + Math.random() * 3 });
  }
  return {
    shakeAmount: Math.min(18 * scale, 30),
    flashAlpha: Math.min(0.8 * scale, 1),
    slowMoTimer: 50 + chainStep * 10,
  };
}

export function reorganizeVFX(
  particles: Particle[],
  placedCells: [number, number][],
  color: number,
  minCol: number,
  maxCol: number,
  maxRow: number,
  offsetX: number,
  offsetY: number,
) {
  const cx = offsetX + ((minCol + maxCol) / 2) * CELL + CELL / 2;
  const cy = offsetY + (maxRow - 2) * CELL + CELL / 2;
  for (const [pr, pc] of placedCells) {
    const px = offsetX + pc * CELL + CELL / 2;
    const py = offsetY + pr * CELL + CELL / 2;
    for (let i = 0; i < 3; i++) {
      const angle = Math.atan2(py - cy, px - cx) + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 10, maxLife: 30,
        color, size: 2 + Math.random() * 2,
      });
    }
  }
}

// ── Proximity Burst VFX: radial shockwave + colored sparks ──
export function proximityBurstVFX(
  particles: Particle[],
  cells: [number, number][],
  color: number,
  chainStep: number,
  offsetX: number,
  offsetY: number,
): { shakeAmount: number; flashAlpha: number; slowMoTimer: number } {
  const scale = 1 + chainStep * 0.3;
  let sumX = 0, sumY = 0;
  for (const [r, c] of cells) {
    sumX += offsetX + c * CELL + CELL / 2;
    sumY += offsetY + r * CELL + CELL / 2;
  }
  const cx = sumX / cells.length;
  const cy = sumY / cells.length;

  // Shockwave ring expanding outward
  const ringCount = Math.floor(30 * scale);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const speed = 3 + Math.random() * 4;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 10, maxLife: 30,
      color, size: (2 + Math.random() * 3) * Math.min(scale, 1.8),
    });
  }

  // Colored sparks from each cell
  for (const [r, c] of cells) {
    const px = offsetX + c * CELL + CELL / 2;
    const py = offsetY + r * CELL + CELL / 2;
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
        life: 15 + Math.random() * 10, maxLife: 25,
        color, size: 2 + Math.random() * 2,
      });
    }
  }

  // White center flash
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * 1.5, vy: Math.sin(angle) * 1.5,
      life: 12, maxLife: 12,
      color: 0xffffff, size: 3 + Math.random() * 2,
    });
  }

  return {
    shakeAmount: Math.min(4 * (1 + chainStep * 0.3), 12),
    flashAlpha: Math.min(0.15 * (1 + chainStep * 0.2), 0.5),
    slowMoTimer: 15 + chainStep * 5,
  };
}

// ── Elemental Cascade VFX: vertical energy beam + particles ──
export function elementalCascadeVFX(
  particles: Particle[],
  column: number,
  color: number,
  chainStep: number,
  offsetX: number,
  offsetY: number,
): { shakeAmount: number; flashAlpha: number; slowMoTimer: number } {
  const scale = 1 + chainStep * 0.3;
  const cx = offsetX + column * CELL + CELL / 2;

  // Vertical beam particles
  for (let r = 0; r < ROWS; r++) {
    const py = offsetY + r * CELL + CELL / 2;
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * CELL * 0.8,
        y: py,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 4,
        life: 30 + Math.random() * 20, maxLife: 50,
        color, size: (2 + Math.random() * 3) * Math.min(scale, 1.5),
      });
    }
    // White core
    particles.push({
      x: cx, y: py,
      vx: 0, vy: -1 - Math.random() * 2,
      life: 20, maxLife: 20,
      color: 0xffffff, size: 3 + Math.random() * 2,
    });
  }

  // Top burst
  for (let i = 0; i < 15; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    const speed = 3 + Math.random() * 5;
    particles.push({
      x: cx, y: offsetY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 25, maxLife: 25,
      color, size: 3 + Math.random() * 3,
    });
  }

  return {
    shakeAmount: Math.min(7 * (1 + chainStep * 0.3), 18),
    flashAlpha: Math.min(0.3 * (1 + chainStep * 0.2), 0.7),
    slowMoTimer: 25 + chainStep * 8,
  };
}

// ── Gravity Crush VFX: subtle ground impact ring ──
export function gravityCrushVFX(
  particles: Particle[],
  pushedCells: [number, number][],
  color: number,
  offsetX: number,
  offsetY: number,
) {
  for (const [r, c] of pushedCells) {
    const px = offsetX + c * CELL + CELL / 2;
    const py = offsetY + r * CELL + CELL / 2;
    // Small dust ring
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * 2, vy: Math.sin(angle) * 1 - 0.5,
        life: 12 + Math.random() * 6, maxLife: 18,
        color, size: 1.5 + Math.random() * 1.5,
      });
    }
    // Upward dust
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: px + (Math.random() - 0.5) * 8, y: py,
        vx: (Math.random() - 0.5) * 1, vy: -1 - Math.random() * 2,
        life: 10 + Math.random() * 5, maxLife: 15,
        color: 0xffffff, size: 1 + Math.random() * 1.5,
      });
    }
  }
}

// ── Urgency vignette overlay ──
export function drawUrgencyOverlay(
  g: Phaser.GameObjects.Graphics,
  intensity: number, // 0-1
  w: number,
  h: number,
  time: number,
) {
  if (intensity <= 0) return;
  const pulse = 0.7 + Math.sin(time * 2.5) * 0.3;
  const alpha = intensity * 0.12 * pulse;
  // Red-ish vignette edges
  g.fillStyle(0xff2200, alpha);
  g.fillRect(0, 0, w, 8);
  g.fillRect(0, h - 8, w, 8);
  g.fillRect(0, 0, 8, h);
  g.fillRect(w - 8, 0, 8, h);
  // Wider subtle glow
  g.fillStyle(0xff4400, alpha * 0.4);
  g.fillRect(0, 0, w, 20);
  g.fillRect(0, h - 20, w, 20);
  g.fillRect(0, 0, 20, h);
  g.fillRect(w - 20, 0, 20, h);
}

export function drawParticles(
  g: Phaser.GameObjects.Graphics,
  particles: Particle[],
  shakeX: number,
  shakeY: number,
) {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    const alpha = Math.min(1, t * 2);
    const sz = p.size * t;
    g.fillStyle(p.color, alpha * 0.3);
    g.fillCircle(p.x + shakeX, p.y + shakeY, sz * 2);
    g.fillStyle(p.color, alpha);
    g.fillCircle(p.x + shakeX, p.y + shakeY, sz);
  }
}

export function drawFlashOverlay(
  g: Phaser.GameObjects.Graphics,
  flashAlpha: number,
  w: number,
  h: number,
) {
  if (flashAlpha > 0) {
    g.fillStyle(0xffffff, flashAlpha);
    g.fillRect(0, 0, w, h);
  }
}
