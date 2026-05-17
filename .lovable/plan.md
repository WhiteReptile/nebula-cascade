# Backend Cleanup + Rewards/NFT Edge Functions

Ten requested items, grouped by area. A few have important caveats up front — please read those first.

---

## ⚠️ Items that don't apply as written

1. **"Configure Site URL / redirect URLs on the live Supabase project"** — not needed. This project uses **Lovable Cloud's managed Google OAuth broker** (`src/integrations/lovable/index.ts` → `lovable.auth.signInWithOAuth`). The redirect goes through `oauth.lovable.app` and lands back at `window.location.origin`. There is no manual Site URL / redirect URL list to maintain, and no localhost bounce possible from the managed flow. ✅ Nothing to do.

2. **"Add Lovable Cloud redirect URI to Google Cloud Console"** — also not needed for the same reason. The managed broker uses Lovable's own Google OAuth client. You only do Google Cloud Console work if you switch to BYO Google credentials (which I do **not** recommend right now). ✅ Nothing to do.

3. **"Register GitHub / Twitter / Spotify OAuth apps"** — Lovable Cloud only supports **Google + Apple** natively. Per your answer: I'll **remove all GitHub/Twitter/Spotify code paths** and add a HANDOFF.md note that adding those providers requires migrating to a self-hosted Supabase project.

---

## What I'll actually build

### 1. Energy system — true rolling 24h per action, auth-only
**File:** `src/lib/energySystem.ts`

Current bug: `next_reset_at` is only stamped when energy hits 0, so two consumes in one window share a single reset clock. Spec says "rolling 24h per action."

Fix: every `consumeCardEnergy()` call stamps `next_reset_at = now + 24h` regardless of remaining energy. The lazy refill in `getCardEnergy()` already works correctly — keep it.

Guests: energy is gated behind RLS that requires `auth.uid()` → guests can't hit these tables. I'll add an explicit `isLoggedIn` guard in the call sites (`GameScene` / pre-match flow) so guest matches **skip the energy check entirely**, never calling `getCardEnergy`/`consumeCardEnergy`. No DB change needed.

### 2. Missing DB triggers (verified absent — `<db-triggers>` is empty)

Migration will:
- **Attach** the existing `enforce_max_cards_per_player()` function as a `BEFORE INSERT OR UPDATE` trigger on `cards` (function exists, trigger doesn't — that's the gap).
- **Create** `enforce_sale_lock()` trigger function on `cards`: when `owner_player_id` or `owner_wallet` changes (transfer/sale), or when a `marketplace_listings` row is inserted referencing the card, set `cards.sale_lock_until = now() + 24h`. Reject transfers while `sale_lock_until > now()`.

### 3. Four new Edge Functions (off-chain, full DB logic)

All deployed with in-code JWT validation via `getClaims()`; admin-only ones check `has_role(uid, 'admin')`.

- **`claim-reward`** (user) — validates the caller owns a `reward_payouts` row with `status='pending'`, marks it `status='claimed'`, stamps `claimed_at`. Returns amount + division. No on-chain TX.
- **`finalize-season`** (admin) — closes the current `reward_periods` row (`status='finalized'`, `finalized_at=now()`), snapshots final leaderboard per division, inserts `reward_payouts` rows for top-N per division using the `MAIN_CARD_SHARE_PERCENT` / `SECONDARY_CARD_SHARE_PERCENT` split from `economyConfig.ts`, opens next period.
- **`set-payout-amount`** (admin) — sets/updates `reward_amount_cents` on a given `reward_payouts` row before claim. Rejects if `status != 'pending'`.
- **`verify-nft-ownership`** (user) — input: `{ division }`. Returns `{ owns: boolean, cardIds: [] }` by querying `cards` where `owner_player_id = caller's player.id` and `division = $1`. Pure DB check — division gating doesn't need on-chain reads since `cards` table is the source of truth in the off-chain model.

### 4. Resend SMTP for auth emails

- Connect Resend via `standard_connectors--connect`.
- Set up a sender domain through Lovable's email infra (`email_domain--check_email_domain_status` → setup dialog if missing).
- Scaffold auth email templates branded to Nebula Cascade (`scaffold_auth_email_templates`), deploy `auth-email-hook`.

Note: if you want emails to literally route through your Resend account rather than Lovable's managed mailer, that requires switching off Lovable Emails — I'll do whichever you confirm. **Default plan: use Lovable Emails infra** (built on the same deliverability rails) since you have it for free here. Tell me if you'd rather we route through Resend directly.

### 5. Remove unused OAuth providers
Grep + remove GitHub/Twitter/Spotify references from `src/pages/Auth.tsx`, `src/lib/auth.ts`, any menu components. Append a section to `HANDOFF.md` explaining the Lovable Cloud limitation and the migration path.

### 6. One-time orphan cleanup
Query `auth.users` for rows where `email_confirmed_at IS NULL AND created_at < now() - interval '7 days'`. Show you the list first, then delete via admin RPC. No recurring cron.

---

## Technical details (for reference)

```text
Edge function tree after this change:
supabase/functions/
├── generate-session/      (existing)
├── submit-score/          (existing)
├── submit-guest-score/    (existing)
├── auth-email-hook/       (NEW — scaffolded)
├── claim-reward/          (NEW)
├── finalize-season/       (NEW)
├── set-payout-amount/     (NEW)
└── verify-nft-ownership/  (NEW)
```

Migration order:
1. Attach `enforce_max_cards_per_player` trigger
2. Add `sale_lock_until` enforcement trigger
3. (no schema changes needed for the edge functions — tables already exist)

Files touched:
- `src/lib/energySystem.ts` — stamp `next_reset_at` on every consume
- `src/game/GameScene.ts` (or pre-match hook) — skip energy for guests
- `src/pages/Auth.tsx`, `src/lib/auth.ts` — strip GitHub/Twitter/Spotify
- `HANDOFF.md` — note on social provider limitation
- 5 new `supabase/functions/<name>/index.ts`

---

**One thing to confirm before I start:** for Resend — do you want emails routed through **your Resend account** (requires disabling Lovable Emails, you bring API key), or just use **Lovable Emails infra** (works out of the box, same deliverability)? I'll default to Lovable Emails unless you say otherwise.