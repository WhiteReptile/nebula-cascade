# Autonomous Safe-Fix Pass

Goal: fix everything I can without touching marketplace V3 or Google sign-in. No UI redesigns. No folder restructuring. Behavior preserved except for the one bug fix you approved (energy reset).

---

## 1. Energy: true rolling 24h reset (behavior fix)

**Schema migration** on `card_energy`:
- Backfill `next_reset_at` where null: `now() + interval '24 hours'`.
- Keep `last_reset_at` for backwards compat but stop relying on it for the gate.

**Code (`src/lib/energySystem.ts`)**:
- `getCardEnergy()` → if `now() >= next_reset_at`, refill to `max_energy` and set `next_reset_at = now() + 24h`.
- `consumeCardEnergy()` → on first consume after a full refill, ensure `next_reset_at` is set (covers legacy rows).
- `initCardEnergy()` → set `next_reset_at = now() + 24h` on insert.
- Add comment block explaining the rolling-window economy rule.

Same `ENERGY_PER_CARD` (2) and 40% double-consume roll are untouched.

## 2. GameScene constants → `src/config/gameConfig.ts`

Lift these inlined values from `src/game/GameScene.ts` into `gameConfig.ts → PACING` / `SCORING` (values identical, zero behavior change):
- `BASE_GRAVITY` (0.005), `MAX_FALL_SPEED` (0.09)
- Level boost step (`score / 2000`, `+4.5%/level`)
- Urgency threshold (40s) + per-second ramp (5%)
- Match cooldown (60s) referenced in edge fn

Import sites updated; no UI change.

## 3. Edge function hardening

Both `generate-session` and `submit-score`:
- Add Zod-style input validation (manual, no new deps) → 400 on bad payload.
- Ensure `corsHeaders` is included on every error response (audit pass).
- No logic changes to anti-cheat or cooldown.

Deploy after edit; smoke-test via `curl_edge_functions` as the preview user.

## 4. Pending Config Migration cleanup

From `docs/DEVELOPER_HANDOFF.md`:
- ✅ `energySystem.ts` rolling-24h — fixed in step 1.
- ✅ `GameScene.ts` PACING/SCORING — fixed in step 2.
- ⏭ `pieces.ts COLS/ROWS/CELL` — leave (touches every Phaser scene; risky).
- ⏭ `NFTGrid.tsx` page-size — leave (marketplace, you own it).
- ⏭ Marketing copy "3%"/"40-day" — leave (editorial).

Handoff doc updated to reflect what shipped.

## 5. Light polish (safe)

- Add `ErrorBoundary` around the Phaser canvas mount so a scene crash doesn't blank the whole app.
- Remove stray `console.log` debug noise (≤8 occurrences) — keep `console.warn/error`.
- Add `<title>` + meta description on `index.html` if missing (SEO).
- Add `lang="en"` check.

## 6. Tests

Add unit tests for pure economy math (no DB):
- `cardSystem` reward split (main 100% / secondary 20%).
- `marketplaceSystem` fee math (3%).
- `divisionSystem` tier boundaries.

Run `vitest` + build.

## 7. Verification

- `bun run build` (typecheck).
- Vitest pass.
- Curl both edge functions, verify 200 happy + 400 invalid.
- Manual: load `/`, start a game, end a game, confirm energy column updates correctly.

## Out of scope (explicitly not touching)

- Marketplace V3 / Thirdweb on-chain listings — yours.
- Google OAuth wiring — yours.
- Any visual redesign, layout, color, or HUD changes.
- `src/integrations/supabase/*` (auto-generated).
- `pieces.ts` board constants.

## Files I expect to change

- `supabase/migrations/<new>.sql` (energy)
- `src/lib/energySystem.ts`
- `src/game/GameScene.ts`
- `src/config/gameConfig.ts`
- `supabase/functions/generate-session/index.ts`
- `supabase/functions/submit-score/index.ts`
- `src/components/ErrorBoundary.tsx` (new, if not present)
- `src/pages/Index.tsx` or wherever the canvas mounts (wrap)
- `index.html` (meta only, if needed)
- `docs/DEVELOPER_HANDOFF.md`
- `src/test/*.test.ts` (new pure-math tests)

No other files touched. No questions for you — approve and I'll execute.
