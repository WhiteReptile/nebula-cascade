import Phaser from 'phaser';
import { randomOrbPiece, COLS, ROWS, CELL, PieceDef, FORMATIONS_LIST } from './pieces';

// Event bus for React HUD
export const gameEvents = new Phaser.Events.EventEmitter();

interface ActivePiece {
  def: PieceDef;
  rotation: number;
  row: number;
  col: number;
}

// Wobble state per placed orb
interface OrbState {
  color: number;
  wobblePhase: number;
  wobbleAmp: number;
  glowPulse: number;
  landBounce: number;
  landBounceVel: number;
}

// Per-orb physics for the active falling piece
interface FallingOrb {
  dx: number;   // visual offset from grid position (pixels)
  dy: number;
  vx: number;
  vy: number;
  phase: number;
  weight: number; // 0.85-1.15 — slight mass variation per orb
}

export class GameScene extends Phaser.Scene {
  private grid: (OrbState | null)[][] = [];
  private activePiece: ActivePiece | null = null;
  private nextPieceDef: PieceDef | null = null;

  // Moon gravity fall system
  private fallSpeed = 0;
  private fallAccum = 0;
  private readonly GRAVITY = 0.0009;       // 70% slower — ultra-lunar gravity
  private readonly MAX_FALL_SPEED = 0.054; // 70% slower terminal velocity
  private fallAge = 0;                     // frames since spawn — drives looseness

