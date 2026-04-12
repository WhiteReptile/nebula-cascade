# Cosmic Orbs — Competitive Puzzle Game

A competitive puzzle game built with Phaser 3 + React 18, featuring elemental orb mechanics, an NFT-ready card economy, and a monthly leaderboard system with real reward payouts.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 + Vite)               │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │  Pages   │  │  Components  │  │     Phaser 3 Engine        │ │
│  │          │  │              │  │                            │ │
│  │ Index    │  │ MainMenu     │  │  GameScene.ts (orchestrator)│ │
│  │ Auth     │  │ GameHUD      │  │  ├─ logic/                 │ │
│  │ Market.. │  │ CosmicGame   │  │  │  ├─ chainResolver.ts    │ │
│  │ Leader.. │  │ DivisionBadge│  │  │  ├─ orbReorganizer.ts   │ │
│  │ Rewards  │  │ WalletConnect│  │  │  └─ fallingPhysics.ts   │ │
│  │ Rules    │  │ NavLink      │  │  ├─ rendering/             │ │
│  │ Options  │  │              │  │  │  ├─ background.ts       │ │
│  │ Admin..  │  │              │  │  │  ├─ orbRenderer.ts      │ │
│  └──────────┘  └──────────────┘  │  │  └─ vfx.ts             │ │
│                                   │  ├─ pieces.ts             │ │
│                                   │  ├─ types.ts              │ │
│                                   │  └─ events.ts (↔ React)   │ │
│                                   └────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Business Logic (src/lib/)                 │ │
│  │                                                              │ │
│  │  cardSystem.ts ──→ energySystem.ts                           │ │
│  │       ↓                                                      │ │
│  │  marketplaceSystem.ts ──→ energySystem.ts (on purchase)      │ │
│  │                                                              │ │
│  │  divisionSystem.ts ←── matchLogger.ts ──→ leaderboard        │ │
│  │                                                              │ │
│  │  walletSystem.ts (stubs)                                     │ │
│  │  payoutIntegrations.ts (stubs: Stripe/Coinbase/Circle/       │ │
│  │                         Thirdweb on Base chain)              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Hooks (src/hooks/)                        │ │
│  │  usePlayerProfile.ts — Auth-aware player state               │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │ Supabase JS Client
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Supabase / Lovable Cloud)           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Edge Functions                           │ │
│  │                                                              │ │
│  │  generate-session  — Pre-game: auth, cooldown, seed gen     │ │
│  │  submit-score      — Post-game: validate, log, leaderboard  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Database Tables                          │ │
│  │                                                              │ │
│  │  players           — User profiles, division, wallet        │ │
│  │  cards             — NFT-ready collectible cards             │ │
│  │  card_energy       — Per-card daily energy (2/day)           │ │
│  │  game_sessions     — Session seeds + cooldown tracking       │ │
│  │  match_logs        — Full match results + anti-cheat flags   │ │
│  │  leaderboard       — Monthly rankings with avg_top3_score    │ │
│  │  marketplace_listings — Card trading with dynamic fees       │ │
│  │  reward_periods    — Monthly reward cycle management         │ │
│  │  reward_payouts    — Individual payout records               │ │
│  │  user_roles        — RBAC (admin/moderator/user)             │ │
│  │  player_energy     — Legacy player-level energy (deprecated) │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Enums: gem_division, app_role, payout_method,              │ │
│  │         payout_status, reward_period_status                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Gameplay Engine (`src/game/`)

The game is a falling-piece puzzle with elemental orbs. Pieces are formations of 3-5 same-color orbs that fall with "moon gravity" (smooth acceleration with visual loosening physics).

**Match Types** (resolved in order after each piece locks):

| Match | Requirement | Effect | Max Score |
|-------|------------|--------|-----------|
| Block Match | 4×4 same-color grid | Implosion → reorganize orbs | 1000 |
| Proximity Burst | 10+ adjacent same-color | Destroy cluster | 500 |
| Tri-Color Fusion | 3 full rows, 3 dominant colors, 4+ colors present | Fusion → reorganize | 1000 |
| Line Clear | 4+ consecutive full rows, same dominant color | Destroy rows | 500 |
| Cosmic Wipe | 5+ total line combo | Clear entire board | 1000 |

**Bonus Mechanics:**
- **Elemental Cascade**: Chain 3+ with same element → destroys densest column
- **Gravity Crush**: Force-drop pushes adjacent same-color orbs down 1 row
- **Near-Miss Hints**: Highlights orbs 1 cell away from matching

**Difficulty Scaling:**
- Base gravity: 0.005 (pieces fall fast from start)
- +4.5% speed per level (every 2000 points)
- Urgency at 40s: +5% gravity per second, red vignette overlay
- No color-repeat bias in spawns (pure random)

### 2. Card Economy (`src/lib/cardSystem.ts`, `energySystem.ts`)

