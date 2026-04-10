const FIRE = 0xff3344, WATER = 0x3388ff, ELEC = 0xffdd00, SHADOW = 0x888899;

export function drawOrb(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  radius: number,
  color: number,
  alpha: number,
  phase: number,
) {
  if (color === FIRE) {
    const flicker = 0.9 + Math.sin(phase * 4.5) * 0.1;
    g.fillStyle(0xff6600, alpha * 0.10 * flicker);
    g.fillCircle(cx, cy, radius * 2.4);
    g.fillStyle(0xff4400, alpha * 0.20 * flicker);
    g.fillCircle(cx + Math.sin(phase * 3) * 1.5, cy - 1, radius * 1.7);
    g.fillStyle(color, alpha * 0.40);
    g.fillCircle(cx, cy, radius * 1.3);
    g.fillStyle(color, alpha * 0.95);
    g.fillCircle(cx, cy, radius);
    g.fillStyle(0xff8800, alpha * 0.45);
    g.fillCircle(cx, cy, radius * 0.6);
    g.fillStyle(0xffcc33, alpha * 0.55);
    g.fillCircle(cx, cy - radius * 0.15, radius * 0.3);
    g.fillStyle(0xff6600, alpha * 0.3);
    g.fillCircle(cx + Math.sin(phase * 5) * 3, cy - radius * 0.8, radius * 0.25);
  } else if (color === WATER) {
    const ripple = Math.sin(phase * 2) * 0.08;
    g.fillStyle(0x1155cc, alpha * 0.10);
    g.fillCircle(cx, cy, radius * 2.2);
    g.fillStyle(0x2266dd, alpha * 0.18);
    g.fillCircle(cx, cy, radius * 1.7 + ripple * radius);
    g.fillStyle(color, alpha * 0.35);
    g.fillCircle(cx, cy, radius * 1.3);
    g.fillStyle(color, alpha * 0.92);
    g.fillCircle(cx, cy, radius);
    g.fillStyle(0x66bbff, alpha * 0.35);
    g.fillCircle(cx - radius * 0.2, cy - radius * 0.15, radius * 0.5);
    g.fillStyle(0xcceeFF, alpha * 0.5);
    g.fillCircle(cx - radius * 0.25, cy - radius * 0.3, radius * 0.22);
    g.lineStyle(1, 0x88ccff, alpha * 0.15);
    g.strokeCircle(cx, cy, radius * (1.4 + Math.sin(phase * 1.5) * 0.15));
  } else if (color === ELEC) {
    const jitter = (Math.sin(phase * 12) > 0.5 ? 1 : 0) * 0.15;
    g.fillStyle(0xffff66, alpha * (0.12 + jitter));
    g.fillCircle(cx, cy, radius * 2.3);
    g.fillStyle(0xffee00, alpha * 0.25);
    g.fillCircle(cx, cy, radius * 1.6);
    g.fillStyle(color, alpha * 0.38);
    g.fillCircle(cx, cy, radius * 1.25);
    g.fillStyle(color, alpha * 0.95);
    g.fillCircle(cx, cy, radius);
    g.fillStyle(0xffffff, alpha * 0.4);
    g.fillCircle(cx, cy, radius * 0.45);
    g.lineStyle(1.5, 0xffffff, alpha * (0.4 + jitter * 2));
    const a1 = phase * 3;
    g.lineBetween(cx, cy, cx + Math.cos(a1) * radius * 1.1, cy + Math.sin(a1) * radius * 1.1);
    const a2 = phase * 3 + 2.1;
    g.lineBetween(cx, cy, cx + Math.cos(a2) * radius * 0.9, cy + Math.sin(a2) * radius * 0.9);
  } else if (color === SHADOW) {
    g.fillStyle(0x555566, alpha * 0.08);
    g.fillCircle(cx, cy, radius * 2.0);
    g.fillStyle(0x666677, alpha * 0.15);
    g.fillCircle(cx + Math.sin(phase) * 1.5, cy + Math.cos(phase * 0.7) * 1, radius * 1.5);
    g.fillStyle(color, alpha * 0.30);
    g.fillCircle(cx, cy, radius * 1.2);
    g.fillStyle(color, alpha * 0.85);
    g.fillCircle(cx, cy, radius);
    g.fillStyle(0x9977aa, alpha * 0.2);
    g.fillCircle(cx + Math.sin(phase * 1.3) * 3, cy - 2, radius * 0.5);
    g.fillStyle(0xaaaabb, alpha * 0.25);
    g.fillCircle(cx - radius * 0.15, cy - radius * 0.25, radius * 0.3);
  } else {
    g.fillStyle(color, alpha * 0.12);
    g.fillCircle(cx, cy, radius * 2.2);
    g.fillStyle(color, alpha * 0.95);
    g.fillCircle(cx, cy, radius);
    g.fillStyle(0xffffff, alpha * 0.3);
    g.fillCircle(cx - radius * 0.2, cy - radius * 0.3, radius * 0.3);
  }
}
