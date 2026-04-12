/**
 * background.ts — Cosmic background rendering
 *
 * Draws the deep-space backdrop behind the game grid:
 *   - Animated nebula clouds (6 layers with sine-wave drift)
 *   - Distant galaxy ellipses
 *   - Parallax starfield (200 stars with twinkle)
 *   - Shooting stars (random spawn, trail effect)
 *   - Passing spacecraft (random direction, thruster glow)
 *   - Game grid (10×20 with subtle gridlines)
 *   - Asteroid-textured border around the play area
 */
import { COLS, ROWS, CELL } from '../pieces';
import type { Star, ShootingStar, Spacecraft } from '../types';

export function drawBackground(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  nebulaTime: number,
  stars: Star[],
  shootingStars: ShootingStar[],
  spacecraft: Spacecraft[],
) {
  g.fillStyle(0x020510, 1);
  g.fillRect(0, 0, w, h);

  // Nebula clouds
  const nebAlpha = 0.08 + Math.sin(nebulaTime) * 0.03;
  g.fillStyle(0x220066, nebAlpha);
  g.fillCircle(w * 0.3 + Math.sin(nebulaTime * 0.7) * 40, h * 0.4, 260);
  g.fillStyle(0x003366, nebAlpha * 1.2);
  g.fillCircle(w * 0.7 + Math.cos(nebulaTime * 0.5) * 30, h * 0.6, 230);
  g.fillStyle(0x660033, nebAlpha * 0.8);
  g.fillCircle(w * 0.5, h * 0.2 + Math.sin(nebulaTime * 0.9) * 20, 200);
  g.fillStyle(0x110044, nebAlpha * 0.5);
  g.fillCircle(w * 0.15 + Math.cos(nebulaTime * 0.3) * 20, h * 0.75, 180);
  g.fillStyle(0x002244, nebAlpha * 0.6);
  g.fillCircle(w * 0.85 + Math.sin(nebulaTime * 0.4) * 25, h * 0.3, 170);
  g.fillStyle(0x440022, nebAlpha * 0.35);
  g.fillCircle(w * 0.6 + Math.sin(nebulaTime * 0.6) * 35, h * 0.85, 150);

  // Distant galaxies
  const gAlpha = 0.04 + Math.sin(nebulaTime * 0.2) * 0.015;
  g.fillStyle(0x8866cc, gAlpha);
  g.fillEllipse(w * 0.12, h * 0.15, 60, 25);
  g.fillStyle(0x6688aa, gAlpha * 0.8);
  g.fillEllipse(w * 0.88, h * 0.8, 45, 18);
  g.fillStyle(0xaa5577, gAlpha * 0.6);
  g.fillEllipse(w * 0.4, h * 0.92, 50, 20);

  // Stars
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
    const twinkle = 0.5 + Math.sin(nebulaTime * 3 + s.x) * 0.5;
    const starColor = s.speed > 0.7 ? 0xaaccff : (s.speed > 0.5 ? 0xffeedd : 0xffffff);
    const starSize = s.speed > 0.7 ? 1.5 : 1;
    g.fillStyle(starColor, s.alpha * twinkle);
    g.fillCircle(s.x, s.y, starSize);
    if (s.speed > 0.7 && twinkle > 0.8) {
      g.fillStyle(starColor, s.alpha * twinkle * 0.15);
      g.fillCircle(s.x, s.y, 4);
    }
  }

  // Shooting stars
  for (const ss of shootingStars) {
    const t = ss.life / ss.maxLife;
    const mag = Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy);
    const tailX = ss.x - (ss.vx / mag) * ss.len;
    const tailY = ss.y - (ss.vy / mag) * ss.len;
    g.lineStyle(2.5, 0xffffff, t * 0.9);
    g.lineBetween(ss.x, ss.y, tailX, tailY);
    g.lineStyle(1.5, 0xaaddff, t * 0.5);
    g.lineBetween(ss.x, ss.y, tailX, tailY);
    g.fillStyle(0xffffff, t);
    g.fillCircle(ss.x, ss.y, 2.5);
    g.fillStyle(0xaaddff, t * 0.3);
    g.fillCircle(ss.x, ss.y, 5);
  }

  // Spacecraft
  for (const sc of spacecraft) {
    const sz = sc.size;
    const dir = sc.vx > 0 ? 1 : -1;
    g.fillStyle(0x8899aa, 0.7);
    g.fillEllipse(sc.x, sc.y, sz * 2.5, sz * 0.8);
    g.fillStyle(0x66ccff, 0.8);
    g.fillCircle(sc.x + dir * sz * 0.8, sc.y, sz * 0.35);
    g.fillStyle(0x556677, 0.6);
    g.fillTriangle(
      sc.x - dir * sz * 0.5, sc.y,
      sc.x - dir * sz * 1.2, sc.y - sz * 0.9,
      sc.x - dir * sz * 1.2, sc.y,
    );
    g.fillTriangle(
      sc.x - dir * sz * 0.5, sc.y,
      sc.x - dir * sz * 1.2, sc.y + sz * 0.9,
      sc.x - dir * sz * 1.2, sc.y,
    );
    g.fillStyle(0xff6633, 0.6);
    g.fillCircle(sc.x - dir * sz * 1.1, sc.y, sz * 0.25);
    g.fillStyle(0xffaa44, 0.3);
    g.fillCircle(sc.x - dir * sz * 1.4, sc.y, sz * 0.4);
  }
}

