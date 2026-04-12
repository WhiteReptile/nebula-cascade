import Phaser from 'phaser';
import { randomOrbPiece, COLS, ROWS, CELL, COLORS } from './pieces';
import { gameEvents } from './events';
import type { ActivePiece, OrbState, FallingOrb, Star, ShootingStar, Spacecraft, Particle } from './types';
import { drawBackground, drawGrid, drawAsteroidBorder } from './rendering/background';
import { drawOrb } from './rendering/orbRenderer';
import {
  createForceDropParticles, blockImplosionVFX, triColorFusionVFX,
  lineDestroyVFX, cosmicWipeVFX, reorganizeVFX, drawParticles, drawFlashOverlay,
  proximityBurstVFX, elementalCascadeVFX, gravityCrushVFX, drawUrgencyOverlay,
} from './rendering/vfx';
import {
  findBlockMatch, findTriColorMatch, findLineMatch, getChainMultiplier,
  findProximityBurst, findElementalCascade, applyGravityCrush, findNearMissOrbs,
} from './logic/chainResolver';
import { reorganizeOrbs, gravityCollapse } from './logic/orbReorganizer';
import { updateFallingOrbPhysics } from './logic/fallingPhysics';

export { gameEvents };

export class GameScene extends Phaser.Scene {
  private grid: (OrbState | null)[][] = [];
  private activePiece: ActivePiece | null = null;
  private nextPieceDef = randomOrbPiece();

  // Moon gravity
  private fallSpeed = 0;
  private fallAccum = 0;
  private readonly BASE_GRAVITY = 0.005;
  private readonly MAX_FALL_SPEED = 0.09;
  private fallAge = 0;

  private score = 0;
  private level = 1;
  private combo = 0;
  private chainStep = 0;
  private chainResolving = false;
  private gameOver = false;

  // Chain element tracking for Elemental Cascade
  private lastChainElement: string | null = null;

  // Match tracking
  private matchStartedAt = new Date();
  private matchMaxCombo = 0;
  private matchComboPoints = 0;
  private matchOmniColorCount = 0;
  private matchLinesCleared = 0;

  // Time tracking for speed ramp + urgency
  private gameElapsed = 0; // seconds since game start
  private readonly URGENCY_START = 60; // 1:00
  private speedBonus = 0; // additional gravity multiplier from time

  // Near-miss highlight timer
  private nearMissTimer = 0;
  private nearMissCells: [number, number][] = [];

  // Force drop flag for gravity crush
  private wasForceDropped = false;
  private forceDropCells: [number, number][] = [];

  private paused = false;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pieceGraphics!: Phaser.GameObjects.Graphics;
  private vfxGraphics!: Phaser.GameObjects.Graphics;
  private stars: Star[] = [];
  private shootingStars: ShootingStar[] = [];
  private spacecraft: Spacecraft[] = [];
  private nebulaTime = 0;
  private offsetX = 0;
  private offsetY = 0;
  private particles: Particle[] = [];
  private shakeAmount = 0;
  private slowMo = false;
  private slowMoTimer = 0;
  private globalTime = 0;
  private flashAlpha = 0;
  private bounceOffset = 0;
  private bounceVel = 0;
  private snapScale = 1;
  private fallingOrbs: FallingOrb[] = [];

