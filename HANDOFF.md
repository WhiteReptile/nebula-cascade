# Nebula Cascade — Handoff Document

**Last updated:** May 2026  
**Backend:** Lovable Cloud (managed Supabase: `aoodmexjovwvytzjdyhk`)  
**Chain:** Base mainnet (8453) — NFT collection reference only; rewards are fully off-chain

> ⚠️ The old Replit Supabase project (`pbklgtguxftmckwhwgtb`) is **abandoned**.
> All backend now lives in Lovable Cloud.

---

## Social auth providers — IMPORTANT

Lovable Cloud's managed OAuth supports **Google + Apple only**. The app currently
ships **Google + email/password + wallet** sign-in.

Adding **GitHub, Twitter (X), Spotify, Discord**, or any other provider requires
**migrating off Lovable Cloud to a self-managed Supabase project**, where those
providers can be enabled in the Supabase dashboard. There is no shortcut.

Google OAuth uses Lovable's managed broker — **no Site URL / redirect URL config
or Google Cloud Console work is required**.

---

## Email / SMTP

- **Resend** is connected as a transactional email provider (secret `RESEND_API_KEY` available in edge functions).
- For **auth OTP / verification emails specifically**, configure custom SMTP in
  Lovable Cloud → Auth Settings (use Resend SMTP creds). The default Cloud mailer
  is rate-limited and lands in spam.

---

## Architecture Overview

```
Browser (React + Vite + Phaser 3)
  │
  ├── Lovable Cloud (Supabase: Postgres + Auth + Edge Functions)
  │     ├── Auth: email/password + Google OAuth (managed broker)
  │     ├── DB: players, cards, leaderboard, reward_payouts,
  │     │       marketplace_listings, card_energy, guest_scores, ...
  │     └── Edge Functions:
  │           generate-session, submit-score, submit-guest-score,
  │           claim-reward, finalize-season, set-payout-amount,
  │           verify-nft-ownership
  │
  └── Thirdweb (Base L2) — NFT collection 0xa89C…aa07e (display only)
```

**Data flow for a ranked game:**
1. Player visits `/` → `useGameSession` calls `generate-session` → `{ sessionId, seed }`
2. Phaser emits `matchEnd` with score/level/combo stats
3. `useMatchEvents` calls `submit-score` with sessionId + match stats
4. Edge function validates, runs anti-cheat, writes `match_logs`, updates `players` + `leaderboard`

**Guest players** bypass the auth + energy + leaderboard system entirely.
Their scores are stored against a `device_id` for 24h, then auto-purged.
`consumeCardEnergy()` short-circuits when there is no session.

---

## Environment Variables

All variables prefixed `VITE_` are baked into the browser bundle at build time. Never put secrets in `VITE_` vars.

### Required

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL — `https://pbklgtguxftmckwhwgtb.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key (safe to expose — enforced by RLS) |

The app throws a clear startup error if either of these is missing.

### Optional overrides

| Variable | Default | Description |
|---|---|---|
| `VITE_NEBULA_TESTNET` | `false` | Set `true` to flip all on-chain reads/writes to Base Sepolia (84532) |
| `VITE_NEBULA_COLLECTION_ADDRESS` | `0xa89C9d428321291fF9b3609D62861123690aa07e` | ERC-1155 card contract address override |
| `VITE_MARKETPLACE_V3_ADDRESS` | 0xa89C9d428321291fF9b3609D62861123690aa07e | MarketplaceV3 contract — **Trade tab shows "under deployment" banner until this is set** |

### Edge function secrets (set in Supabase dashboard, not Replit)

| Variable | Where | Description |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Edge Functions | Auto-injected by Supabase — no action needed |
| `MARKETPLACE_V3_ADDRESS` | `settle-listing` function env | Must match `VITE_MARKETPLACE_V3_ADDRESS` |
| `BASE_RPC_URL` | `settle-listing` function env | Optional — defaults to public Base RPC |

---

## Authentication Flows

### 1. Guest (no account)
- Player hits Play on the home screen immediately, no login required
- `usePlayerProfile` detects no session → `isGuest = true`
- `useMatchEvents` skips `submit-score` for guests — scores are local-only
- No leaderboard row, no rewards, no server-side state
- The HUD shows a "🎮 GUEST · Casual play" badge and a sign-in CTA on game-over

### 2. Email / Password + OTP confirmation
**Sign-up flow:**
```
signUp({ email, password, options: { data: { display_name } } })
  → Supabase sends confirmation email with 6-digit OTP code
  → Auth.tsx transitions to OTP input step (6 boxes, auto-advance, paste support)
  → verifyOtp({ email, token, type: 'email' })
  → navigate('/')
