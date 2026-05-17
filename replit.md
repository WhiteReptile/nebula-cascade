# Nebula Cascade — ColdLogic

A blockchain-enabled cosmic puzzle game built with React, Phaser 3, Supabase, and Thirdweb.

## Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Game Engine**: Phaser 3
- **Backend/Auth/DB**: Supabase (PostgreSQL)
- **Web3/NFT**: Thirdweb (Base L2 chain)
- **Routing**: React Router v6
- **State**: TanStack Query

## Environment Variables (shared)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |

## Dev Server
- Runs on `0.0.0.0:5000` via `npm run dev`
- File watching excludes `.cache/`, `node_modules/`, `.git/` to avoid ENOSPC errors

## Admin access — email allowlist (May 2026)
Admin access is gated on the **authenticated user's email address**. Only emails listed in `public.admin_email_allowlist` can ever hold `role='admin'` in `user_roles`. Initial allowlist: `e56056570@gmail.com`.

Enforcement is at the DB layer so every existing admin gate (RLS policies, edge functions, AdminRewards page) inherits it for free:
- **BEFORE INSERT/UPDATE trigger on `user_roles`** rejects any `role='admin'` row whose user's auth email isn't in the allowlist — even via the service role. Non-admin signups always land as `role='user'`; non-admin users never see Admin Hub.
- **AFTER INSERT trigger on `auth.users`** auto-grants admin on first sign-in if the new user's email is allowlisted (so the initial admin doesn't have to manually flip a row).
- One-time backfill in the migration: grants admin to allowlisted users that already exist, and revokes admin from any user whose email isn't allowlisted (defensive cleanup).

To add another admin later: `INSERT INTO admin_email_allowlist (email) VALUES ('…');` — they pick up the role on their next sign-in (or via a manual `user_roles` INSERT).

The product is intentionally simple here — **no automatic payouts, no wallet keys, no on-chain reward payments**. The leaderboard collects clean monthly data, admins review it, and admins manually decide rewards via the AdminRewards page (see "Manual payout workflow" below). Migration: `20260503000005_admin_email_allowlist.sql`.

## Manual payout workflow (Task #47)
Reward dollar amounts are **human-decided after each season**, not derived from any formula. End-to-end:
1. Admin runs **Process Rewards** on AdminRewards (calls `finalize-season`, which inserts `reward_payouts` rows at $0).
2. Admin enters per-rank amounts on the AdminRewards Payouts table — either inline per row, or via the "Apply division template" panel (per-rank dollar inputs filled across all matching rows in one division), or "Reset all to $0".
3. Saves go through the admin-only `set-payout-amount` edge function, which validates `0 ≤ amount ≤ $10,000` (sanity ceiling), refuses to mutate `claimed` rows (the player has already been told the amount), writes a `reward_payout_amount_audit` row for every change, and updates `reward_payouts.last_amount_set_by` / `last_amount_set_at` for at-a-glance "who/when" in the table.
4. **Export CSV** (columns: `player_id, display_name, division, rank, amount_usd, claim_status, claimed_at`) and hand the file to whoever processes payments off-platform.
5. Player claims via the existing leaderboard flow → `claim-reward` flips the row to `claimed` (which then locks the amount from further edits).
The per-period summary above the payouts table ("Total assigned: $X across N rows · Unset: M rows") shows how much is still missing before export. Migration: `20260503000004_payout_amount_audit.sql`.

## Reward payouts — current status (Task #43, deferred)
Reward eligibility, off-chain claim records, the 24h claim window, and the leaderboard claim flow are all live (see "Reward notifications" and the `claim-reward` edge function below). **Real on-chain ETH payouts are intentionally NOT implemented yet.** Clicking Claim only flips the `reward_payouts` row to `claimed` — no money moves.

The funded payout wallet, private-key handling, and on-chain transfer logic are deferred until a dedicated security review and production payout design. `src/lib/payoutIntegrations.ts` keeps a stub `PayoutProvider` returning `{ ready: false }` as the integration point. **Do not add a `PAYOUT_WALLET_KEY` secret or any private-key material to Replit at this stage.**

When that work is taken up, the existing schema (`reward_payouts.status`, `expires_at`, `claimed_at`, `reward_amount_cents`) is the row that needs the on-chain transfer hooked into it; an earlier draft prototyped a `payout-claim` edge function + ETH/USD snapshot column, but the architect review flagged a duplicate-payout race window in the simple "check → send → update" pattern. Any future implementation must reserve the row in DB (e.g. `pending → processing` with a request id) BEFORE broadcasting the tx, persist the outbound tx hash pre-confirmation, and reconcile from chain receipts on retry.