Cards are the monetization layer. Each card:
- Has a division tier (gem_v to gem_i) affecting leaderboard placement
- Contains 2 daily energy points (reset at midnight UTC)
- Is purely cosmetic (no gameplay stat boosts)
- Can be traded on the internal marketplace

### 3. Marketplace (`src/lib/marketplaceSystem.ts`)

Internal card trading with anti-flip fee structure:
- Base fee: 5%
- 1 resale within 7 days: 7%
- 2+ fast resales: 10%

### 4. Division & Leaderboard (`src/lib/divisionSystem.ts`, `matchLogger.ts`)

Monthly seasons with 5 tiers. Ranking uses `avg_top3_score` (average of player's 3 best match scores). Reward pools scale by division.

### 5. Session Validation (`supabase/functions/`)

Server-side match validation flow:
1. `generate-session` → creates session with unique seed, enforces 60s cooldown
2. Player plays game (client-side)
3. `submit-score` → validates session, logs match, updates leaderboard

### 6. Payout System (`src/lib/payoutIntegrations.ts`)

Stub implementations for 4 providers (Stripe, Coinbase, Circle, Thirdweb). Includes CSV export for manual processing. Chain targets: Base (primary), Polygon (fallback).

## Folder Structure

```
src/
├── components/
│   ├── game/           # Phaser wrapper + HUD overlay
│   ├── menu/           # Main menu with navigation
│   ├── wallet/         # Wallet connection UI
│   ├── shared/         # Reusable UI components (NavLink)
│   └── ui/             # shadcn/ui primitives
├── game/               # Phaser 3 engine (no React dependencies)
│   ├── GameScene.ts    # Main loop orchestrator
│   ├── pieces.ts       # Piece definitions + spawn logic
│   ├── types.ts        # Engine type definitions
│   ├── events.ts       # Phaser ↔ React event bus
│   ├── logic/          # Pure game logic (no rendering)
│   │   ├── chainResolver.ts    # Match detection algorithms
│   │   ├── orbReorganizer.ts   # Post-match board manipulation
│   │   └── fallingPhysics.ts   # Visual loosening physics
│   └── rendering/      # Pure rendering (no game state mutation)
│       ├── background.ts       # Cosmic backdrop + grid
│       ├── orbRenderer.ts      # Element-specific orb visuals
│       └── vfx.ts              # All particle/screen effects
├── hooks/
│   └── usePlayerProfile.ts     # Auth-aware player state
├── lib/                # Business logic (database operations)
│   ├── cardSystem.ts           # Card CRUD + ownership
│   ├── energySystem.ts         # Per-card energy management
│   ├── divisionSystem.ts       # Tier thresholds + rewards
│   ├── marketplaceSystem.ts    # Card trading + fees
│   ├── matchLogger.ts          # Client-side match logging
│   ├── walletSystem.ts         # Wallet linking (stubs)
│   ├── payoutIntegrations.ts   # Payout providers (stubs)
│   └── utils.ts                # Tailwind utilities
├── pages/              # Route components
│   ├── Index.tsx        # Game page (Phaser + HUD)
│   ├── Auth.tsx         # Login/signup
│   ├── Marketplace.tsx  # 4-tab hub (market/cards/profile/wallet)
│   ├── Leaderboard.tsx  # Monthly rankings
│   ├── Rewards.tsx      # Reward status
│   ├── Rules.tsx        # Game rules
│   ├── Options.tsx      # Settings
│   └── AdminRewards.tsx # Admin payout management
├── integrations/supabase/
│   ├── client.ts        # Auto-generated Supabase client
│   └── types.ts         # Auto-generated DB types
└── index.css            # Design system tokens

supabase/
├── config.toml          # Project config
└── functions/
    ├── generate-session/index.ts  # Pre-game session creation
    └── submit-score/index.ts      # Post-game score validation
```

## Key Data Flows

### Game Session Flow
```
Player clicks Play
  → usePlayerProfile checks auth + active card
  → generate-session edge function (cooldown check, seed generation)
  → GameScene runs (client-side Phaser)
  → Game over → submit-score edge function
  → Updates: match_logs, players, leaderboard
```

### Card Purchase Flow
```
Browse marketplace listings
  → buyCard() transfers ownership
  → initCardEnergy() gives 2 energy to new owner
  → Listing status → 'sold'
```

### Monthly Reward Cycle
```
reward_periods: open → validating → finalized → frozen → pending_payout → paid
  → Admin reviews flagged matches
  → Generates reward_payouts based on REWARD_TIERS
  → Exports via payout provider or CSV
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS v3
- **Game Engine**: Phaser 3.80
- **Backend**: Supabase (Lovable Cloud) — Postgres, Auth, Edge Functions
- **UI Components**: shadcn/ui + Radix primitives
- **State Management**: React Query + Supabase real-time subscriptions

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
```

Edge functions deploy automatically via Lovable Cloud.
