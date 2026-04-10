import Phaser from 'phaser';
import { PIECES, COLS, ROWS, CELL, PieceDef } from './pieces';

// Event bus for React HUD
export const gameEvents = new Phaser.Events.EventEmitter();

interface ActivePiece {
  def: PieceDef;
  rotation: number;
  row: number;
  col: number;
}

export class GameScene extends Phaser.Scene {
  private grid: (number | null)[][] = [];
  private gridColors: (number | null)[][] = [];
  private activePiece: ActivePiece | null = null;
  private nextPieceDef: PieceDef | null = null;
  private dropTimer = 0;
  private dropInterval = 800;
  private score = 0;
  private level = 1;
  private combo = 0;
  private gameOver = false;
  private paused = false;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pieceGraphics!: Phaser.GameObjects.Graphics;
  private vfxGraphics!: Phaser.GameObjects.Graphics;
  private stars: { x: number; y: number; speed: number; alpha: number }[] = [];
  private nebulaTime = 0;
  private offsetX = 0;
  private offsetY = 0;
  private particles: { x: number; y: number; vx: number; vy: number; life: number; color: number; size: number }[] = [];
  private shakeAmount = 0;
  private slowMo = false;
  private slowMoTimer = 0;
  private clearingRows: { row: number; timer: number; color: number }[] = [];
  private forceDropTrail: { x: number; y: number; alpha: number }[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.offsetX = Math.floor((w - COLS * CELL) / 2);
    this.offsetY = Math.floor((h - ROWS * CELL) / 2);

    // Stars
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
    this.input.keyboard?.on('keydown-LEFT', () => this.moveActive(0, -1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveActive(0, 1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveActive(1, 0));
    this.input.keyboard?.on('keydown-UP', () => this.rotateActive());
    this.input.keyboard?.on('keydown-Z', () => this.forceDrop());
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.paused = !this.paused;
      gameEvents.emit('pause', this.paused);
    });

    gameEvents.on('restart', () => this.resetGame());
  }

