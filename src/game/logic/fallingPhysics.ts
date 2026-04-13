/**
 * fallingPhysics.ts — Per-orb loosening physics
 *
 * When a piece spawns, its orbs are rigidly locked together. Over time
 * they "loosen" — wobbling, drifting, and responding to micro-gravity —
 * giving the floaty moon-gravity feel. This module runs each frame and
 * only affects VISUAL offsets (dx/dy); board-level collision uses the
 * grid row/col directly.
 */
import type { FallingOrb } from '../types';

/** Update per-orb loosening physics each frame (delta in ms) */
export function updateFallingOrbPhysics(
  fallingOrbs: FallingOrb[],
  delta: number,
  fallAge: number,
) {
  // --- Looseness ramp ---
  // Orbs stay rigid for RIGID_PHASE seconds, then loosen over LOOSEN_DURATION.
  const LOOSEN_DURATION = 6.0;
  const RIGID_PHASE = 1.0;
  const rawLooseness = Math.max(0, (fallAge - RIGID_PHASE) / (LOOSEN_DURATION - RIGID_PHASE));
  const clamped = Math.min(rawLooseness, 1);
  // Smooth-step for natural easing
  const looseness = clamped * clamped * (3 - 2 * clamped);

  const dtSec = delta * 0.001; // ms → seconds for consistent physics

  for (const orb of fallingOrbs) {
    orb.phase += dtSec * 5; // phase accumulator for wobble sine waves

    // Spring force pulling orb back to formation center
    const springStrength = 0.08 * (1 - looseness * 0.85);
    orb.vx += -orb.dx * springStrength;
    orb.vy += -orb.dy * springStrength;

    // Micro-gravity pulls heavier orbs downward as looseness increases
    const orbGravity = 0.02 * looseness * orb.weight;
    orb.vy += orbGravity;

    // Sinusoidal wobble
    const wobbleAmt = looseness * 0.15;
    orb.vx += Math.sin(orb.phase * 2.1 + orb.weight * 10) * wobbleAmt;
    orb.vy += Math.cos(orb.phase * 1.7) * wobbleAmt * 0.5;

    // Random jitter
    orb.vx += (Math.random() - 0.5) * 0.03 * looseness;
    orb.vy += (Math.random() - 0.5) * 0.02 * looseness;

    // Damping
    orb.vx *= 0.86;
    orb.vy *= 0.86;

    // Integrate
    orb.dx += orb.vx;
    orb.dy += orb.vy;

    // Clamp drift to prevent orbs from flying too far
    const maxDrift = 1.5 + looseness * 6;
    if (Math.abs(orb.dx) > maxDrift) { orb.dx = Math.sign(orb.dx) * maxDrift; orb.vx *= -0.5; }
    if (Math.abs(orb.dy) > maxDrift) { orb.dy = Math.sign(orb.dy) * maxDrift; orb.vy *= -0.4; }
  }
}