  private score = 0;
  private level = 1;
  private combo = 0;
  private chainStep = 0;        // current chain depth in resolveChains
  private chainResolving = false; // true while chain loop is active
  private gameOver = false;
  private paused = false;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pieceGraphics!: Phaser.GameObjects.Graphics;
  private vfxGraphics!: Phaser.GameObjects.Graphics;
  private stars: { x: number; y: number; speed: number; alpha: number }[] = [];
  private nebulaTime = 0;
  private offsetX = 0;
  private offsetY = 0;
  private particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: number; size: number }[] = [];
  private shakeAmount = 0;
  private slowMo = false;
  private slowMoTimer = 0;
  private globalTime = 0;
  private flashAlpha = 0;
  private bounceOffset = 0;
  private bounceVel = 0;
  private snapScale = 1;
  private fallingOrbs: FallingOrb[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.offsetX = Math.floor((w - COLS * CELL) / 2);
    this.offsetY = Math.floor((h - ROWS * CELL) / 2);

    this.stars = [];
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 0.2 + Math.random() * 0.8,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    this.gridGraphics = this.add.graphics();
    this.pieceGraphics = this.add.graphics();
    this.vfxGraphics = this.add.graphics();

    this.resetGame();

    // Input
    this.input.keyboard?.on('keydown-LEFT', () => { this.moveActive(0, -1); this.triggerBounce(); });
    this.input.keyboard?.on('keydown-RIGHT', () => { this.moveActive(0, 1); this.triggerBounce(); });
    this.input.keyboard?.on('keydown-DOWN', () => this.moveActive(1, 0));
    this.input.keyboard?.on('keydown-UP', () => { this.rotateActive(); this.triggerBounce(); });
    this.input.keyboard?.on('keydown-Z', () => this.forceDrop());
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.paused = !this.paused;
      gameEvents.emit('pause', this.paused);
    });

    gameEvents.on('restart', () => this.resetGame());
  }

  private triggerBounce() {
    this.bounceVel = -2;
  }

  private resetGame() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.gameOver = false;
    this.paused = false;
    this.particles = [];
    this.shakeAmount = 0;
    this.flashAlpha = 0;
    this.bounceOffset = 0;
    this.bounceVel = 0;
    this.fallSpeed = 0;
    this.fallAccum = 0;
    this.fallAge = 0;
    this.nextPieceDef = randomOrbPiece();
    this.spawnPiece();
    this.emitHUD();
  }

  private initFallingOrbs(cellCount: number) {
    this.fallingOrbs = [];
    for (let i = 0; i < cellCount; i++) {
      this.fallingOrbs.push({
        dx: 0, dy: 0,
        vx: 0, vy: 0,
        phase: Math.random() * Math.PI * 2,
        weight: 0.85 + Math.random() * 0.3, // each orb has slightly different mass
      });
    }
  }

  private spawnPiece() {
    const def = this.nextPieceDef || randomOrbPiece();
    this.nextPieceDef = randomOrbPiece();
    this.activePiece = { def, rotation: 0, row: 0, col: Math.floor(COLS / 2) - 1 };
    this.snapScale = 1;
    this.fallSpeed = 0;
    this.fallAccum = 0;
    this.fallAge = 0;
    this.initFallingOrbs(def.shapes[0].length);
    if (!this.isValid(this.activePiece)) {
      this.gameOver = true;
      gameEvents.emit('gameover', this.score);
    }
    gameEvents.emit('nextPiece', this.nextPieceDef);
  }

  private getCells(p: ActivePiece): number[][] {
    return p.def.shapes[p.rotation % p.def.shapes.length];
  }

  private isValid(p: ActivePiece): boolean {
    for (const [r, c] of this.getCells(p)) {
      const nr = p.row + r;
      const nc = p.col + c;
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
      // Snap orbs back together on move for readability
      for (const orb of this.fallingOrbs) {
        orb.dx *= 0.4;
        orb.dy *= 0.4;
        orb.vx *= 0.3;
        orb.vy *= 0.3;
      }
    }
  }

  private rotateActive() {
    if (!this.activePiece || this.gameOver || this.paused) return;
    const test = { ...this.activePiece, rotation: (this.activePiece.rotation + 1) % 4 };
    if (this.isValid(test)) {
      this.activePiece = test;
      const newCells = this.getCells(this.activePiece);
      while (this.fallingOrbs.length < newCells.length) {
        this.fallingOrbs.push({ dx: 0, dy: 0, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2, weight: 0.85 + Math.random() * 0.3 });
      }
      // Snap orbs back together on rotate
      for (const orb of this.fallingOrbs) {
        orb.dx *= 0.3;
        orb.dy *= 0.3;
        orb.vx *= 0.2;
        orb.vy *= 0.2;
      }
    } else {
      for (const offset of [-1, 1, -2, 2]) {
        const kicked = { ...test, col: test.col + offset };
        if (this.isValid(kicked)) {
          this.activePiece = kicked;
          for (const orb of this.fallingOrbs) {
            orb.dx *= 0.3; orb.dy *= 0.3; orb.vx *= 0.2; orb.vy *= 0.2;
          }
          return;
        }
      }
    }
  }

  private forceDrop() {
    if (!this.activePiece || this.gameOver || this.paused) return;
    let dropDist = 0;
    while (true) {
      const test = { ...this.activePiece, row: this.activePiece.row + 1 };
      if (this.isValid(test)) {
        this.activePiece = test;
        dropDist++;
      } else break;
    }
    this.score += dropDist * 5;

    // Shockwave VFX
    const cells = this.getCells(this.activePiece);
    for (const [r, c] of cells) {
      const px = this.offsetX + (this.activePiece.col + c) * CELL + CELL / 2;
      const py = this.offsetY + (this.activePiece.row + r) * CELL + CELL / 2;
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.particles.push({
          x: px, y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 35, maxLife: 35,
          color: this.activePiece.def.color,
          size: 3 + Math.random() * 4,
        });
      }
    }
    this.shakeAmount = 8;
    this.flashAlpha = 0.3;
    this.lockPiece();
  }

  private lockPiece() {
    if (!this.activePiece) return;
    const cells = this.getCells(this.activePiece);
    for (const [r, c] of cells) {
      const nr = this.activePiece.row + r;
      const nc = this.activePiece.col + c;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        this.grid[nr][nc] = {
          color: this.activePiece.def.color,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleAmp: 3 + Math.random() * 2,
          glowPulse: Math.random() * Math.PI * 2,
          landBounce: -5 - Math.random() * 3,
          landBounceVel: 0,
        };
      }
    }
    this.snapScale = 1.15;
    this.chainStep = 0;
    this.chainResolving = true;
    this.resolveChains();
  }

  /** Chain reaction loop: check 4x4 blocks and 3-line clears repeatedly until no more matches */
  private resolveChains() {
    let foundMatch = false;

    // 1. Check 4x4 blocks
    const blockResult = this.findBlockMatch();
    if (blockResult) {
      foundMatch = true;
      this.chainStep++;
      const mult = this.getChainMultiplier(this.chainStep);
      const baseScore = 800;
      this.score += Math.floor(baseScore * mult * this.level);
      this.blockImplosionVFX(blockResult.cells, blockResult.color, this.chainStep);
      this.reorganizeOrbs(blockResult.cells, blockResult.color);
      this.gravityCollapse();
      gameEvents.emit('chainCombo', this.chainStep);
      this.emitHUD();
      // Delay next chain check so VFX plays out
      this.time.delayedCall(350 + this.chainStep * 50, () => this.resolveChains());
      return;
    }

    // 2. Check 3-line same-color clears
    const lineResult = this.findLineMatch();
    if (lineResult) {
      foundMatch = true;
      this.chainStep++;
      const mult = this.getChainMultiplier(this.chainStep);

      if (lineResult.cosmicWipe) {
        // 5-line cosmic combo — wipe board
        this.score += Math.floor(5000 * mult * this.level);
        this.cosmicWipeVFX(this.chainStep);
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        this.combo = 0;
      } else {
        const baseScore = lineResult.rows.length * lineResult.rows.length * 100;
        this.score += Math.floor(baseScore * mult * this.level);
        this.lineDestroyVFX(lineResult.rows, this.chainStep);
        // Remove rows
        const sorted = [...new Set(lineResult.rows)].sort((a, b) => a - b);
        for (const row of sorted) {
          this.grid.splice(row, 1);
          this.grid.unshift(Array(COLS).fill(null));
        }
        this.combo += lineResult.rows.length;
      }

      gameEvents.emit('chainCombo', this.chainStep);
      this.emitHUD();
      this.time.delayedCall(400 + this.chainStep * 50, () => this.resolveChains());
      return;
    }

    // No more matches — end chain
    this.chainResolving = false;
    if (this.chainStep === 0) this.combo = 0;
    this.level = Math.floor(this.score / 2000) + 1;
    this.spawnPiece();
    this.emitHUD();
  }

  private getChainMultiplier(step: number): number {
    if (step <= 1) return 1;
    if (step === 2) return 2.5;
    return Math.pow(step, 1.8);
  }

  /** Find first 4x4 same-color block on the grid */
  private findBlockMatch(): { cells: [number, number][]; color: number } | null {
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const refOrb = this.grid[r][c];
        if (!refOrb) continue;
        const color = refOrb.color;
        let allMatch = true;
        for (let dr = 0; dr < 4 && allMatch; dr++) {
          for (let dc = 0; dc < 4 && allMatch; dc++) {
            const orb = this.grid[r + dr][c + dc];
            if (!orb || orb.color !== color) allMatch = false;
          }
        }
        if (allMatch) {
          const cells: [number, number][] = [];
          for (let dr = 0; dr < 4; dr++) {
            for (let dc = 0; dc < 4; dc++) {
              cells.push([r + dr, c + dc]);
            }
          }
          return { cells, color };
        }
      }
    }
    return null;
  }

  /** Find 3+ consecutive same-color full rows */
  private findLineMatch(): { rows: number[]; cosmicWipe: boolean } | null {
    const fullRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].every(c => c !== null)) fullRows.push(r);
    }
    if (fullRows.length === 0) return null;

    const rowDominant = (row: number): number => {
      const colors = this.grid[row].filter(c => c !== null).map(c => c!.color);
      return this.mode(colors) || 0;
    };

    const rowsToDestroy: number[] = [];
    let i = 0;
    while (i < fullRows.length) {
      let j = i;
      while (j + 1 < fullRows.length && fullRows[j + 1] === fullRows[j] + 1) j++;
      const run = fullRows.slice(i, j + 1);
      let k = 0;
      while (k < run.length) {
        const clr = rowDominant(run[k]);
        let end = k + 1;
        while (end < run.length && rowDominant(run[end]) === clr) end++;
        const sameColorRun = run.slice(k, end);
        if (sameColorRun.length >= 3) rowsToDestroy.push(...sameColorRun);
        k = end;
      }
      i = j + 1;
    }

    if (rowsToDestroy.length === 0) return null;

    const totalCombo = this.combo + rowsToDestroy.length;
    return { rows: rowsToDestroy, cosmicWipe: totalCombo >= 5 };
  }

  /** Implosion VFX for 4x4 block with chain escalation */
  private blockImplosionVFX(cells: [number, number][], color: number, chainStep: number) {
    const scale = 1 + chainStep * 0.5;
    let sumX = 0, sumY = 0;
    for (const [r, c] of cells) {
      sumX += this.offsetX + c * CELL + CELL / 2;
      sumY += this.offsetY + r * CELL + CELL / 2;
    }
    const cx = sumX / cells.length;
    const cy = sumY / cells.length;

    // Inward-rushing ring
    const ringCount = Math.floor(40 * scale);
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const dist = 80 + Math.random() * 50;
      this.particles.push({
        x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * (4 + Math.random() * 3),
        vy: -Math.sin(angle) * (4 + Math.random() * 3),
        life: 25 + Math.random() * 10, maxLife: 35,
        color, size: (3 + Math.random() * 3) * Math.min(scale, 2),
      });
    }

    // Central cube burst
    const burstCount = Math.floor(30 * scale);
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1 + Math.random() * 2) * Math.min(scale, 1.5);
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 15, maxLife: 35,
        color: 0xffffff, size: (2 + Math.random() * 4) * Math.min(scale, 2),
      });
    }

    // Per-cell inward sparks
    for (const [r, c] of cells) {
      const px = this.offsetX + c * CELL + CELL / 2;
      const py = this.offsetY + r * CELL + CELL / 2;
      const dirX = cx - px, dirY = cy - py;
      const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: px, y: py,
          vx: (dirX / len) * (3 + Math.random() * 2) + (Math.random() - 0.5),
          vy: (dirY / len) * (3 + Math.random() * 2) + (Math.random() - 0.5),
          life: 18 + Math.random() * 12, maxLife: 30,
          color, size: 2 + Math.random() * 2,
        });
      }
    }

    this.shakeAmount = Math.min(6 * (1 + chainStep * 0.4), 20);
    this.flashAlpha = Math.min(0.25 * (1 + chainStep * 0.3), 0.9);
    this.slowMo = true;
    this.slowMoTimer = 20 + chainStep * 10;
  }

  /** Line destruction VFX with chain escalation */
  private lineDestroyVFX(rows: number[], chainStep: number) {
    const scale = 1 + chainStep * 0.5;
    for (const row of rows) {
      for (let c = 0; c < COLS; c++) {
        const orb = this.grid[row][c];
        const px = this.offsetX + c * CELL + CELL / 2;
        const py = this.offsetY + row * CELL + CELL / 2;
        const clr = orb?.color || 0xffffff;
        const pCount = Math.floor(8 * scale);
        for (let pi = 0; pi < pCount; pi++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 5;
          this.particles.push({ x: px, y: py, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, life: 45 + Math.random() * 25, maxLife: 70, color: clr, size: 3 + Math.random() * 3 });
        }
        for (let pi = 0; pi < 4; pi++) {
          this.particles.push({ x: px, y: py, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 2, life: 30, maxLife: 30, color: 0xffffff, size: 1.5 + Math.random() * 2 });
        }
      }
    }
    this.shakeAmount = Math.min(5 * (1 + chainStep * 0.4), 20);
    this.flashAlpha = Math.min(0.4 * (1 + chainStep * 0.3), 0.9);
    this.slowMo = true;
    this.slowMoTimer = 35 + chainStep * 10;
  }

  /** Cosmic wipe VFX (5-line combo) with chain escalation */
  private cosmicWipeVFX(chainStep: number) {
    const scale = 1 + chainStep * 0.3;
    this.shakeAmount = Math.min(18 * scale, 30);
    this.flashAlpha = Math.min(0.8 * scale, 1);
    const cx = this.offsetX + (COLS * CELL) / 2;
    const cy = this.offsetY + (ROWS * CELL) / 2;
    const pCount = Math.floor(150 * scale);
    for (let pi = 0; pi < pCount; pi++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 10;
      this.particles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 70 + Math.random() * 50, maxLife: 120, color: [0xffdd00, 0xff3344, 0x3388ff, 0xffffff][Math.floor(Math.random() * 4)], size: 4 + Math.random() * 6 });
    }
    for (let pi = 0; pi < 60; pi++) {
      const angle = (pi / 60) * Math.PI * 2;
      const dist = 150 + Math.random() * 100;
      this.particles.push({ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, vx: -Math.cos(angle) * 4, vy: -Math.sin(angle) * 4, life: 40, maxLife: 40, color: 0xffffff, size: 2 + Math.random() * 3 });
    }
    this.slowMo = true;
    this.slowMoTimer = 50 + chainStep * 10;
  }

  /** Reorganize destroyed 4x4 block orbs into new small connected formations */
  private reorganizeOrbs(destroyedCells: [number, number][], color: number) {
    // Clear destroyed cells
    for (const [r, c] of destroyedCells) {
      this.grid[r][c] = null;
    }

    // We have 16 orbs to redistribute. Create small formations (2-4 orbs each)
    let remaining = 16;
    const smallShapes: [number, number][][] = [
      [[0,0],[0,1]],              // horizontal pair
      [[0,0],[1,0]],              // vertical pair
      [[0,0],[0,1],[1,0]],        // L trio
      [[0,0],[0,1],[0,2]],        // horizontal triple
      [[0,0],[1,0],[2,0]],        // vertical triple
      [[0,0],[0,1],[1,1]],        // bent trio
    ];

    // Determine the column range of the destroyed block
    let minCol = COLS, maxCol = 0, maxRow = 0;
    for (const [r, c] of destroyedCells) {
      if (c < minCol) minCol = c;
      if (c > maxCol) maxCol = c;
      if (r > maxRow) maxRow = r;
    }

    // Try to place small formations in empty cells near the original area
    const placedCells: [number, number][] = [];
    let attempts = 0;
    while (remaining > 0 && attempts < 100) {
      attempts++;
      // Pick a random small shape
      const shape = smallShapes[Math.floor(Math.random() * smallShapes.length)];
      if (shape.length > remaining) continue;

      // Try random positions near the destroyed area
      const tryCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 3)) - 1;
      const tryRow = Math.floor(Math.random() * ROWS);

      // Check if shape fits
      let fits = true;
      const positions: [number, number][] = [];
      for (const [dr, dc] of shape) {
        const nr = tryRow + dr;
        const nc = tryCol + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || this.grid[nr][nc] !== null) {
          fits = false;
          break;
        }
        positions.push([nr, nc]);
      }

      if (fits) {
        for (const [pr, pc] of positions) {
          this.grid[pr][pc] = {
            color,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmp: 3 + Math.random() * 2,
            glowPulse: Math.random() * Math.PI * 2,
            landBounce: -4 - Math.random() * 3,
            landBounceVel: 0,
          };
          placedCells.push([pr, pc]);
          remaining--;
        }
      }
    }
    // Any remaining orbs that couldn't be placed just disappear (prevents gridlock)

    // Burst VFX: orbs flying outward from center then settling
    const cx = this.offsetX + ((minCol + maxCol) / 2) * CELL + CELL / 2;
    const cy = this.offsetY + (maxRow - 2) * CELL + CELL / 2;
    for (const [pr, pc] of placedCells) {
      const px = this.offsetX + pc * CELL + CELL / 2;
      const py = this.offsetY + pr * CELL + CELL / 2;
      for (let i = 0; i < 3; i++) {
        const angle = Math.atan2(py - cy, px - cx) + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 3;
        this.particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 20 + Math.random() * 10, maxLife: 30,
          color, size: 2 + Math.random() * 2,
        });
      }
    }
  }

  /** Pull all orbs down to fill gaps column by column */
  private gravityCollapse() {
    for (let c = 0; c < COLS; c++) {
      let writeRow = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (r !== writeRow) {
            this.grid[writeRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            // Add landing bounce to collapsed orbs
            this.grid[writeRow][c]!.landBounce = -3 - Math.random() * 2;
            this.grid[writeRow][c]!.landBounceVel = 0;
          }
          writeRow--;
        }
      }
    }
  }
  }

  private mode(arr: number[]): number | null {
    const freq: Record<number, number> = {};
    let max = 0; let best: number | null = null;
    for (const v of arr) {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > max) { max = freq[v]; best = v; }
    }
    return best;
  }

  private emitHUD() {
    gameEvents.emit('hud', { score: this.score, level: this.level, combo: this.combo });
  }

  update(_time: number, delta: number) {
    if (this.gameOver || this.paused) {
      this.drawAll();
      return;
    }

    const dt = this.slowMo ? delta * 0.3 : delta;
    this.globalTime += delta * 0.001;

    if (this.slowMo) {
      this.slowMoTimer--;
      if (this.slowMoTimer <= 0) this.slowMo = false;
    }

    // Bounce physics (spring)
    this.bounceOffset += this.bounceVel;
    this.bounceVel += -this.bounceOffset * 0.3;
    this.bounceVel *= 0.85;
    if (Math.abs(this.bounceOffset) < 0.05 && Math.abs(this.bounceVel) < 0.05) {
      this.bounceOffset = 0;
      this.bounceVel = 0;
    }

    // Snap scale decay
    if (this.snapScale > 1) {
      this.snapScale = 1 + (this.snapScale - 1) * 0.85;
      if (this.snapScale < 1.005) this.snapScale = 1;
    }

    // --- Per-orb loosening physics ---
    this.fallAge += delta * 0.001;
    const LOOSEN_DURATION = 5.0; // seconds to reach full looseness
    const RIGID_PHASE = 1.5;     // seconds of fully rigid formation at spawn
    const rawLooseness = Math.max(0, (this.fallAge - RIGID_PHASE) / (LOOSEN_DURATION - RIGID_PHASE));
    // Smoothstep easing for gradual onset
    const clamped = Math.min(rawLooseness, 1);
    const looseness = clamped * clamped * (3 - 2 * clamped);

    for (const orb of this.fallingOrbs) {
      orb.phase += delta * 0.005;

      // Spring force pulling orb back to its grid slot — weakens with looseness
      const springStrength = 0.08 * (1 - looseness * 0.85);
      orb.vx += -orb.dx * springStrength;
      orb.vy += -orb.dy * springStrength;

      // Individual micro-gravity: each orb drifts down at its own rate
      const orbGravity = 0.02 * looseness * orb.weight;
      orb.vy += orbGravity;

      // Organic wobble — increases with looseness
      const wobbleAmt = looseness * 0.15;
      orb.vx += Math.sin(orb.phase * 2.1 + orb.weight * 10) * wobbleAmt;
      orb.vy += Math.cos(orb.phase * 1.7) * wobbleAmt * 0.5;

      // Random micro-impulses (subtle)
      orb.vx += (Math.random() - 0.5) * 0.03 * looseness;
      orb.vy += (Math.random() - 0.5) * 0.02 * looseness;

      // Damping
      orb.vx *= 0.86;
      orb.vy *= 0.86;

      orb.dx += orb.vx;
      orb.dy += orb.vy;

      // Soft collision boundaries — max drift increases with looseness
      const maxDrift = 2 + looseness * 8; // 2px tight → 10px loose
      if (Math.abs(orb.dx) > maxDrift) { orb.dx = Math.sign(orb.dx) * maxDrift; orb.vx *= -0.5; }
      if (Math.abs(orb.dy) > maxDrift) { orb.dy = Math.sign(orb.dy) * maxDrift; orb.vy *= -0.4; }
    }

    // Landing bounce for placed orbs
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const orb = this.grid[r][c];
        if (orb && orb.landBounce !== 0) {
          orb.landBounceVel += -orb.landBounce * 0.2;
          orb.landBounceVel *= 0.80;
          orb.landBounce += orb.landBounceVel;
          if (Math.abs(orb.landBounce) < 0.1 && Math.abs(orb.landBounceVel) < 0.1) {
            orb.landBounce = 0;
            orb.landBounceVel = 0;
          }
        }
      }
    }

    // Moon gravity free fall
    if (this.activePiece) {
      const levelBoost = 1 + (this.level - 1) * 0.025; // very gentle scaling
      this.fallSpeed = Math.min(this.fallSpeed + this.GRAVITY * levelBoost, this.MAX_FALL_SPEED);
      this.fallSpeed *= 0.992; // drag for floaty feel
      this.fallAccum += this.fallSpeed;

      while (this.fallAccum >= 1) {
        this.fallAccum -= 1;
        const test = { ...this.activePiece, row: this.activePiece.row + 1 };
        if (this.isValid(test)) {
          this.activePiece = test;
        } else {
          this.fallAccum = 0;
          this.lockPiece();
          break;
        }
      }
    }

    // Shake decay
    if (this.shakeAmount > 0) this.shakeAmount *= 0.88;
    if (this.shakeAmount < 0.1) this.shakeAmount = 0;

    // Flash decay
    if (this.flashAlpha > 0) this.flashAlpha *= 0.92;
    if (this.flashAlpha < 0.01) this.flashAlpha = 0;

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // lighter particle gravity too
      p.vx *= 0.99;
      p.life--;
      return p.life > 0;
    });

    this.nebulaTime += dt * 0.001;
    this.drawAll();
  }

  private drawOrb(g: Phaser.GameObjects.Graphics, cx: number, cy: number, radius: number, color: number, alpha: number, phase: number) {
    g.fillStyle(color, alpha * 0.15);
    g.fillCircle(cx, cy, radius * 1.6);
    g.fillStyle(color, alpha * 0.25);
    g.fillCircle(cx, cy, radius * 1.3);
    g.fillStyle(color, alpha * 0.85);
    g.fillCircle(cx, cy, radius);
    const hlX = cx - radius * 0.25;
    const hlY = cy - radius * 0.3 + Math.sin(phase) * 1.5;
    g.fillStyle(0xffffff, alpha * 0.35);
    g.fillCircle(hlX, hlY, radius * 0.4);
    g.fillStyle(0xffffff, alpha * 0.5);
    g.fillCircle(cx - radius * 0.15, cy - radius * 0.35, radius * 0.15);
  }

  private drawAll() {
    const w = this.scale.width;
    const h = this.scale.height;
    const shakeX = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount * 2 : 0;
    const shakeY = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount * 2 : 0;

    // === BACKGROUND ===
    this.gridGraphics.clear();
    this.gridGraphics.fillStyle(0x030812, 1);
    this.gridGraphics.fillRect(0, 0, w, h);

    const nebAlpha = 0.06 + Math.sin(this.nebulaTime) * 0.02;
    this.gridGraphics.fillStyle(0x220066, nebAlpha);
    this.gridGraphics.fillCircle(w * 0.3 + Math.sin(this.nebulaTime * 0.7) * 40, h * 0.4, 220);
    this.gridGraphics.fillStyle(0x003366, nebAlpha);
    this.gridGraphics.fillCircle(w * 0.7 + Math.cos(this.nebulaTime * 0.5) * 30, h * 0.6, 190);
    this.gridGraphics.fillStyle(0x660033, nebAlpha * 0.6);
    this.gridGraphics.fillCircle(w * 0.5, h * 0.2 + Math.sin(this.nebulaTime * 0.9) * 20, 160);

    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      const twinkle = 0.5 + Math.sin(this.nebulaTime * 3 + s.x) * 0.5;
      this.gridGraphics.fillStyle(0xffffff, s.alpha * twinkle);
      this.gridGraphics.fillCircle(s.x, s.y, 1);
    }

    const ox = this.offsetX + shakeX;
    const oy = this.offsetY + shakeY;

    // Grid background
    this.gridGraphics.fillStyle(0x060c1a, 0.65);
    this.gridGraphics.fillRect(ox, oy, COLS * CELL, ROWS * CELL);

    this.gridGraphics.lineStyle(1, 0x1a2244, 0.2);
    for (let r = 0; r <= ROWS; r++) {
      this.gridGraphics.lineBetween(ox, oy + r * CELL, ox + COLS * CELL, oy + r * CELL);
    }
    for (let c = 0; c <= COLS; c++) {
      this.gridGraphics.lineBetween(ox + c * CELL, oy, ox + c * CELL, oy + ROWS * CELL);
    }

    this.gridGraphics.lineStyle(2, 0x2244aa, 0.4);
    this.gridGraphics.strokeRect(ox, oy, COLS * CELL, ROWS * CELL);

    // === PLACED ORBS ===
    const orbRadius = CELL * 0.42;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const orb = this.grid[r][c];
        if (orb) {
          const wobble = Math.sin(this.globalTime * 2.5 + orb.wobblePhase) * orb.wobbleAmp * 0.3;
          const px = ox + c * CELL + CELL / 2;
          const py = oy + r * CELL + CELL / 2 + wobble + orb.landBounce;
          const glowPulse = 0.85 + Math.sin(this.globalTime * 1.8 + orb.glowPulse) * 0.15;
          this.drawOrb(this.gridGraphics, px, py, orbRadius * this.snapScale, orb.color, glowPulse, this.globalTime * 2 + orb.wobblePhase);
        }
      }
    }

    // === ACTIVE PIECE ===
    this.pieceGraphics.clear();
    if (this.activePiece && !this.gameOver) {
      const cells = this.getCells(this.activePiece);
      const clr = this.activePiece.def.color;

      // Ghost (drop preview)
      let ghostRow = this.activePiece.row;
      while (true) {
        const test = { ...this.activePiece, row: ghostRow + 1 };
        if (this.isValid(test)) ghostRow++;
        else break;
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

      // Looseness for visual: connection lines fade as orbs decouple
      const looseness = Math.min(this.fallAge / 3.0, 1);

      // Active orbs with per-orb physics offsets
      for (let i = 0; i < cells.length; i++) {
        const [r, c] = cells[i];
        const fo = this.fallingOrbs[i] || { dx: 0, dy: 0 };
        const px = ox + (this.activePiece.col + c) * CELL + CELL / 2 + this.bounceOffset + fo.dx;
        const py = oy + (this.activePiece.row + r) * CELL + CELL / 2 + fo.dy;
        this.drawOrb(this.pieceGraphics, px, py, orbRadius, clr, 1, this.globalTime * 3 + fo.dx);
      }

      // Connection lines — fade out as formation loosens
      if (cells.length > 1) {
        const linkAlpha = 0.35 * (1 - looseness * 0.7);
        this.pieceGraphics.lineStyle(1.5, clr, linkAlpha);
        for (let i = 0; i < cells.length - 1; i++) {
          const [r1, c1] = cells[i];
          const [r2, c2] = cells[i + 1];
          const j1 = this.fallingOrbs[i] || { dx: 0, dy: 0 };
          const j2 = this.fallingOrbs[i + 1] || { dx: 0, dy: 0 };
          const x1 = ox + (this.activePiece.col + c1) * CELL + CELL / 2 + this.bounceOffset + j1.dx;
          const y1 = oy + (this.activePiece.row + r1) * CELL + CELL / 2 + j1.dy;
          const x2 = ox + (this.activePiece.col + c2) * CELL + CELL / 2 + this.bounceOffset + j2.dx;
          const y2 = oy + (this.activePiece.row + r2) * CELL + CELL / 2 + j2.dy;
          this.pieceGraphics.lineBetween(x1, y1, x2, y2);
        }
      }
    }

    // === PARTICLES ===
    this.vfxGraphics.clear();
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const alpha = Math.min(1, t * 2);
      const sz = p.size * t;
      this.vfxGraphics.fillStyle(p.color, alpha * 0.3);
      this.vfxGraphics.fillCircle(p.x + shakeX, p.y + shakeY, sz * 2);
      this.vfxGraphics.fillStyle(p.color, alpha);
      this.vfxGraphics.fillCircle(p.x + shakeX, p.y + shakeY, sz);
    }

    // === FLASH OVERLAY ===
    if (this.flashAlpha > 0) {
      this.vfxGraphics.fillStyle(0xffffff, this.flashAlpha);
      this.vfxGraphics.fillRect(0, 0, w, h);
    }
  }
}
