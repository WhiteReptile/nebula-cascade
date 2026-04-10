

# PS2-Style Main Menu — Nebula: ColdLogic

## Overview
Add a full-screen main menu that loads before gameplay. Canvas-animated starfield background, the uploaded cosmic image centered as a hero visual, CRT scanline overlay, and three glowing menu options. PS2-era minimal aesthetic.

## New Files

### `src/components/MainMenu.tsx`
- **Canvas background**: Animated starfield (drifting stars, 2-3 faint nebula blobs with sine motion) rendered via `<canvas>` and `requestAnimationFrame` — no Phaser dependency
- **Hero image**: The uploaded cosmic triangles image placed center-screen as a CSS background or `<img>`, sized ~60-70% viewport width, with subtle pulse/glow animation
- **CRT overlay**: CSS pseudo-elements for faint horizontal scanlines (repeating 2px lines at ~5% opacity) and corner vignette
- **Title**: "NEBULA" large monospace text above menu, "COLDLOGIC" smaller beneath — white/cyan `#66ffee` glow via `text-shadow`, gentle pulse animation
- **Menu items** below the image, vertically stacked and centered:
  - **START** — sets `showMenu = false`, fades to game
  - **OPTIONS** — navigates to `/options`
  - **WALLET** — navigates to `/wallet`
- Selected item: cyan glow + slight scale, `▶` cursor indicator
- Keyboard support: Arrow Up/Down to navigate, Enter to select
- Mouse hover highlights items
- 500ms fade-out transition before entering game or navigating

### `src/pages/Options.tsx`
- Placeholder page matching the dark `#050510` background
- "OPTIONS" title, "Coming Soon" text, "← Back" button to `/`

## Modified Files

### `src/pages/Index.tsx`
- Add `showMenu` state (default `true`)
- When `true`: render `<MainMenu />` with callbacks for start/options/wallet
- START callback: trigger fade-out, then set `showMenu = false` to mount `<CosmicGame />` + `<GameHUD />`

### `src/App.tsx`
- Add `/options` route → `Options.tsx`

### `src/index.css`
- Add `@keyframes menuGlow` (pulse for title text-shadow)
- Add `@keyframes scanline` (subtle scroll for CRT lines)
- Add `@keyframes fadeOut` for menu transition

## Asset
- Copy uploaded image to `src/assets/menu-hero.png` and import it in `MainMenu.tsx`

## Visual Spec
- Background: `#050510`, animated canvas stars
- Scanlines: 2px repeating horizontal lines, 4-6% opacity
- Title: monospace, uppercase, `letter-spacing: 0.3em`, cyan glow
- Menu items: monospace, `letter-spacing: 0.2em`, ~1.2rem, dim white → cyan glow on select
- Hero image: centered, max-width 65vw, subtle breathing scale animation (0.98–1.02 over 4s)
- Fade transition: 500ms opacity 1→0 before mounting game

## Behavior
- Menu loads first — no Phaser instance until START
- Lightweight: canvas + CSS only, no heavy libraries
- Fully responsive