export function drawGrid(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  oy: number,
) {
  const gridW = COLS * CELL;
  const gridH = ROWS * CELL;

  g.fillStyle(0x060c1a, 0.65);
  g.fillRect(ox, oy, gridW, gridH);

  g.lineStyle(1, 0x1a2244, 0.2);
  for (let r = 0; r <= ROWS; r++) {
    g.lineBetween(ox, oy + r * CELL, ox + gridW, oy + r * CELL);
  }
  for (let c = 0; c <= COLS; c++) {
    g.lineBetween(ox + c * CELL, oy, ox + c * CELL, oy + gridH);
  }
}

export function drawAsteroidBorder(
  g: Phaser.GameObjects.Graphics,
  ox: number,
  oy: number,
) {
  const gridW = COLS * CELL;
  const gridH = ROWS * CELL;
  const bw = 5;
  const rockColors = [0x4a3b2a, 0x5c4a38, 0x3d3028, 0x6b5a48, 0x554433];
  const segSize = 12;

  for (let side = 0; side < 4; side++) {
    const isHoriz = side < 2;
    const len = isHoriz ? gridW : gridH;
    const segments = Math.ceil(len / segSize);
    for (let i = 0; i < segments; i++) {
      const rockClr = rockColors[(i * 7 + side * 13) % rockColors.length];
      const variation = Math.sin(i * 3.7 + side * 2.1) * 3;
      const variation2 = Math.cos(i * 2.3 + side * 5.3) * 2;
      let rx: number, ry: number, rw: number, rh: number;
      if (side === 0) {
        rx = ox + i * segSize; ry = oy - bw + variation; rw = segSize + 1; rh = bw + 3 + Math.abs(variation2);
      } else if (side === 1) {
        rx = ox + i * segSize; ry = oy + gridH - 1 + variation; rw = segSize + 1; rh = bw + 3 + Math.abs(variation2);
      } else if (side === 2) {
        rx = ox - bw + variation; ry = oy + i * segSize; rw = bw + 3 + Math.abs(variation2); rh = segSize + 1;
      } else {
        rx = ox + gridW - 1 + variation; ry = oy + i * segSize; rw = bw + 3 + Math.abs(variation2); rh = segSize + 1;
      }
      g.fillStyle(rockClr, 0.85);
      g.fillRect(rx, ry, rw, rh);
      const bumpClr = rockColors[(i * 3 + side * 7 + 2) % rockColors.length];
      g.fillStyle(bumpClr, 0.5);
      g.fillCircle(rx + rw * 0.3, ry + rh * 0.4, 2 + Math.abs(variation) * 0.3);
    }
  }

  // Corner rocks
  for (const [cx, cy] of [[ox, oy], [ox + gridW, oy], [ox, oy + gridH], [ox + gridW, oy + gridH]] as [number, number][]) {
    g.fillStyle(0x4a3b2a, 0.9);
    g.fillCircle(cx, cy, 8);
    g.fillStyle(0x6b5a48, 0.6);
    g.fillCircle(cx + 2, cy - 1, 5);
  }
}
