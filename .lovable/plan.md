

# Reorganize & Clean Up the Codebase

## Overview
Restructure the `src/components/` and `src/game/` directories into clear, logical folders so any developer (or Lovable) can navigate the project easily. No functional changes — purely organizational.

## Current State
Everything in `src/components/` is flat: MainMenu, GameHUD, CosmicGame, DivisionBadge, WalletConnect, NavLink all sit alongside the `ui/` folder. Game logic is already well-structured under `src/game/`.

## Proposed Structure

```text
src/
├── components/
│   ├── game/                    # Game-specific UI
│   │   ├── CosmicGame.tsx       # Phaser wrapper
│   │   ├── GameHUD.tsx          # In-game HUD overlay
│   │   └── DivisionBadge.tsx    # Division rank badge
│   ├── menu/                    # Main menu
│   │   └── MainMenu.tsx         # Start screen
│   ├── wallet/                  # Wallet-related UI
│   │   └── WalletConnect.tsx    # Wallet connection panel
│   ├── shared/                  # Reusable non-shadcn components
│   │   └── NavLink.tsx          # Router NavLink wrapper
│   └── ui/                     # shadcn components (untouched)
├── game/                        # Phaser game engine (untouched)
│   ├── logic/
│   ├── rendering/
│   ├── GameScene.ts
│   ├── events.ts
│   ├── pieces.ts
│   └── types.ts
├── hooks/                       # (untouched)
├── lib/                         # (untouched)
├── pages/                       # (untouched)
└── integrations/                # (untouched)
```

## Changes

### 1. Move component files into subfolders
- `CosmicGame.tsx`, `GameHUD.tsx`, `DivisionBadge.tsx` → `components/game/`
- `MainMenu.tsx` → `components/menu/`
- `WalletConnect.tsx` → `components/wallet/`
- `NavLink.tsx` → `components/shared/`

### 2. Update all imports
- `src/pages/Index.tsx` — update paths to `../components/game/CosmicGame`, `../components/game/GameHUD`, `../components/menu/MainMenu`
- `src/components/game/GameHUD.tsx` — update DivisionBadge import to `./DivisionBadge`
- `src/pages/Wallet.tsx` — update WalletConnect import

### 3. Add brief header comments to key files
- Each moved file gets a one-line comment describing its purpose
- `src/game/events.ts`, `src/game/types.ts`, `src/game/pieces.ts` get header comments if missing

### 4. Clean up index.css
- Add section separators and clearer comment headers for the CSS blocks (design system vars, menu effects, animations)

## Files Modified
- 6 component files moved (new paths, old deleted)
- 3-4 page/component files updated for imports
- `index.css` — comment cleanup only

## What Stays Untouched
- All `ui/` shadcn components
- All game engine files (`src/game/`)
- All lib files, hooks, pages logic, integrations
- No visual or behavioral changes whatsoever

