# Nebula Cascade

A cosmic-themed cascade puzzle game. Phaser 3 engine, React HUD, Supabase backend.

> Legal name: **Nebula: ColdLogic**. Public/branding name: **Nebula Cascade**.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **Styling**: Tailwind CSS v3 + shadcn/ui (Radix primitives)
- **Game engine**: Phaser 3.80
- **Routing**: react-router-dom v6
- **State/data**: @tanstack/react-query
- **Backend**: Supabase (Postgres + Auth + Edge Functions) — provisioned via Lovable Cloud
- **Web3 (planned)**: Thirdweb SDK on Base (ETH L2, chain 8453)

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your Supabase project values
npm run dev            # http://localhost:3000
```

### Scripts
| Command           | Purpose                          |
|-------------------|----------------------------------|
| `npm run dev`     | Vite dev server (port 3000)      |
| `npm run build`   | Production build                 |
| `npm run preview` | Preview production build         |
| `npm run lint`    | ESLint                           |
| `npm run test`    | Vitest (run once)                |
| `npm run test:watch` | Vitest watch mode             |

## Folder Structure

```
src/
├── components/
│   ├── game/         # In-game React HUD (overlays the Phaser canvas)
│   │   ├── CosmicGame.tsx       # Mounts the Phaser instance
│   │   ├── GameHUD.tsx          # Score, level, combo, game-over screen
│   │   ├── GravityCompass.tsx   # Directional gravity indicator
│   │   ├── HypeOverlay.tsx      # Combo/chain announcement overlay
│   │   └── DivisionBadge.tsx    # Player rank badge
│   ├── menu/         # Main-menu carousel
│   ├── wallet/       # Wallet connect UI (Thirdweb-ready)
│   ├── shared/       # Shared cross-page UI (NavLink, etc.)
│   └── ui/           # shadcn/ui primitives — do not edit by hand
│
├── game/             # Phaser engine code (no React inside)
│   ├── GameScene.ts             # Main scene orchestrator
│   ├── events.ts                # Phaser ↔ React event bus
│   ├── pieces.ts                # Orb formations, colors, grid constants
│   ├── types.ts                 # Engine-internal types
│   ├── logic/                   # Pure game logic (no rendering)
│   │   ├── chainResolver.ts     # Chain/combo math
│   │   ├── fallingPhysics.ts    # Per-orb loosening physics
│   │   └── orbReorganizer.ts    # 4×4 reorganization payouts
│   └── rendering/               # Pure draw functions
│       ├── background.ts        # Stars, asteroids, cosmic backdrop
│       ├── orbRenderer.ts       # Orb glow + landing bounce
│       └── vfx.ts               # Particles, shockwaves, flashes
│
├── lib/              # App-level libraries (used by React, not Phaser)
│   ├── api.ts                   # Generic supabase RPC helpers
│   ├── sfx.ts                   # WebAudio menu blips
│   ├── utils.ts                 # cn() + general helpers
│   ├── matchLogger.ts           # Submit match results
│   ├── divisionSystem.ts        # Gem-tier ranking math
│   ├── playerSegmentation.ts    # Bracket assignment
│   ├── energySystem.ts          # Per-card energy pool
│   ├── cardSystem.ts            # Card ownership & active-card
│   ├── marketplaceSystem.ts     # Listings, 3% fee, sales
│   ├── walletSystem.ts          # Thirdweb wallet glue
│   └── payoutIntegrations.ts    # Stripe/Coinbase/Circle export adapters
│
├── pages/            # Route components (one file per /route)
│   ├── Index.tsx                # /             (menu + game)
│   ├── Auth.tsx                 # /auth
│   ├── Leaderboard.tsx          # /leaderboard
│   ├── Marketplace.tsx          # /marketplace
│   ├── Options.tsx              # /options
│   ├── Rewards.tsx              # /rewards      (Rewards & Rules)
│   ├── Roadmap.tsx              # /roadmap
│   ├── AdminRewards.tsx         # /admin/rewards
│   └── NotFound.tsx             # *
│
├── hooks/            # React hooks (use-mobile, use-toast, usePlayerProfile)
├── integrations/
│   └── supabase/     # AUTO-GENERATED — do not edit
│       ├── client.ts
│       └── types.ts
├── test/             # Vitest setup + examples
├── App.tsx           # Router
├── main.tsx          # Entry point
└── index.css         # Tailwind + design tokens (HSL)

supabase/
├── config.toml       # Supabase project config (project_id only — do not change)
├── functions/        # Edge functions
│   ├── generate-session/        # Anti-cheat seed issuance
│   └── submit-score/            # Validates and persists match scores
└── migrations/       # SQL migrations (managed by Lovable / Supabase CLI)
```

## Architecture Notes

- **React ↔ Phaser bridge**: `src/game/events.ts` exports a singleton `Phaser.Events.EventEmitter`. The Phaser `GameScene` emits (`hud`, `nextPiece`, `gameover`, `gravity`, …) and React HUD components subscribe in `useEffect`.
- **Path alias**: `@/` resolves to `src/`. Prefer it over deep relative imports.
- **Design tokens**: All colors live in `src/index.css` and `tailwind.config.ts` as HSL CSS variables. Do not hardcode hex/rgb in components.
- **Supabase**: The `client.ts` and `types.ts` files in `src/integrations/supabase/` are auto-generated. Schema changes go through `supabase/migrations/`.

## Portability

This project is a standard Vite + React SPA — no Lovable runtime is required to build, run, or deploy. To export:

1. Connect the project to GitHub (Lovable → Connectors → GitHub).
2. Clone the repo locally or in any other AI coding environment (Bolt, StackBlitz, Cursor, etc.).
3. Copy `.env.example` → `.env` and fill in your Supabase credentials.
4. `npm install && npm run dev`.

The only Lovable-specific pieces are the auto-generated Supabase client/types, which are standard `@supabase/supabase-js` code and work anywhere.

## License

Proprietary — all rights reserved.
