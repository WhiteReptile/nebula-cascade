## Leaderboard v2 — Logic + Visual Overhaul

### 1. Tab structure (top nav)

Replace today's `FREE / NFT / ALL` with:

```text
[ NO NFT ]  [ NFT ]  [ GUESTS ]  [ ALL ]
```

- **NO NFT** — logged-in players (email or wallet) who don't own a card. Single global ranking, no divisions. Eligible for future rewards (rewards launch in ~2 months — UI shows a "Rewards: Coming Soon" chip, no payout logic yet).
- **NFT** — card owners. Keeps the 5 divisions (Gem I–V) exactly as today. Defaults to the player's own active division when they land.
- **GUESTS** — anonymous nickname players. **No divisions.** Only entries with score ≥ 2,000 are shown. **Every row auto-deletes 24 h after it was set.** No persistence, no rewards, ever.
- **ALL** — display-only mix of NO NFT + NFT (guests excluded, since they vanish in 24h and would pollute history). No rewards.

The word "FREE" is removed everywhere — replaced by the segment name.

### 2. Guest flow (new)

When a visitor with no account clicks **Play** on the main menu:

1. Modal: "Enter a nickname to play" (3–16 chars, no profanity, uniqueness not enforced — device-bound).
2. Nickname + a device fingerprint (`localStorage` UUID) are stored locally.
3. Session runs as a Supabase **anonymous** identity OR via a new edge function `submit-guest-score` that takes `{nickname, device_id, score, session_proof}` and writes to a new `guest_scores` table.
4. At game over, if score ≥ 2,000 → row inserted into `guest_scores` with `expires_at = now() + 24h`.
5. A pg_cron job (every 15 min) deletes rows where `expires_at < now()`.
6. Same device + same nickname overwrites the previous entry only if the new score is higher (prevents spam from one device).

NFT and NO-NFT player scores are **never** purged by this job — only `guest_scores`.

### 3. Visual direction — "Dense Data Terminal"

Compact, monospace, sortable. Inspired by Bloomberg / arcade hi-score screens.

```text
┌─ LEADERBOARD ─────────────────── PERIOD 2026-05 ──────────┐
│  NO NFT │ NFT │ GUESTS* │ ALL                              │
├──────────────────────────────────────────────────────────────┤
│ DIVISION: ▸ GEM I  GEM II  GEM III  GEM IV  GEM V          │  ← only on NFT tab
├──────────────────────────────────────────────────────────────┤
│ #   PLAYER              AVG3       BEST      MATCHES  TREND │
│ 01  ▲ SOLAR_FOX  [GI]   142,300    198,440   47       ▁▃▅█  │
│ 02  ─ NIGHTSHADE [GI]   139,210    187,002   52       ▂▄▅▆  │
│ 03  ▼ KAI42      [GI]   136,889    190,114   61       ▆▅▃▁  │
│ ...                                                          │
│ 07  ★ YOU        [GI]    98,400    132,500   23       ▂▃▄▅  │
└──────────────────────────────────────────────────────────────┘
*GUESTS auto-clear every 24h. Top entry only stored if ≥ 2,000 pts.
```

Key visual elements:
- JetBrains Mono everywhere; tighter line-height; uppercase column heads.
- Each row 28px tall, alternating subtle row tint, neon division dot on the left.
- Sparkline column = last 7 matches (avg score trend) — sourced from `match_logs`.
- Rank delta arrows (▲/▼/─) vs last refresh.
- "★ YOU" row is sticky-pinned to bottom if player is outside top 50.
- Sortable column headers (Avg3 default, click to toggle Best / Matches).
- Header switches accent colour per tab: NO NFT = cyan, NFT = gold, GUESTS = magenta, ALL = white.

### 4. Logic fixes
- **Division filter only renders on the NFT tab.** NO NFT, GUESTS, ALL show one flat ranking (this fixes the bug where clicking FREE still showed divisions).
- NO NFT tab queries `leaderboard` joined with `players` where `has_ever_owned_card = false`, ignoring `division`.
- NFT tab keeps current behaviour but auto-selects `players.division` for the signed-in player.
- ALL tab unions NO NFT + NFT rows, no division filter, capped at top 100.
- Segment chip in the header reflects the **viewer's** segment (NO NFT / NFT / GUEST), independent of which tab is active.

### 5. Technical changes (collapsible — for the dev)

```text
DB migration:
  - CREATE TABLE guest_scores (
      id uuid pk,
      nickname text,
      device_id text,
      score bigint,
      level_reached int,
      survival_seconds int,
      created_at timestamptz default now(),
      expires_at timestamptz default now() + interval '24 hours'
    )
  - UNIQUE (device_id, nickname)
  - RLS: SELECT public; INSERT via edge function only.
  - CHECK trigger: score >= 2000.
  - pg_cron job 'purge-guest-scores' every 15 min.

Edge function:
  - submit-guest-score (verify session_proof, upsert if new score > old).

Frontend:
  - src/pages/Leaderboard.tsx  → full rewrite with new tab logic.
  - src/components/leaderboard/  (new dir)
      LeaderboardTable.tsx, Sparkline.tsx, RankDelta.tsx, GuestNicknameModal.tsx, TabBar.tsx.
  - src/lib/playerSegmentation.ts → add 'guest' segment.
  - src/lib/guestSession.ts (new) → nickname + device_id helpers.
  - Index.tsx Play button → if no auth, opens GuestNicknameModal.

Out of scope (this pass):
  - Actual reward payout logic for NO NFT (placeholder UI only).
  - Marketplace V3 integration (parked).
  - Anti-cheat hardening for guest scores beyond existing session_proof.
```

### 6. Open question I'll default unless told otherwise
Sparkline source = last 7 `match_logs` rows for that player. If you want it shorter (last 3) or hidden on the GUESTS tab, say so before approval; otherwise I'll ship the 7-match version.