  constructor() { super({ key: 'GameScene' }); }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.offsetX = Math.floor((w - COLS * CELL) / 2);
    this.offsetY = Math.floor((h - ROWS * CELL) / 2);
    this.stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      speed: 0.2 + Math.random() * 0.8, alpha: 0.3 + Math.random() * 0.7,
    }));
    this.gridGraphics = this.add.graphics();
    this.pieceGraphics = this.add.graphics();
    this.vfxGraphics = this.add.graphics();
    this.resetGame();

    this.input.keyboard?.on('keydown-LEFT', () => { this.moveActive(0, -1); this.bounceVel = -2; });
    this.input.keyboard?.on('keydown-RIGHT', () => { this.moveActive(0, 1); this.bounceVel = -2; });
    this.input.keyboard?.on('keydown-DOWN', () => this.moveActive(1, 0));
    this.input.keyboard?.on('keydown-UP', () => { this.rotateActive(); this.bounceVel = -2; });
    this.input.keyboard?.on('keydown-Z', () => this.forceDrop());
    this.input.keyboard?.on('keydown-SPACE', () => { this.paused = !this.paused; gameEvents.emit('pause', this.paused); });
    gameEvents.on('restart', () => this.resetGame());
  }

  private resetGame() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.score = 0; this.level = 1; this.combo = 0;
    this.gameOver = false; this.paused = false;
    this.particles = []; this.shakeAmount = 0; this.flashAlpha = 0;
    this.bounceOffset = 0; this.bounceVel = 0;
    this.fallSpeed = 0; this.fallAccum = 0; this.fallAge = 0;
    this.gameElapsed = 0; this.speedBonus = 0;
    this.lastChainElement = null;
    this.nearMissTimer = 0; this.nearMissCells = [];
    this.wasForceDropped = false; this.forceDropCells = [];
    this.matchStartedAt = new Date();
    this.matchMaxCombo = 0; this.matchComboPoints = 0;
    this.matchOmniColorCount = 0; this.matchLinesCleared = 0;
    this.nextPieceDef = randomOrbPiece();
    this.spawnPiece();
    this.emitHUD();
  }

  private initFallingOrbs(count: number) {
    this.fallingOrbs = Array.from({ length: count }, () => ({
      dx: 0, dy: 0, vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
      weight: 0.90 + Math.random() * 0.2,
    }));
  }

  // Get the most common color on the board for lucky piece bias
  private getBoardDominantColor(): number | null {
    const counts = new Map<number, number>();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const orb = this.grid[r][c];
        if (orb) counts.set(orb.color, (counts.get(orb.color) || 0) + 1);
      }
    }
    let best: number | null = null, bestCount = 0;
    for (const [color, count] of counts) {
      if (count > bestCount) { bestCount = count; best = color; }
    }
    return best;
  }

  private spawnPiece() {
    const def = this.nextPieceDef;
    this.nextPieceDef = randomOrbPiece(this.getBoardDominantColor());
    this.activePiece = { def, rotation: 0, row: 0, col: Math.floor(COLS / 2) - 1 };
    this.snapScale = 1; this.fallSpeed = 0; this.fallAccum = 0; this.fallAge = 0;
    this.initFallingOrbs(def.shapes[0].length);
    if (!this.isValid(this.activePiece)) {
      this.gameOver = true;
      gameEvents.emit('gameover', this.score);
      gameEvents.emit('matchEnd', {
        score: this.score, level: this.level,
        maxCombo: this.matchMaxCombo, comboPoints: this.matchComboPoints,
        omniColorCount: this.matchOmniColorCount, linesCleared: this.matchLinesCleared,
        startedAt: this.matchStartedAt,
      });
    }
    gameEvents.emit('nextPiece', this.nextPieceDef);
  }

  private getCells(p: ActivePiece) { return p.def.shapes[p.rotation % p.def.shapes.length]; }

  private isValid(p: ActivePiece): boolean {
    for (const [r, c] of this.getCells(p)) {
      const nr = p.row + r, nc = p.col + c;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (this.grid[nr][nc] !== null) return false;
    }
    return true;
  }

  private moveActive(dr: number, dc: number) {
    if (!this.activePiece || this.gameOver || this.paused) return;
    const test = { ...this.activePiece, row: this.activePiece.row + dr, col: this.activePiece.col + dc };
    if (this.isValid(test)) {
      this.activePiece = test;
      for (const orb of this.fallingOrbs) { orb.dx *= 0.4; orb.dy *= 0.4; orb.vx *= 0.3; orb.vy *= 0.3; }
    }
  }

  private rotateActive() {
    if (!this.activePiece || this.gameOver || this.paused) return;
    const test = { ...this.activePiece, rotation: (this.activePiece.rotation + 1) % 4 };
    const snapOrbs = () => { for (const orb of this.fallingOrbs) { orb.dx *= 0.3; orb.dy *= 0.3; orb.vx *= 0.2; orb.vy *= 0.2; } };
    if (this.isValid(test)) {
      this.activePiece = test;
      const newCells = this.getCells(this.activePiece);
      while (this.fallingOrbs.length < newCells.length) {
        this.fallingOrbs.push({ dx: 0, dy: 0, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2, weight: 0.85 + Math.random() * 0.3 });
      }
      snapOrbs();
    } else {
      for (const offset of [-1, 1, -2, 2]) {
        const kicked = { ...test, col: test.col + offset };
        if (this.isValid(kicked)) { this.activePiece = kicked; snapOrbs(); return; }
      }
    }
  }

  private forceDrop() {
    if (!this.activePiece || this.gameOver || this.paused) return;
    let dropDist = 0;
    while (true) {
      const test = { ...this.activePiece, row: this.activePiece.row + 1 };
      if (this.isValid(test)) { this.activePiece = test; dropDist++; } else break;
    }
    this.score += dropDist * 5;
    createForceDropParticles(this.particles, this.getCells(this.activePiece), this.activePiece.def.color, this.offsetX, this.offsetY, this.activePiece.col, this.activePiece.row);
    this.shakeAmount = 8;
    this.flashAlpha = 0.3;
    this.wasForceDropped = true;
    // Store placed cells for gravity crush
    this.forceDropCells = this.getCells(this.activePiece).map(([r, c]) => 
      [this.activePiece!.row + r, this.activePiece!.col + c] as [number, number]
    );
    this.lockPiece();
  }

  private lockPiece() {
    if (!this.activePiece) return;
    const placedColor = this.activePiece.def.color;
    for (const [r, c] of this.getCells(this.activePiece)) {
      const nr = this.activePiece.row + r, nc = this.activePiece.col + c;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        this.grid[nr][nc] = {
          color: placedColor,
          wobblePhase: Math.random() * Math.PI * 2, wobbleAmp: 3 + Math.random() * 2,
          glowPulse: Math.random() * Math.PI * 2,
          landBounce: -5 - Math.random() * 3, landBounceVel: 0,
        };
      }
    }
    this.snapScale = 1.15;
    this.chainStep = 0;
    this.lastChainElement = null;
    this.chainResolving = true;

    // Apply gravity crush if force-dropped
    if (this.wasForceDropped) {
      this.wasForceDropped = false;
      const pushed = applyGravityCrush(this.grid, this.forceDropCells, placedColor);
      if (pushed.length > 0) {
        gravityCrushVFX(this.particles, pushed, placedColor, this.offsetX, this.offsetY);
        this.shakeAmount = Math.max(this.shakeAmount, 3);
      }
      this.forceDropCells = [];
    }

    this.resolveChains();
  }

  private resolveChains() {
    // 1. Block match
    const blockResult = findBlockMatch(this.grid);
    if (blockResult) {
      this.chainStep++;
      const currentElement = this.getElementForColor(blockResult.color);
      const mult = getChainMultiplier(this.chainStep);
      const chainScore = Math.min(Math.floor(200 * mult * this.level), 1000);
      this.score += chainScore; this.matchComboPoints += chainScore;
      this.matchMaxCombo = Math.max(this.matchMaxCombo, this.chainStep);
      const fx = blockImplosionVFX(this.particles, blockResult.cells, blockResult.color, this.chainStep, this.offsetX, this.offsetY);
      this.applyVFX(fx);
      const placed = reorganizeOrbs(this.grid, blockResult.cells, blockResult.color);
      reorganizeVFX(this.particles, placed, blockResult.color, ...this.getCellBounds(blockResult.cells), this.offsetX, this.offsetY);
      gravityCollapse(this.grid);

      // Check Elemental Cascade (chain 3+)
      this.checkElementalCascade(currentElement, blockResult.color);
      this.lastChainElement = currentElement;

      gameEvents.emit('chainCombo', this.chainStep);
      this.emitHUD();
      this.time.delayedCall(350 + this.chainStep * 50, () => this.resolveChains());
      return;
    }

    // 2. Proximity Burst (5+ adjacent same-color cluster)
    const proximityResult = findProximityBurst(this.grid);
    if (proximityResult) {
      this.chainStep++;
      const currentElement = this.getElementForColor(proximityResult.color);
      const mult = getChainMultiplier(this.chainStep);
      const baseScore = Math.min(proximityResult.cells.length * 25, 500);
      const chainScore = Math.min(Math.floor(baseScore * mult * this.level), 500);
      this.score += chainScore; this.matchComboPoints += chainScore;
      this.matchMaxCombo = Math.max(this.matchMaxCombo, this.chainStep);
      const fx = proximityBurstVFX(this.particles, proximityResult.cells, proximityResult.color, this.chainStep, this.offsetX, this.offsetY);
      this.applyVFX(fx);
      // Destroy the cluster
      for (const [r, c] of proximityResult.cells) { this.grid[r][c] = null; }
      gravityCollapse(this.grid);

      this.checkElementalCascade(currentElement, proximityResult.color);
      this.lastChainElement = currentElement;

      gameEvents.emit('chainCombo', this.chainStep);
      this.emitHUD();
      this.time.delayedCall(300 + this.chainStep * 50, () => this.resolveChains());
      return;
    }

    // 3. Tri-color
    const triResult = findTriColorMatch(this.grid);
    if (triResult) {
      this.chainStep++;
      const mult = getChainMultiplier(this.chainStep);
      const baseScore = Math.min(triResult.cells.length * 30, 400);
      const chainScore = Math.min(Math.floor(baseScore * mult * this.level), 1000);
      this.score += chainScore; this.matchComboPoints += chainScore;
      this.matchMaxCombo = Math.max(this.matchMaxCombo, this.chainStep);
      this.matchOmniColorCount++;
      const fx = triColorFusionVFX(this.particles, triResult.cells, this.chainStep, this.offsetX, this.offsetY, this.grid);
      this.applyVFX(fx);
      const placed = reorganizeOrbs(this.grid, triResult.cells, triResult.dominantColor);
      reorganizeVFX(this.particles, placed, triResult.dominantColor, ...this.getCellBounds(triResult.cells), this.offsetX, this.offsetY);
      gravityCollapse(this.grid);
      this.lastChainElement = null;
      gameEvents.emit('chainCombo', this.chainStep);
      gameEvents.emit('triColor', this.chainStep);
      this.emitHUD();
      this.time.delayedCall(450 + this.chainStep * 50, () => this.resolveChains());
      return;
    }

    // 4. Line match
    const lineResult = findLineMatch(this.grid, this.combo);
    if (lineResult) {
      this.chainStep++;
      const mult = getChainMultiplier(this.chainStep);
      if (lineResult.cosmicWipe) {
        this.score += Math.min(Math.floor(800 * mult * this.level), 1000);
        this.matchComboPoints += Math.min(Math.floor(800 * mult * this.level), 1000);
        this.matchMaxCombo = Math.max(this.matchMaxCombo, this.chainStep);
        const fx = cosmicWipeVFX(this.particles, this.chainStep, this.offsetX, this.offsetY);
        this.applyVFX(fx);
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        this.combo = 0;
      } else {
        const baseScore = lineResult.rows.length * 80;
        const chainScore = Math.min(Math.floor(baseScore * mult * this.level), 500);
        this.score += chainScore; this.matchComboPoints += chainScore;
        this.matchMaxCombo = Math.max(this.matchMaxCombo, this.chainStep);
        this.matchLinesCleared += lineResult.rows.length;
        const fx = lineDestroyVFX(this.particles, lineResult.rows, this.chainStep, this.offsetX, this.offsetY, this.grid);
        this.applyVFX(fx);
        const sorted = [...new Set(lineResult.rows)].sort((a, b) => a - b);
        for (const row of sorted) { this.grid.splice(row, 1); this.grid.unshift(Array(COLS).fill(null)); }
        this.combo += lineResult.rows.length;
      }
      this.lastChainElement = null;
      gameEvents.emit('chainCombo', this.chainStep);
      this.emitHUD();
      this.time.delayedCall(400 + this.chainStep * 50, () => this.resolveChains());
      return;
    }

    // No matches found — end chain
    this.chainResolving = false;
    if (this.chainStep === 0) this.combo = 0;
    this.lastChainElement = null;
    this.level = Math.floor(this.score / 2000) + 1;

    // Near-miss helper: highlight almost-matching orbs
    this.nearMissCells = findNearMissOrbs(this.grid);
    if (this.nearMissCells.length > 0) {
      this.nearMissTimer = 60; // ~1 second at 60fps
    }

    // Combo mercy window: delay spawn after chain 2+
    const mercyDelay = this.chainStep >= 2 ? 500 : 0;
    if (mercyDelay > 0) {
      this.time.delayedCall(mercyDelay, () => {
        this.spawnPiece();
        this.emitHUD();
      });
    } else {
      this.spawnPiece();
      this.emitHUD();
    }
  }

  private getElementForColor(color: number): string {
    const found = COLORS.find(c => c.color === color);
    return found ? found.element : 'unknown';
  }

  private checkElementalCascade(currentElement: string, color: number) {
    const cascade = findElementalCascade(this.grid, this.chainStep, this.lastChainElement, currentElement);
    if (cascade) {
      const mult = getChainMultiplier(this.chainStep);
      const cascadeScore = Math.min(Math.floor(300 * mult * this.level), 500);
      this.score += cascadeScore; this.matchComboPoints += cascadeScore;
      const fx = elementalCascadeVFX(this.particles, cascade.column, color, this.chainStep, this.offsetX, this.offsetY);
      this.applyVFX(fx);
      for (const [r, c] of cascade.cells) { this.grid[r][c] = null; }
      gravityCollapse(this.grid);
      gameEvents.emit('elementalCascade', this.chainStep);
    }
  }

  private applyVFX(fx: { shakeAmount: number; flashAlpha: number; slowMoTimer: number }) {
    this.shakeAmount = fx.shakeAmount;
    this.flashAlpha = fx.flashAlpha;
    this.slowMo = true;
    this.slowMoTimer = fx.slowMoTimer;
  }

  private getCellBounds(cells: [number, number][]): [number, number, number] {
    let minCol = COLS, maxCol = 0, maxRow = 0;
    for (const [r, c] of cells) {
      if (c < minCol) minCol = c;
      if (c > maxCol) maxCol = c;
      if (r > maxRow) maxRow = r;
    }
    return [minCol, maxCol, maxRow];
  }

  private emitHUD() {
    gameEvents.emit('hud', {
      score: this.score, level: this.level, combo: this.combo,
      elapsed: this.gameElapsed, urgency: this.getUrgencyIntensity(),
    });
  }

  private getUrgencyIntensity(): number {
    if (this.gameElapsed < this.URGENCY_START) return 0;
    // Ramps from 0 to 1 over ~60 seconds after urgency starts
    return Math.min((this.gameElapsed - this.URGENCY_START) / 60, 1);
  }

  private getGravityMultiplier(): number {
    // After 80s, gradually increase gravity
    if (this.gameElapsed < this.URGENCY_START) return 1;
    const elapsed = this.gameElapsed - this.URGENCY_START;
    // Very small increment: +2% per second, stacking
    return 1 + elapsed * 0.02;
  }

  update(_time: number, delta: number) {
    if (this.gameOver || this.paused) { this.drawAll(); return; }
    const dt = this.slowMo ? delta * 0.3 : delta;
    this.globalTime += delta * 0.001;
    this.gameElapsed += delta * 0.001;

    if (this.slowMo) { this.slowMoTimer--; if (this.slowMoTimer <= 0) this.slowMo = false; }

    // Near-miss timer decay
    if (this.nearMissTimer > 0) this.nearMissTimer--;

    // Bounce spring
    this.bounceOffset += this.bounceVel;
    this.bounceVel += -this.bounceOffset * 0.3;
    this.bounceVel *= 0.85;
    if (Math.abs(this.bounceOffset) < 0.05 && Math.abs(this.bounceVel) < 0.05) { this.bounceOffset = 0; this.bounceVel = 0; }

    // Snap scale decay
    if (this.snapScale > 1) { this.snapScale = 1 + (this.snapScale - 1) * 0.85; if (this.snapScale < 1.005) this.snapScale = 1; }

    // Falling orb physics
    this.fallAge += delta * 0.001;
    updateFallingOrbPhysics(this.fallingOrbs, delta, this.fallAge);

    // Landing bounce for placed orbs
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const orb = this.grid[r][c];
        if (orb && orb.landBounce !== 0) {
          orb.landBounceVel += -orb.landBounce * 0.2;
          orb.landBounceVel *= 0.80;
          orb.landBounce += orb.landBounceVel;
          if (Math.abs(orb.landBounce) < 0.1 && Math.abs(orb.landBounceVel) < 0.1) { orb.landBounce = 0; orb.landBounceVel = 0; }
        }
      }
    }

    // Moon gravity — delta-time based velocity + acceleration with time-based speed ramp
    if (this.activePiece && !this.chainResolving) {
      const dtSec = dt * 0.001;
      const levelBoost = 1 + (this.level - 1) * 0.045;
      const timeBoost = this.getGravityMultiplier();

      this.fallSpeed = Math.min(
        this.fallSpeed + this.BASE_GRAVITY * 1000 * levelBoost * timeBoost * dtSec,
        this.MAX_FALL_SPEED * 60 * Math.min(timeBoost, 3), // cap terminal velocity scaling
      );
      this.fallSpeed *= Math.pow(0.992, dtSec * 60);

      this.fallAccum += this.fallSpeed * dtSec;

      while (this.fallAccum >= 1) {
        this.fallAccum -= 1;
        const test = { ...this.activePiece, row: this.activePiece.row + 1 };
        if (this.isValid(test)) { this.activePiece = test; }
        else { this.fallAccum = 0; this.lockPiece(); break; }
      }
    }

    // Shake/flash decay
    if (this.shakeAmount > 0) this.shakeAmount *= 0.88;
    if (this.shakeAmount < 0.1) this.shakeAmount = 0;
    if (this.flashAlpha > 0) this.flashAlpha *= 0.92;
    if (this.flashAlpha < 0.01) this.flashAlpha = 0;

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.99; p.life--;
      return p.life > 0;
    });

    // Shooting stars
    const sw = this.scale.width, sh = this.scale.height;
    if (Math.random() < 0.008) {
      const startX = Math.random() * sw;
      const angle = Math.PI * 0.6 + Math.random() * 0.4;
      const speed = 4 + Math.random() * 6;
      const life = 60 + Math.random() * 40;
      this.shootingStars.push({ x: startX, y: -10, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, len: 30 + Math.random() * 50 });
    }
    this.shootingStars = this.shootingStars.filter(s => { s.x += s.vx; s.y += s.vy; s.life--; return s.life > 0 && s.y < sh + 20; });

    // Spacecraft
    if (Math.random() < 0.003 && this.spacecraft.length < 3) {
      const fromLeft = Math.random() > 0.5;
      this.spacecraft.push({ x: fromLeft ? -30 : sw + 30, y: 40 + Math.random() * (sh - 80), vx: (fromLeft ? 1 : -1) * (0.8 + Math.random() * 1.5), vy: (Math.random() - 0.5) * 0.3, size: 6 + Math.random() * 8, type: Math.floor(Math.random() * 3), rot: fromLeft ? 0 : Math.PI });
    }
    this.spacecraft = this.spacecraft.filter(s => { s.x += s.vx; s.y += s.vy; return s.x > -60 && s.x < sw + 60; });

    this.nebulaTime += dt * 0.001;
    this.drawAll();
  }

  private drawAll() {
    const w = this.scale.width, h = this.scale.height;
    const shakeX = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount * 2 : 0;
    const shakeY = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount * 2 : 0;

    this.gridGraphics.clear();
    drawBackground(this.gridGraphics, w, h, this.nebulaTime, this.stars, this.shootingStars, this.spacecraft);

    const ox = this.offsetX + shakeX;
    const oy = this.offsetY + shakeY;
    drawGrid(this.gridGraphics, ox, oy);
    drawAsteroidBorder(this.gridGraphics, ox, oy);

    // Placed orbs
    const orbRadius = CELL * 0.42;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const orb = this.grid[r][c];
        if (orb) {
          const wobble = Math.sin(this.globalTime * 2.5 + orb.wobblePhase) * orb.wobbleAmp * 0.3;
          const px = ox + c * CELL + CELL / 2;
          const py = oy + r * CELL + CELL / 2 + wobble + orb.landBounce;
          const glow = 0.85 + Math.sin(this.globalTime * 1.8 + orb.glowPulse) * 0.15;
          drawOrb(this.gridGraphics, px, py, orbRadius * this.snapScale, orb.color, glow, this.globalTime * 2 + orb.wobblePhase);

          // Near-miss highlight
          if (this.nearMissTimer > 0 && this.nearMissCells.some(([nr, nc]) => nr === r && nc === c)) {
            const pulseAlpha = (this.nearMissTimer / 60) * (0.3 + Math.sin(this.globalTime * 8) * 0.15);
            this.gridGraphics.fillStyle(0xffffff, pulseAlpha);
            this.gridGraphics.fillCircle(px, py, orbRadius * 1.6);
          }
        }
      }
    }

    // Active piece
    this.pieceGraphics.clear();
    if (this.activePiece && !this.gameOver) {
      const cells = this.getCells(this.activePiece);
      const clr = this.activePiece.def.color;

      // Ghost
      let ghostRow = this.activePiece.row;
      while (true) {
        const test = { ...this.activePiece, row: ghostRow + 1 };
        if (this.isValid(test)) ghostRow++; else break;
      }
      if (ghostRow !== this.activePiece.row) {
        for (const [r, c] of cells) {
          const px = ox + (this.activePiece.col + c) * CELL + CELL / 2;
          const py = oy + (ghostRow + r) * CELL + CELL / 2;
          this.pieceGraphics.fillStyle(clr, 0.1);
          this.pieceGraphics.fillCircle(px, py, orbRadius * 1.2);
          this.pieceGraphics.lineStyle(1, clr, 0.2);
          this.pieceGraphics.strokeCircle(px, py, orbRadius);
        }
      }

      // Visual interpolation: use fallAccum for smooth sub-cell offset
      const visualYOffset = this.fallAccum * CELL;
      const looseness = Math.min(this.fallAge / 3.0, 1);
      for (let i = 0; i < cells.length; i++) {
        const [r, c] = cells[i];
        const fo = this.fallingOrbs[i] || { dx: 0, dy: 0 };
        const px = ox + (this.activePiece.col + c) * CELL + CELL / 2 + this.bounceOffset + fo.dx;
        const py = oy + (this.activePiece.row + r) * CELL + CELL / 2 + visualYOffset + fo.dy;
        drawOrb(this.pieceGraphics, px, py, orbRadius, clr, 1, this.globalTime * 3 + fo.dx);
      }

      if (cells.length > 1) {
        const linkAlpha = 0.35 * (1 - looseness * 0.7);
        this.pieceGraphics.lineStyle(1.5, clr, linkAlpha);
        for (let i = 0; i < cells.length - 1; i++) {
          const [r1, c1] = cells[i];
          const [r2, c2] = cells[i + 1];
          const j1 = this.fallingOrbs[i] || { dx: 0, dy: 0 };
          const j2 = this.fallingOrbs[i + 1] || { dx: 0, dy: 0 };
          this.pieceGraphics.lineBetween(
            ox + (this.activePiece.col + c1) * CELL + CELL / 2 + this.bounceOffset + j1.dx,
            oy + (this.activePiece.row + r1) * CELL + CELL / 2 + visualYOffset + j1.dy,
            ox + (this.activePiece.col + c2) * CELL + CELL / 2 + this.bounceOffset + j2.dx,
            oy + (this.activePiece.row + r2) * CELL + CELL / 2 + visualYOffset + j2.dy,
          );
        }
      }
    }

    // VFX
    this.vfxGraphics.clear();
    drawParticles(this.vfxGraphics, this.particles, shakeX, shakeY);
    drawFlashOverlay(this.vfxGraphics, this.flashAlpha, w, h);

    // Urgency overlay (subtle vignette after 1:20)
    const urgency = this.getUrgencyIntensity();
    if (urgency > 0) {
      drawUrgencyOverlay(this.vfxGraphics, urgency, w, h, this.globalTime);
    }
  }
}