```
**Requires:** "Confirm email" toggled ON in Supabase dashboard → Auth → Email  
**Email delivery:** Supabase's built-in mailer has a 3 emails/hour rate limit and often lands in spam. Configure a custom SMTP provider (Resend recommended — free tier) in Supabase → Auth → SMTP Settings for reliable delivery.

**Sign-in flow:** `signInWithPassword({ email, password })` — no OTP needed for existing confirmed users.

### 3. Google OAuth
**Flow:**
```
signInWithOAuth({ provider: 'google', skipBrowserRedirect: true })
  → preflight fetch to detect "provider not enabled" before browser navigates
  → on success: window.location.assign(oauthUrl)
  → Supabase redirects back to Site URL after Google consent
  → handle_new_user trigger seeds players row with player_<8hex> placeholder
  → seedOAuthDisplayName promotes placeholder to real Google display name
```
**Requires:**
1. Google Cloud Console → OAuth 2.0 credentials → Authorized redirect URI: `https://pbklgtguxftmckwhwgtb.supabase.co/auth/v1/callback`
2. Supabase → Auth → Providers → Google → ON → paste Client ID + Secret
3. Supabase → Auth → URL Configuration → Site URL: your deployed URL

### 4. GitHub / Twitter / Spotify OAuth
Same preflight-then-redirect pattern as Google, implemented in `src/lib/oauthProviders.ts`.  
Each provider requires its own OAuth app registered with the respective developer portal and enabled in Supabase → Auth → Providers.

### Shared auth behavior
- `handle_new_user` Postgres trigger auto-creates `players` row on every first sign-in
- Admin access gated by `public.admin_email_allowlist` table (DB-layer enforcement, not code)
- Initial admin: `e56056570@gmail.com`

---

## Key Configuration Files

| File | Contents |
|---|---|
| `src/config/gameConfig.ts` | Board geometry, scoring, pacing, piece spawning |
| `src/config/economyConfig.ts` | Energy, cards, marketplace fees, leaderboard thresholds, rewards |
| `src/config/web3Config.ts` | Chain ID, Thirdweb client ID, NFT collection address |
| `src/config/authConfig.ts` | OTP constants, supported OAuth providers, shared provider-disabled detection |
| `src/lib/thirdweb/chains.ts` | Mainnet/testnet chain switching via `VITE_NEBULA_TESTNET` |
| `src/lib/thirdweb/contracts.ts` | `nebulaCollection` contract instance |

---

## Deployment

### Dev server
```bash
npm install
npm run dev          # runs on 0.0.0.0:5000
```

### Production build (Vite SPA)
```bash
npm run build        # outputs to dist/
```
Deploy the `dist/` folder as a static site (Replit → Publish, or any CDN). No server process required — all backend is Supabase.

### Post-deploy checklist (one-time, per environment)
1. **Supabase URL config:** Dashboard → Auth → URL Configuration
   - Site URL: your live URL (e.g. `https://your-app.replit.app`)
   - Redirect URLs: add `https://your-app.replit.app/**`
2. **Google OAuth redirect:** Google Cloud Console → your OAuth client → Authorized redirect URIs → add the Supabase callback: `https://pbklgtguxftmckwhwgtb.supabase.co/auth/v1/callback`
3. **Supabase migrations:** All 23 migrations in `supabase/migrations/` have been applied to the project. For a fresh Supabase project, run: `supabase db push`
4. **Edge functions:** All 6 active functions are deployed. To redeploy: `supabase functions deploy --project-ref pbklgtguxftmckwhwgtb`

