

# Fix In-Game HUD: Larger Panels, Centered Board, Desktop-First

## Problem
The game was designed with small panel sizes (10px labels, 72px next-piece preview) and the board is not centered — the Phaser canvas fills the container while HUD panels are pinned to edges with tiny fixed offsets (`left-4`, `right-4`). This was not specifically mobile-targeted, but the panels are simply undersized for desktop.

## Plan

### 1. Restructure layout to center the board (`Index.tsx`)
- Replace the current stacked `<CosmicGame /><GameHUD />` with a **3-column flexbox** layout
- Left column: Score, Level, Combo, Division panels
- Center column: `<CosmicGame />` with a fixed max-width container
- Right column: Next piece, Controls panels
- This naturally centers the board between balanced side panels

### 2. Enlarge all HUD panels (`GameHUD.tsx`)
- **Score panel**: label `text-[10px]` → `text-sm`, value `text-2xl` → `text-4xl`, padding `px-4 py-3` → `px-6 py-5`
- **Level panel**: value `text-xl` → `text-3xl`, same label/padding bump
- **Combo panel**: same scaling as Level
- **Next piece preview**: SVG from 72×72 → 120×120, orb radii scaled up proportionally (spacing from 18 → 28 per cell)
- **Controls panel**: label `text-[9px]` → `text-sm`, body `text-[10px]` → `text-base`, padding `px-3 py-2` → `px-5 py-4`
- All panels get `min-w-[180px]` and stronger borders/glow for more visual personality

### 3. Add personality to the Next piece box
- Larger box with a subtle animated border glow (pulsing cyan/yellow)
- Add a faint radial gradient backdrop behind the orb preview
- Increase orb preview size so the piece is clearly visible

### 4. Keep overlays as absolute (Game Over, Pause, Chain, Title)
- These remain positioned over the full viewport — no change to their centering logic

### 5. Files changed
- **`src/pages/Index.tsx`** — 3-column flex layout
- **`src/components/GameHUD.tsx`** — split into left/right panel sections rendered in the flex columns + overlay layer; all panels enlarged
- **No changes** to `MainMenu.tsx`, `CosmicGame.tsx`, or game logic

