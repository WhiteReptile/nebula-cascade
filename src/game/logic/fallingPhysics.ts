import type { FallingOrb } from '../types';

/** Update per-orb loosening physics each frame */
export function updateFallingOrbPhysics(
  fallingOrbs: FallingOrb[],
  delta: number,
  fallAge: number,
) {
  const LOOSEN_DURATION = 6.0;
  const RIGID_PHASE = 1.0;
  const rawLooseness = Math.max(0, (fallAge - RIGID_PHASE) / (LOOSEN_DURATION - RIGID_PHASE));
  const clamped = Math.min(rawLooseness, 1);
  const looseness = clamped * clamped * (3 - 2 * clamped);

  for (const orb of fallingOrbs) {
    orb.phase += delta * 0.005;

    const springStrength = 0.08 * (1 - looseness * 0.85);
    orb.vx += -orb.dx * springStrength;
    orb.vy += -orb.dy * springStrength;

    const orbGravity = 0.02 * looseness * orb.weight;
    orb.vy += orbGravity;

    const wobbleAmt = looseness * 0.15;
    orb.vx += Math.sin(orb.phase * 2.1 + orb.weight * 10) * wobbleAmt;
    orb.vy += Math.cos(orb.phase * 1.7) * wobbleAmt * 0.5;

    orb.vx += (Math.random() - 0.5) * 0.03 * looseness;
    orb.vy += (Math.random() - 0.5) * 0.02 * looseness;

    orb.vx *= 0.86;
    orb.vy *= 0.86;

    orb.dx += orb.vx;
    orb.dy += orb.vy;

    const maxDrift = 1.5 + looseness * 6;
    if (Math.abs(orb.dx) > maxDrift) { orb.dx = Math.sign(orb.dx) * maxDrift; orb.vx *= -0.5; }
    if (Math.abs(orb.dy) > maxDrift) { orb.dy = Math.sign(orb.dy) * maxDrift; orb.vy *= -0.4; }
  }
}
