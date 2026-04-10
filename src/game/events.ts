import Phaser from 'phaser';

// Event bus for React HUD — shared singleton
export const gameEvents = new Phaser.Events.EventEmitter();
