

# Enhanced Explosion VFX + Comic-Book Hype Text

Two coordinated upgrades: amp every destruction VFX in `src/game/rendering/vfx.ts` and add an animated comic-book overlay in the React HUD that pops on big plays.

## 1. Amplified Explosion VFX (`src/game/rendering/vfx.ts`)

Add layered effects to every explosion function, scaled by `chainStep`:

- **Shockwave ring**: new helper `addShockwaveRing()` — expanding white/colored ring particles (24 evenly-spaced fast outward particles with longer life and additive glow).
- **Energy burst core**: brighter white center burst (2× current count, larger size).
- **Debris**: heavier colored chunks with gravity + spin (reuse particle, larger size + longer life).
- **Glow trails**: spawn lingering low-velocity particles that fade slowly (additive look via existing alpha-glow draw).
- **Secondary ring** at +6 frames (delayed second pulse) for chains ≥ 2 — implemented by adding a `delay` field to `Particle` (skips physics until delay elapses).
- **Tighter screen feedback**: bump `shakeAmount`, `flashAlpha` slightly; keep slow-mo same to avoid overload.

Apply to: `blockImplosionVFX`, `triColorFusionVFX`, `lineDestroyVFX`, `cosmicWipeVFX`, `proximityBurstVFX`, `elementalCascadeVFX`. Performance guard: cap total particles at 600 (drop oldest if exceeded) inside `GameScene.update`.

Add minor `Particle.delay?: number` to `src/game/types.ts` and respect it in the particle update loop in `GameScene.ts`.

## 2. Comic-Book Hype Text Overlay

New event `gameEvents.emit('hype', { text, tier })` fired from `GameScene.resolveChains()` at key thresholds:

| Trigger | Text | Tier |
|---|---|---|
| chainStep = 2 | NICE! | 1 |
| chainStep = 3 | GREAT! | 2 |
| chainStep = 4 | EXCELLENT! | 3 |
| chainStep = 5 | UNBELIEVABLE! | 4 |
| chainStep = 6 | GOD OF PUZZLE! | 5 |
| chainStep ≥ 7 OR cosmicWipe | GOD OF NEBULA! | 6 |
| triColor match | OMNI FUSION! | 4 |
| line clear ≥ 3 rows | MEGA CLEAR! | 3 |

New component `src/components/game/HypeOverlay.tsx`:
- Listens to `gameEvents.on('hype', ...)`, queues messages, displays one at a time.
- Animation: pop-in (scale 0.3 → 1.2 → 1.0), tiny rotate jitter (-4°→+2°), 900ms hold, fade+drift up out (total ~1.4s).
- Style: heavy uppercase italic display font (Bebas Neue / system fallback `Impact`), thick white fill, 4px black outline (`text-stroke`), tier-colored glow (yellow→orange→red→magenta→cyan→rainbow gradient for tier 6), dropshadow, slight skew for comic energy. Burst halo behind text using a radial gradient div.
- Position: above the game board, `z-index: 12` (above chain combo counter), pointer-events none.
- Synced with explosion: emitted on the same frame as the VFX call, so flash/shake and pop-in coincide.

Mount `<HypeOverlay />` once in `src/components/game/GameHUD.tsx` next to the existing chain combo overlay.

## Files Touched
- `src/game/rendering/vfx.ts` — new `addShockwaveRing` helper + amplified per-VFX functions
- `src/game/types.ts` — add optional `delay` to `Particle`
- `src/game/GameScene.ts` — particle delay handling, particle cap, `hype` event emission in `resolveChains` + cosmicWipe + triColor + line branches
- `src/components/game/HypeOverlay.tsx` — new file
- `src/components/game/GameHUD.tsx` — mount `<HypeOverlay />`

No gameplay/scoring/economy changes. Performance protected by particle cap and reuse of existing draw pipeline.