### Active edge functions
| Function | Purpose |
|---|---|
| `generate-session` | Creates game session, enforces 60s cooldown |
| `submit-score` | Anti-cheat, leaderboard update, division tracking |
| `claim-reward` | Off-chain reward claim (flips DB row — no ETH transfer yet) |
| `finalize-season` | Admin: ranks players, inserts reward_payouts rows |
| `set-payout-amount` | Admin: sets USD amounts on reward_payouts rows |
| `verify-nft-ownership` | Reconciles on-chain ERC-1155 balances with DB card records |
| `settle-listing` | Verifies on-chain MarketplaceV3 sale before mirroring to DB |

---

## Known Issues

### 1. Google OAuth redirects to localhost in dev
**Symptom:** After Google consent, browser shows "connection refused"  
**Root cause:** Supabase's Site URL defaults to `localhost` on new projects  
**Fix:** Supabase → Auth → URL Configuration → Site URL → set to your Replit dev domain  
No code changes needed.

### 2. Email confirmation OTP not arriving
**Root cause:** Supabase's built-in mailer is rate-limited (3/hour) and lands in spam  
**Fix:** Supabase → Auth → SMTP Settings → configure Resend (free, 5 min setup)  
Until then: manually confirm users in Supabase → Auth → Users.

### 3. MarketplaceV3 contract not deployed
**Symptom:** Trade tab shows "under deployment" banner  
**Fix:** See "Next Steps" below — requires deploying the contract and setting `VITE_MARKETPLACE_V3_ADDRESS`.

### 4. On-chain ETH payouts not implemented
**Status:** Intentionally deferred. `claim-reward` edge function flips the DB row to `claimed` but sends no ETH.  
**Stub:** `src/lib/payoutIntegrations.ts` — `thirdwebProvider.preparePayout()` returns `{ ready: false }`.  
**Path forward:** See `replit.md` → "Reward payouts — current status" for the race-condition-safe implementation pattern required.

### 5. Orphaned unconfirmed user accounts
**Context:** Before "Confirm email" was enabled in Supabase, some test sign-ups created unconfirmed accounts.  
**Fix:** Manually confirm or delete them in Supabase → Auth → Users.

---

## Next Steps (Priority Order)

### Immediate (unblocks core features)
1. **Configure custom SMTP** — Supabase → Auth → SMTP → use Resend. Unblocks email OTP for all new sign-ups.
2. **Set Supabase Site URL** — Supabase → Auth → URL Configuration. Unblocks Google OAuth in dev and production.

### Short-term (complete the product)
3. **Deploy MarketplaceV3 on Base Sepolia** — Thirdweb dashboard → MarketplaceV3 → Deploy → Base Sepolia. Set 5% platform fee (500 bps). Set `VITE_MARKETPLACE_V3_ADDRESS` + `VITE_NEBULA_TESTNET=true`. Run a full list → buy → cancel cycle with two wallets. Then deploy on Base mainnet and remove the testnet flag.
4. **Enable GitHub / Twitter / Spotify OAuth** — each requires its own developer app registration. Setup URLs are documented in `src/lib/oauthProviders.ts`.

### Deferred (requires security review)
5. **On-chain ETH payouts** — requires a funded wallet, private-key handling design, and a duplicate-payout-safe tx pattern (reserve DB row → broadcast tx → persist tx hash → reconcile from chain receipt). See `replit.md` for detailed notes on the race window that must be solved.

---

## Codebase Notes for Incoming Engineers

- **Single source of truth for all tunable numbers:** `src/config/` — do not hardcode game/economy/web3 values elsewhere
- **RLS is the security layer:** all Supabase tables have row-level security. The anon key is safe to expose; the service role key is only used inside edge functions
- **Leaderboard ranks are live:** the `trg_refresh_leaderboard_ranks` AFTER trigger recomputes `RANK()` immediately on every score submission — no nightly batch
- **Anti-cheat runs server-side** in `submit-score`: `highScorePerSecond`, `scoreSpike`, `tooShort`, `staleSession`, etc. Flagged rows show an amber ⚠ in the leaderboard UI
- **34 unused shadcn/ui components** exist in `src/components/ui/` — scaffolded by the CLI and tree-shaken by Vite. Safe to delete if bundle size becomes a concern, but low priority
- **`src/lib/payoutIntegrations.ts`** is intentionally a stub — the `PayoutProvider` interface and `exportPayoutCSV` are real; `thirdwebProvider.preparePayout` always returns `{ ready: false }` until on-chain payouts are implemented
