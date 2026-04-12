/**
 * events.ts — Global event bus (Phaser ↔ React bridge)
 *
 * Singleton EventEmitter shared between the Phaser GameScene and
 * React HUD/menu components. All game-to-UI communication flows
 * through this bus.
 *
 * Events emitted:
 *   'hud'              → { score, level, combo, elapsed, urgency }
 *   'nextPiece'        → PieceDef (preview for next piece display)
 *   'gameover'         → score (number)
 *   'matchEnd'         → MatchData (full stats for logging)
 *   'chainCombo'       → chainStep (number)
 *   'triColor'         → chainStep (number)
 *   'elementalCascade' → chainStep (number)
 *   'pause'            → isPaused (boolean)
 *   'restart'          → void (triggers game reset)
 */
import Phaser from 'phaser';

export const gameEvents = new Phaser.Events.EventEmitter();