  private resetGame() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.gridColors = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.dropInterval = 800;
    this.gameOver = false;
    this.paused = false;
    this.particles = [];
    this.clearingRows = [];
    this.shakeAmount = 0;
    this.nextPieceDef = this.randomPiece();
    this.spawnPiece();
    this.emitHUD();
  }

  private randomPiece(): PieceDef {
    return PIECES[Math.floor(Math.random() * PIECES.length)];
  }

  private spawnPiece() {
    const def = this.nextPieceDef || this.randomPiece();
    this.nextPieceDef = this.randomPiece();
    this.activePiece = { def, rotation: 0, row: 0, col: Math.floor(COLS / 2) - 1 };
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
    }
  }

  private rotateActive() {
    if (!this.activePiece || this.gameOver || this.paused) return;
    const test = { ...this.activePiece, rotation: (this.activePiece.rotation + 1) % 4 };
    if (this.isValid(test)) {
      this.activePiece = test;
    } else {
      // Wall kick attempts
      for (const offset of [-1, 1, -2, 2]) {
        const kicked = { ...test, col: test.col + offset };
        if (this.isValid(kicked)) {
          this.activePiece = kicked;
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
    // Score bonus for force drop
    this.score += dropDist * 5;

    // VFX: shockwave particles at landing
    const cells = this.getCells(this.activePiece);
    for (const [r, c] of cells) {
      const px = this.offsetX + (this.activePiece.col + c) * CELL + CELL / 2;
      const py = this.offsetY + (this.activePiece.row + r) * CELL + CELL / 2;
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        this.particles.push({
          x: px, y: py,
          vx: Math.cos(angle) * (2 + Math.random() * 4),
          vy: Math.sin(angle) * (2 + Math.random() * 4),
          life: 30,
          color: this.activePiece.def.color,
          size: 2 + Math.random() * 3,
        });
      }
    }
    this.shakeAmount = 6;
    this.lockPiece();
  }

  private lockPiece() {
    if (!this.activePiece) return;
    const cells = this.getCells(this.activePiece);
    for (const [r, c] of cells) {
      const nr = this.activePiece.row + r;
      const nc = this.activePiece.col + c;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        this.grid[nr][nc] = 1;
        this.gridColors[nr][nc] = this.activePiece.def.color;
      }
    }
    this.checkLines();
    this.spawnPiece();
    this.dropTimer = 0;
    this.emitHUD();
  }

  private checkLines() {
    const fullRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].every(c => c !== null)) {
        fullRows.push(r);
      }
    }
    if (fullRows.length === 0) {
      this.combo = 0;
      return;
    }

    this.combo += fullRows.length;

    // Check color energy: if 3+ lines share same dominant color
    const colorCounts: Record<number, number> = {};
    for (const row of fullRows) {
      const colors = this.gridColors[row].filter(c => c !== null) as number[];
      const dominant = this.mode(colors);
      if (dominant !== null) {
        colorCounts[dominant] = (colorCounts[dominant] || 0) + 1;
      }
    }

    let colorEnergy = false;
    for (const count of Object.values(colorCounts)) {
      if (count >= 3) colorEnergy = true;
    }

    // Spawn particles for cleared rows
    for (const row of fullRows) {
      for (let c = 0; c < COLS; c++) {
        const px = this.offsetX + c * CELL + CELL / 2;
        const py = this.offsetY + row * CELL + CELL / 2;
        const clr = this.gridColors[row][c] || 0xffffff;
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: px, y: py,
            vx: (Math.random() - 0.5) * 6,
            vy: -2 - Math.random() * 4,
            life: 40 + Math.random() * 20,
            color: clr,
            size: 2 + Math.random() * 2,
          });
        }
      }
    }

    if (colorEnergy) {
      // Slow-mo effect
      this.slowMo = true;
      this.slowMoTimer = 30;
      this.shakeAmount = 4;
    }

    // Cosmic Chain: 5+ combo
    if (this.combo >= 5) {
      // Wipe entire field!
      this.score += 5000 * this.level;
      this.shakeAmount = 15;

      // Massive explosion particles from center
      const cx = this.offsetX + (COLS * CELL) / 2;
      const cy = this.offsetY + (ROWS * CELL) / 2;
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        this.particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60 + Math.random() * 40,
          color: [0x00ffff, 0xff00ff, 0x00ff88, 0xffdd00][Math.floor(Math.random() * 4)],
          size: 3 + Math.random() * 5,
        });
      }

      // Clear entire field
      this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
      this.gridColors = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
      this.combo = 0;
      this.slowMo = true;
      this.slowMoTimer = 45;
    } else {
      // Normal clear
      const points = fullRows.length * fullRows.length * 100 * this.level;
      this.score += points;

      // Remove rows top to bottom
      for (const row of fullRows.sort((a, b) => a - b)) {
        this.grid.splice(row, 1);
        this.gridColors.splice(row, 1);
        this.grid.unshift(Array(COLS).fill(null));
        this.gridColors.unshift(Array(COLS).fill(null));
      }
    }

    // Level up
    this.level = Math.floor(this.score / 2000) + 1;
    this.dropInterval = Math.max(100, 800 - (this.level - 1) * 60);
    this.emitHUD();
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

    // Slow-mo timer
    if (this.slowMo) {
      this.slowMoTimer--;
      if (this.slowMoTimer <= 0) this.slowMo = false;
    }

    // Drop
    this.dropTimer += dt;
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      if (this.activePiece) {
        const test = { ...this.activePiece, row: this.activePiece.row + 1 };
        if (this.isValid(test)) {
          this.activePiece = test;
        } else {
          this.lockPiece();
        }
      }
    }

    // Shake decay
    if (this.shakeAmount > 0) this.shakeAmount *= 0.9;
    if (this.shakeAmount < 0.1) this.shakeAmount = 0;

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      return p.life > 0;
    });

    this.nebulaTime += dt * 0.001;

    this.drawAll();
  }

  private drawAll() {
    const w = this.scale.width;
    const h = this.scale.height;
    const shakeX = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount * 2 : 0;
    const shakeY = this.shakeAmount ? (Math.random() - 0.5) * this.shakeAmount * 2 : 0;

    // Background
    this.gridGraphics.clear();
    // Deep space gradient
    this.gridGraphics.fillStyle(0x050510, 1);
    this.gridGraphics.fillRect(0, 0, w, h);

    // Nebula blobs
    const nebAlpha = 0.08 + Math.sin(this.nebulaTime) * 0.03;
    this.gridGraphics.fillStyle(0x4400aa, nebAlpha);
    this.gridGraphics.fillCircle(w * 0.3 + Math.sin(this.nebulaTime * 0.7) * 40, h * 0.4, 200);
    this.gridGraphics.fillStyle(0x0044aa, nebAlpha);
    this.gridGraphics.fillCircle(w * 0.7 + Math.cos(this.nebulaTime * 0.5) * 30, h * 0.6, 180);
    this.gridGraphics.fillStyle(0xaa0066, nebAlpha * 0.7);
    this.gridGraphics.fillCircle(w * 0.5, h * 0.2 + Math.sin(this.nebulaTime * 0.9) * 20, 150);

    // Stars
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
    this.gridGraphics.fillStyle(0x0a0a20, 0.7);
    this.gridGraphics.fillRect(ox, oy, COLS * CELL, ROWS * CELL);

    // Grid lines
    this.gridGraphics.lineStyle(1, 0x222255, 0.3);
    for (let r = 0; r <= ROWS; r++) {
      this.gridGraphics.lineBetween(ox, oy + r * CELL, ox + COLS * CELL, oy + r * CELL);
    }
    for (let c = 0; c <= COLS; c++) {
      this.gridGraphics.lineBetween(ox + c * CELL, oy, ox + c * CELL, oy + ROWS * CELL);
    }

    // Grid border glow
    this.gridGraphics.lineStyle(2, 0x4444aa, 0.6);
    this.gridGraphics.strokeRect(ox, oy, COLS * CELL, ROWS * CELL);

    // Placed blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] !== null) {
          const clr = this.gridColors[r][c] || 0xffffff;
          this.gridGraphics.fillStyle(clr, 0.8);
          this.gridGraphics.fillRect(ox + c * CELL + 1, oy + r * CELL + 1, CELL - 2, CELL - 2);
          // Inner glow
          this.gridGraphics.lineStyle(1, clr, 0.4);
          this.gridGraphics.strokeRect(ox + c * CELL + 3, oy + r * CELL + 3, CELL - 6, CELL - 6);
        }
      }
    }

    // Active piece
    this.pieceGraphics.clear();
    if (this.activePiece && !this.gameOver) {
      const cells = this.getCells(this.activePiece);
      const clr = this.activePiece.def.color;

      // Ghost piece (drop preview)
      let ghostRow = this.activePiece.row;
      while (true) {
        const test = { ...this.activePiece, row: ghostRow + 1 };
        if (this.isValid(test)) ghostRow++;
        else break;
      }
      if (ghostRow !== this.activePiece.row) {
        for (const [r, c] of cells) {
          this.pieceGraphics.fillStyle(clr, 0.15);
          this.pieceGraphics.fillRect(
            ox + (this.activePiece.col + c) * CELL + 1,
            oy + (ghostRow + r) * CELL + 1,
            CELL - 2, CELL - 2
          );
          this.pieceGraphics.lineStyle(1, clr, 0.3);
          this.pieceGraphics.strokeRect(
            ox + (this.activePiece.col + c) * CELL + 1,
            oy + (ghostRow + r) * CELL + 1,
            CELL - 2, CELL - 2
          );
        }
      }

      // Active piece with glow
      for (const [r, c] of cells) {
        const px = ox + (this.activePiece.col + c) * CELL;
        const py = oy + (this.activePiece.row + r) * CELL;
        // Outer glow
        this.pieceGraphics.fillStyle(clr, 0.2);
        this.pieceGraphics.fillRect(px - 2, py - 2, CELL + 4, CELL + 4);
        // Block
        this.pieceGraphics.fillStyle(clr, 0.9);
        this.pieceGraphics.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        // Inner highlight
        this.pieceGraphics.fillStyle(0xffffff, 0.15);
        this.pieceGraphics.fillRect(px + 3, py + 3, CELL / 2 - 2, 3);
      }
    }

    // Particles
    this.vfxGraphics.clear();
    for (const p of this.particles) {
      const alpha = Math.min(1, p.life / 20);
      this.vfxGraphics.fillStyle(p.color, alpha);
      this.vfxGraphics.fillCircle(p.x + shakeX, p.y + shakeY, p.size * (p.life / 40));
    }
  }
}