## Marketplace V3 (Task #42)
Player-to-player trades now settle on-chain via Thirdweb's audited **MarketplaceV3** contract (escrowed ERC-1155, paid in ETH on Base). Supabase `marketplace_listings` is a denormalised cache — the contract is canonical.

**Env flags**:
- `VITE_NEBULA_TESTNET=true` → flips the whole app to Base Sepolia (84532). Defaults to Base mainnet (8453).
- `VITE_NEBULA_COLLECTION_ADDRESS` → ERC-1155 cards contract on the active chain. Defaults to the mainnet address.
- `VITE_MARKETPLACE_V3_ADDRESS` → MarketplaceV3 contract on the active chain. **Required for trading; until set, the Trade tab shows an "under deployment" banner and all on-chain flows are disabled.**

**Lifecycle**:
1. **List** (`listCardOnChain`) — preflight checks the connected wallet matches `cards.owner_wallet` AND has a non-zero on-chain balance for the tokenId (block-legacy guard); ensures `setApprovalForAll(marketplace, true)` is set (one-time signature); calls `createListing` with `pricePerTokenWei` derived from USD via the live CoinGecko ETH/USD rate; mirrors via `list_card_on_chain` RPC storing the on-chain listing id. The on-chain id is parsed from the **NewListing** event log of the same tx (filtered by `listingCreator`) so concurrent listings can't be confused.
2. **Buy** (`buyListingOnChain`) — calls `buyFromListing` (buyer pays ETH, contract releases the token to the buyer's wallet and ETH to seller minus marketplace fee bps); the resulting **tx hash** is POSTed to the **`settle-listing` edge function** which fetches the receipt from a Base RPC, verifies a `NewSale` log matches `(marketplace_address, listingId, buyer=caller_wallet)`, then calls the **service-role-only** `settle_listing_verified` RPC to mirror the sale. Buyers cannot self-mark sales — the old `mark_listing_status('sold')` path was removed.
3. **Cancel** (`cancelListingOnChain`) — calls `cancelListing` (token returns to seller's wallet); mirrors via `mark_listing_status('cancelled')` RPC (now cancellation-only).
4. **Reconcile** — Marketplace mount calls `reconcileListingsCache()` which reads `getAllValidListings` from the contract and passes the valid id set to the **`reconcile_listings_cache`** SECURITY DEFINER RPC (bypasses the seller-only RLS UPDATE policy that would otherwise silently no-op for other sellers' rows).

**Settlement security model**:
- Buyer signs `buyFromListing` → wallet returns tx hash.
- Client POSTs `{listingId, txHash}` to the `settle-listing` edge function with the auth bearer token.
- Edge function: resolves caller's player + wallet via service role; pulls the receipt over `eth_getTransactionReceipt`; finds a log where `address=MARKETPLACE_V3_ADDRESS`, `topic0=NewSale hash`, `topic2=listingId`, `data.buyer = caller.wallet`; only then calls `settle_listing_verified` (revoked from `authenticated`, granted only to `service_role`).
- Required edge-function env vars: `MARKETPLACE_V3_ADDRESS`, `NEBULA_TESTNET` (optional), `BASE_RPC_URL` (optional override). Defaults to public Base RPCs.

**Source-of-truth model** — the contract is canonical for *trade state* (who escrowed what, who bought, who cancelled), but the off-chain `cards` table remains canonical for *card metadata* (name, division, color, generation lineage) since that's never written on-chain. Reads therefore use Supabase as the primary listing source and reconcile against `getAllValidListings` on every Marketplace mount: stale cached rows are cancelled and their cards restored to the seller's active collection (only if the card is still owned by the original seller — sold cards are left alone since `settle_listing_verified` already moved them). Off-app listings created by direct contract calls won't appear in the UI; they're treated as a non-supported edge case.

**Pricing** — sellers type USD, the listing form shows a live ETH equivalent recomputed every 5s from CoinGecko's free `/simple/price` endpoint. The price is locked at sign time. Submission is blocked while the feed is stale (>30s old).

**Cutover** — migration `20260503000001_marketplace_v3_cutover.sql` cancels every pre-V3 active listing (none had on-chain escrow, so V3 cannot honour them). Cards return to the seller's collection. Per the chosen "block_legacy" policy, cards whose DB ownership was transferred via the retired off-chain `buy_card` RPC cannot be re-listed — `assertOnChainOwnership` rejects them with a clear error directing the user to connect the wallet that holds the token.

**TODO before mainnet flip**:
- Deploy MarketplaceV3 on Base Sepolia (testnet) via the Thirdweb dashboard, set platform fee recipient + 5% (500 bps) fee, paste address into `VITE_MARKETPLACE_V3_ADDRESS`. Set `VITE_NEBULA_TESTNET=true` and run a full list → buy → cancel cycle with two wallets. Then deploy on Base mainnet, replace the address, drop the testnet flag.

## Deployment (Task #41)
- **Target**: `static` (Vite SPA — all backend lives in Supabase, no always-on Node server needed)
- **Build**: `npm run build` → outputs to `dist/`
- **Public dir**: `dist`
- The `VITE_*` env vars from `.replit` userenv are baked into the bundle at build time. Anon Supabase key is safe to expose; the Thirdweb client ID and ERC-1155 contract address are intentionally hardcoded as public values. **Never** add a `VITE_*` var that holds a secret (service-role keys, payout-wallet keys, etc.) — `VITE_*` ships to the browser.
- **First publish — geography is permanent**: on Core/Pro/Enterprise plans the user picks a hosting region in the Publish dialog's Advanced section, and that choice cannot be changed later. Free plan defaults to North America.
- **Post-deploy Supabase config (one-time)**: once the live URL is known, in Supabase → Authentication → URL Configuration set **Site URL** to the live `*.replit.app` URL and add the same URL to **Redirect URLs**. Without this, OAuth callbacks and email magic-links from production are rejected.

## Key Directories
- `src/game/` — Phaser game scene and logic
- `src/components/game/` — React wrappers for game HUD
- `src/components/menu/` — Main menu and navigation
- `src/pages/` — Route-level page components
- `src/hooks/` — Custom hooks (player profile, wallet sync, etc.)
- `src/lib/` — Business logic (marketplace, energy, cards, matchLogger, edgeSession)
- `src/config/` — Game config, economy config, Web3 config
- `src/integrations/supabase/` — Auto-generated Supabase client + types
- `supabase/migrations/` — Database migration files
- `supabase/functions/` — Edge functions (generate-session, submit-score, verify-nft-ownership, finalize-season)

## Edge Functions
| Function | Purpose |
|---|---|
| `generate-session` | Creates a game session before each game; enforces 60s cooldown |
| `submit-score` | Server-side anti-cheat, match log, division update, leaderboard upsert. Accepts an authed JWT + `sessionId`. Guest submissions (Task #38) are accepted for back-compat but only write a `match_logs` row — no leaderboard / players update. |
| `claim-guest-nickname` | _(Orphaned, Task #38)_ Previously reserved guest nicknames; no longer called from the client. |
| `migrate-guest-scores` | _(Orphaned, Task #38)_ Previously carried guest history into a new account; no longer called from the client. |
| `claim-reward` | Off-chain reward claim. Validates ownership + window, refuses $0 amounts (`amount_pending`), prompts wallet connect if missing, then flips `reward_payouts.status` to `claimed`. On-chain ETH transfer is deferred — see "Reward payouts — current status". |
| `verify-nft-ownership` | Reads on-chain ERC-1155 balances and reconciles with DB card records |
| `finalize-season` | Admin-only: rank players per division, insert reward_payouts, mark period as validating |
| `set-payout-amount` | Admin-only: update `reward_payouts.reward_amount_cents` for one or many non-claimed rows. Validates 0–$10,000, rejects claimed rows, writes `reward_payout_amount_audit`. |

All edge functions use `SUPABASE_ANON_KEY` for JWT auth and `SUPABASE_SERVICE_ROLE_KEY` for trusted writes.

## Identity model (Task #38)
- **Two tiers only:** _registered_ (Google or email/password) vs _guest_ (no login).
- **PLAY is unrestricted** — guests can start a match immediately from the title screen. No nickname picker, no onboarding modal.
- **Guests are casual-only:** no leaderboard row, no rewards, no server-side state. The client doesn't call `submit-score` for guests; their scores are local-only.
- **Registered display names:**
  - `handle_new_user` trigger seeds a `player_<8hex>` placeholder on first sign-in.
  - For Google OAuth users, `seedOAuthDisplayName` (`src/lib/registeredNickname.ts`) promotes the placeholder to the real Google profile name (`full_name`/`name`/`given_name`, sanitized to `[A-Za-z0-9_]{3,20}`) on first profile load.
  - Email/password users supply a unique nickname in the sign-up form (passed via `options.data.display_name`).
  - There is no email-prefix fallback and no in-app nickname picker.
- **Leaderboard query** filters `players.is_guest = false` server-side so guest rows can never appear.
- `LEADERBOARD.MIN_FREE_BOARD_SCORE = 3000` (FREE board threshold). NFT board still uses `MIN_LEADERBOARD_SCORE = 2500`.
- FREE leaderboard remains **single-tier** (gem_v); the Leaderboard UI hides the division selector when the FREE tab is active.
- The HUD shows a small "🎮 GUEST · Casual play · sign in for leaderboard" badge for non-logged-in players, plus a "SIGN IN — UNLOCK LEADERBOARD & REWARDS" CTA on game-over.

### Google OAuth setup (one-time)
The "Continue with Google" buttons on `/auth` and `/marketplace` rely on the Supabase Google provider being enabled. When it isn't, `signInWithGoogle` returns `{ ok: false, reason: 'provider_disabled' }` and the UI shows a friendly setup toast instead of the raw Supabase error.

**Why we preflight the OAuth URL**: `supabase.auth.signInWithOAuth` builds the `/authorize` URL client-side and immediately calls `window.location.assign(url)` — there's no API roundtrip. So if the provider is disabled, the browser navigates to Supabase and Supabase returns raw `{"code":400,"msg":"Unsupported provider..."}` JSON straight into the tab. To prevent that, `src/lib/googleAuth.ts` calls `signInWithOAuth({ skipBrowserRedirect: true })`, then does a `fetch(url, { redirect: 'manual' })` preflight: a normal opaqueredirect → assign window.location and continue; a 400 with the provider-disabled message → return the typed `provider_disabled` result so the caller shows the friendly toast.

To enable Google sign-in:

1. **Google Cloud Console** (https://console.cloud.google.com) → create or pick a project.
2. **OAuth consent screen** → User Type **External** → fill in app name, support email, developer email → Save.
3. **Credentials** → **+ Create Credentials → OAuth client ID** → Application type **Web application**.
4. Under **Authorized redirect URIs**, paste your Supabase callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
5. Save → copy the generated **Client ID** and **Client Secret**.
6. **Supabase dashboard** → **Authentication → Providers → Google** → toggle **on**, paste the Client ID + Secret → Save.

No code changes are needed once that's done — the existing buttons start working immediately.

## Reward notifications (Task #22)
Pending `reward_payouts` rows surface in three places for logged-in players:
1. **MainMenu** (top-right, below Account) — glowing "🏆 Claim N rewards →" badge polled every 60s. Visible the moment a returning player hits the title screen.
2. **GameHUD Game Over screen** — the existing CLAIM REWARD banner triggered after each eligible run.
3. **Leaderboard page** — the canonical claim flow with countdown timers and the actual Claim button (calls `claim-reward` edge function).

All three navigate to `/leaderboard` for the actual claim. Query filters: `status='pending'` AND `expires_at > NOW()`.
- **Registered onboarding gate**: after sign-up (email/password OR OAuth), the `handle_new_user` trigger seeds `players.display_name` with a `player_<8hex>` placeholder so the row exists. `usePlayerProfile.needsOnboarding` is true while that placeholder remains; `MainMenu` blocks PLAY and shows a name picker that calls `claimRegisteredNickname()` (case-insensitive uniqueness, 23505 → NAME_TAKEN). Helper lives in `src/lib/registeredNickname.ts`.

## Leaderboard ranking criterion (Task #46, 2026-05-03)
Players are ranked by **monthly accumulated `total_score` DESC** within their division — every valid energy run adds to the player's monthly total, and at season end whoever has the highest total in their division wins the top reward slot. Tie-break order: `total_score` DESC, `best_score` DESC, then earliest `updated_at`. Both the live `leaderboard.rank` (via `refresh_leaderboard_ranks_fn`) and the `reward_payouts` rows produced by `finalize-season` use this ordering.

Ranks are **live** for the entire season — every accepted valid-energy score immediately re-ranks the affected division (via the AFTER trigger on `leaderboard`). There is no daily freeze, no nightly batch, no cached snapshot. Standings only stop moving when an admin runs `finalize-season`, which writes that moment's standings into `reward_payouts`. The leaderboard UI shows a "Live ranking · season ends &lt;date&gt;" indicator so players know the order is provisional until then.

Migration: `20260503000003_rank_by_total_score.sql`. Already-finalized historical seasons (rows in `reward_payouts` from before this migration) keep their original best-score-based ranks — only the live `leaderboard.rank` column is recomputed.

## Leaderboard Integrity (as of 2026-05, Task #32)
- **Atomic upsert**: `upsert_leaderboard_score` SQL function (SECURITY DEFINER) replaces the previous SELECT-then-UPDATE/INSERT sequence. Uses `INSERT … ON CONFLICT DO UPDATE` with arithmetic expressions so two concurrent submissions never double-count.
- **Auto-rank**: `trg_refresh_leaderboard_ranks` (AFTER INSERT OR UPDATE OF best_score, total_score, division) recomputes `RANK()` for the affected period, partitioned by `has_ever_owned_card` so FREE and NFT boards are ranked independently, ordered by `total_score` DESC (Task #46) with `best_score` DESC and `updated_at` ASC tie-breaks. Updating `rank` alone does not re-fire the trigger.
- **Auto-invalidate**: `trg_invalidate_leaderboard_on_flag` (AFTER INSERT on match_logs WHERE is_flagged) sets `leaderboard.validated = false` for the player+period row. A clean subsequent run does NOT auto-restore — admin resets manually.
- **Anti-cheat additions**: `tooShort` flag for runs < 10 s (10–20 s remain ineligible but unflagged). `scoreSpike` flag when a single run exceeds 3× the player's current period best_score (and best_score > 1 000). Existing flags: `highScorePerSecond` (>50 pts/s), `abnormalCombo`, `impossibleClears`, `staleSession`, `scoreWithoutProgress`.
- **UI**: `leaderboard.validated` is fetched and mapped. Rows with `validated = false` show an amber ⚠ indicator (tooltip explains review status). A footnote appears at the bottom of the table when any unvalidated entries are visible.
- **Polling**: `fetchLeaderboard` uses `AbortController` (stored in `fetchAbortRef`) so each new tick cancels any in-flight previous request. The interval cleanup also aborts on unmount / dep change.
- **Migration**: `20260502000003_leaderboard_integrity.sql` — adds function + 2 triggers + backfill for ranks and validated.

## Score Submission Flow (as of 2026-04)
1. `GameHUD` mounts → calls `generate-session` edge function → stores `{ sessionId, seed, cardId }` in a ref
2. Player plays → Phaser emits `matchEnd` event with score, level, combo stats
3. `GameHUD` calls `submit-score` edge function with `sessionId` + match stats
4. Server validates session, runs anti-cheat, writes to `match_logs`, updates `players` + `leaderboard`
5. Fallback: if not logged in or edge function unavailable, `logMatch()` (client-side) is called

## NFT Claim Flow (as of 2026-04)
1. Player opens Mint tab → NFTGrid loads live ERC-1155 data from Base via Thirdweb
2. Claim button shows: "Connect" if no wallet, "Sign In" if no Supabase session, "Claim" when ready
3. On click: `claimTo()` transaction is sent via `useSendAndConfirmTransaction` (waits for receipt)
4. On success: `mint_card_to_player` Postgres RPC inserts a `cards` row + initialises `card_energy`
5. `loadData()` is called to refresh My Cards immediately
- `cards.token_id` is NOT UNIQUE (dropped in migration 20260427000000) — the holding-limit trigger handles caps (10 total, 2 per token_id per player)
- `mint_card_to_player` is SECURITY DEFINER so it bypasses RLS (no admin role needed at call time)

## Google OAuth (Task #37)
Players can sign in with Google via Supabase OAuth — no wallet required. The
"Continue with Google" button on `/auth` and Marketplace → Profile calls
`supabase.auth.signInWithOAuth({ provider: 'google' })`. The existing
`handle_new_user` trigger creates the `players` row with the
`player_<8hex>` placeholder display_name, and MainMenu's onboarding gate
(`needsOnboarding`) prompts for a real nickname on first PLAY.

**Manual Supabase dashboard setup required (one-time):**
1. Authentication → Providers → Google → enable.
2. Paste the Google Cloud OAuth client ID and client secret.
3. Add the site origin (e.g. `https://<project>.replit.app/`) to the
   redirect URL allow-list. Local dev (`http://localhost:5000/`) too.
4. In Google Cloud Console, add Supabase's callback URL
   (`https://<project-ref>.supabase.co/auth/v1/callback`) as an authorized
   redirect URI on the OAuth client.

The Thirdweb in-app wallet's Google option remains for users who want a
wallet from day one — the two flows are independent.

## Web3 Config
- Chain: Base (chain ID 8453)
- NFT Collection: `0xa89C9d428321291fF9b3609D62861123690aa07e`
- Thirdweb Client ID: `0ee0974906e5b6b9d18c8f635d4a3df0` (public)
