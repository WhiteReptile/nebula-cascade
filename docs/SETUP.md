# Setup — Local Dev & Export

## Quick Start

```bash
npm install
cp .env.example .env   # see "Environment Variables" below
npm run dev            # http://localhost:3000
```

## Scripts

| Command              | Purpose                          |
|----------------------|----------------------------------|
| `npm run dev`        | Vite dev server (port 3000)      |
| `npm run build`      | Production build                 |
| `npm run preview`    | Preview production build         |
| `npm run lint`       | ESLint                           |
| `npm run test`       | Vitest (run once)                |
| `npm run test:watch` | Vitest watch mode                |

## Environment Variables

The `.env` file is auto-generated under Lovable Cloud. For external
deployment (Replit / Cursor / VS Code) create a `.env` with:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

These are **publishable** values — safe in the client. Never commit
service-role keys or other private secrets to client code.

## Exporting to Replit / Cursor / VS Code

1. In Lovable: **Connectors → GitHub** → push to a repo.
2. Clone the repo into your target tool.
3. `cp .env.example .env` and fill in the three Supabase values above.
4. `npm install && npm run dev`.

There is **no Lovable runtime requirement** — this is a standard Vite SPA.

## Supabase / Edge Functions

- Migrations live in `supabase/migrations/`.
- Edge functions live in `supabase/functions/{generate-session,submit-score}/`.
- `supabase/config.toml` holds `project_id` only — do not change it.
- Outside Lovable, deploy edge functions with the Supabase CLI:
  `supabase functions deploy <name>`.

## Web3 (Thirdweb on Base)

Public values are committed in `src/config/web3Config.ts`:
- Chain ID `8453` (Base)
- Thirdweb client ID (publishable)
- NFT collection address

No secrets needed for read-only NFT queries.

## Tuning the Game

All gameplay & economy numbers live in `src/config/`:

- `gameConfig.ts` — board, scoring, pacing, spawn, combo
- `economyConfig.ts` — cards, energy, marketplace, rewards
- `web3Config.ts` — chain + contract addresses

Edit these and the rest of the codebase will follow.
