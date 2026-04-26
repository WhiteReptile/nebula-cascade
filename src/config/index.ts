/**
 * config/index.ts — Barrel export for all tunable configuration
 *
 * Import from here instead of individual files when you need multiple
 * groups: `import { SCORING, ENERGY } from '@/config';`
 */
export * from './gameConfig';
export * from './economyConfig';
export * from './web3Config';
