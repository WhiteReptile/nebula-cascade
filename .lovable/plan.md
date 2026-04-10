

# Cosmic Blocks — Original Falling-Block Puzzle Game

## Overview
A Phaser 3-powered falling-block puzzle game set in a cosmic galaxy environment, featuring original geometric shapes, a color energy system, and high-impact VFX.

## Core Architecture
- **Phaser 3** game engine embedded in React via a dedicated component
- Game canvas rendered inside the app layout with a futuristic UI overlay built in React

## Game Grid & Pieces
- 10×20 grid with neon-outlined cells
- **6 original geometric shapes** (non-tetromino): L-hook, Z-wave, T-cross, Diamond, Arrow, Bar-3 — each with unique rotations
- Each piece has a distinct neon color (cyan, magenta, lime, orange, violet, gold)

## Controls
- **Arrow keys**: Move left/right, rotate (up), soft drop (down)
- **Z key**: Force Drop — instant slam with shockwave VFX
- **Space**: Pause

## Core Mechanics
1. **Line clearing** with color-based bonuses
2. **Color Energy System** (3 same-color lines): electric wrap animation, pulsing glow, slow-motion clear
3. **Cosmic Chain** (5-line combo): galaxy explosion VFX, full field wipe, massive score multiplier, screen shake
4. **Force Drop bonus**: faster drops = higher score, impact shockwave effect
5. Progressive speed increase as score grows

## Visual Effects (Phaser 3)
- Animated nebula background with parallax star layers
- Bloom/glow on all pieces using Phaser's pipeline
- Particle emitters for: line clears, cosmic chains, force drop impacts
- Screen shake on high-impact events
- Slow-motion effect via time scale manipulation

## UI Elements (React overlay)
- Score display, level, combo counter
- Next piece preview
- Game over screen with restart
- Futuristic styled HUD with glow effects

## Sound
- Background cosmic ambient loop
- SFX for: piece placement, rotation, line clear, energy burst, cosmic chain explosion, force drop impact

## Pages
- **Index**: Game page with Phaser canvas + React HUD overlay

