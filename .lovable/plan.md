

# Codebase Organization Plan

## Current Issues

- **GameScene.ts is 1,348 lines** — mixes game logic, VFX particles, orb rendering, background drawing, asteroid borders, spacecraft, and chain resolution into one class
- **App.css** contains leftover Vite boilerplate (logo spin, `.read-the-docs`) that isn't used
- **No authentication UI** — the leaderboard and rewards system require login, but there's no sign-up/login page
- **Flat file structure** — game components, lib utilities, and pages are loosely organized with no clear grouping
- **GameHUD.tsx** mixes auth checks, event listeners, division loading, and rendering

## Plan

### Step 1: Split GameScene.ts into focused modules

Break the monolith into separate files under `src/game/`:

| New File | Responsibility | ~Lines |
|---|---|---|
| `src/game/rendering/background.ts` | Nebulae, stars, shooting stars, spacecraft, asteroid border drawing | ~200 |
| `src/game/rendering/orbRenderer.ts` | `drawOrb()` with all 5 elemental styles | ~110 |
| `src/game/rendering/vfx.ts` | Particle system, block implosion, tri-color fusion, line destroy, cosmic wipe VFX | ~220 |
| `src/game/logic/chainResolver.ts` | `resolveChains()`, `findBlockMatch()`, `findTriColorMatch()`, `findLineMatch()`, chain multiplier | ~200 |
| `src/game/logic/orbReorganizer.ts` | `reorganizeOrbs()`, `gravityCollapse()` | ~100 |
| `src/game/logic/fallingPhysics.ts` | Per-orb loosening physics, moon gravity fall loop | ~80 |
| `src/game/types.ts` | Shared interfaces (`OrbState`, `FallingOrb`, `ActivePiece`, particle/spacecraft/star types) | ~50 |
| `src/game/GameScene.ts` | Slim orchestrator — create, input, update, drawAll composing the above modules | ~400 |

### Step 2: Clean up unused files

- Remove boilerplate from `App.css` (or delete it entirely — styles are in `index.css` and Tailwind)
- Remove unused `src/test/example.test.ts` placeholder if empty

### Step 3: Add authentication page

- Create `src/pages/Auth.tsx` — sign-up/login form with email + password
- Add Google OAuth button
- Add `/auth` route in `App.tsx`
- Redirect unauthenticated users from `/admin/rewards` to `/auth`
- Show "Sign in" link in GameHUD when not logged in

### Step 4: Organize components by feature

```text
src/
├── components/
│   ├── game/
│   │   ├── CosmicGame.tsx
│   │   ├── GameHUD.tsx
│   │   └── DivisionBadge.tsx
│   ├── auth/
│   │   └── AuthForm.tsx
│   ├── layout/
│   │   └── NavLink.tsx
│   └── ui/  (unchanged)
├── game/
│   ├── GameScene.ts
│   ├── pieces.ts
│   ├── types.ts
│   ├── rendering/
│   │   ├── background.ts
│   │   ├── orbRenderer.ts
│   │   └── vfx.ts
│   └── logic/
│       ├── chainResolver.ts
│       ├── orbReorganizer.ts
│       └── fallingPhysics.ts
├── lib/
│   ├── divisionSystem.ts
│   ├── matchLogger.ts
│   ├── payoutIntegrations.ts
│   └── utils.ts
├── pages/
│   ├── Auth.tsx
│   ├── Index.tsx
│   ├── Leaderboard.tsx
│   ├── AdminRewards.tsx
│   └── NotFound.tsx
```

### Step 5: Extract GameHUD concerns

- Move auth/division loading logic into a custom hook `src/hooks/usePlayerProfile.ts`
- Keep `GameHUD.tsx` focused on rendering only

### What stays the same

- All game mechanics, scoring, difficulty, and visual effects remain identical
- Database schema and RLS policies unchanged
- All existing routes continue working
- Supabase client and types files untouched

