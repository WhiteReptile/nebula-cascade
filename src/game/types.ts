import { PieceDef } from './pieces';

export interface ActivePiece {
  def: PieceDef;
  rotation: number;
  row: number;
  col: number;
}

export interface OrbState {
  color: number;
  wobblePhase: number;
  wobbleAmp: number;
  glowPulse: number;
  landBounce: number;
  landBounceVel: number;
}

export interface FallingOrb {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  phase: number;
  weight: number;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  alpha: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}

export interface Spacecraft {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: number;
  rot: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}
