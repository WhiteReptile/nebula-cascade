

# Leaderboard + Rewards Architecture Plan

## Overview

Build a modular leaderboard and rewards system for Cosmic Orbs with Lovable Cloud (Supabase) as the backend. The game remains fully playable without rewards enabled.

## Architecture

```text
┌─────────────────────────────────────────────────┐
│                  FRONTEND                        │
│  GameScene → MatchLogger → Supabase             │
│  LeaderboardPage (per-division rankings)         │
│  RewardsAdminPage (validate + export payouts)    │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              SUPABASE (Lovable Cloud)            │
│  Tables: players, match_logs, leaderboard,      │
│          reward_periods, reward_payouts          │
│  Edge Functions: validate-match, process-rewards │
│  RLS: per-player read/write, admin-only rewards  │
└─────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│         EXTERNAL (integration hooks only)        │
│  Stripe / Coinbase / Circle / Thirdweb           │
│  (payout data exported, not processed in-app)    │
└─────────────────────────────────────────────────┘
```

## Database Schema

### Tables

1. **players** — player profiles and division tracking
   - `id` (uuid, FK auth.users), `display_name`, `division` (enum: pearl_v → pearl_i), `division_points`, `created_at`, `is_banned`

2. **match_logs** — every completed game session
   - `id`, `player_id` (FK), `score`, `level_reached`, `survival_time_seconds`, `max_combo`, `combo_efficiency`, `tri_color_count`, `lines_cleared`, `started_at`, `ended_at`, `anti_cheat_flags` (jsonb)

3. **leaderboard** — aggregated rankings per division per period
   - `id`, `player_id`, `period` (e.g. "2026-W15"), `division`, `total_score`, `best_score`, `matches_played`, `rank`, `validated` (boolean)

4. **reward_periods** — weekly/periodic reward cycles
   - `id`, `period`, `status` (open/validating/finalized), `created_at`, `finalized_at`

5. **reward_payouts** — export-ready payout records
   - `id`, `reward_period_id`, `player_id`, `division`, `rank`, `reward_amount_cents`, `payout_method` (stripe/coinbase/circle/thirdweb), `status` (pending/approved/exported/paid), `exported_at`

### Division Enum
```sql
CREATE TYPE pearl_division AS ENUM ('pearl_v', 'pearl_iv', 'pearl_iii', 'pearl_ii', 'pearl_i');
```

## Anti-Cheat Flags

Computed client-side at match end and validated server-side:
- **Score-to-time ratio**: flag if score/survival_time exceeds threshold
- **Combo anomaly**: flag if max_combo > reasonable cap for the level reached
- **Impossible clears**: flag if lines_cleared vs survival_time is impossible
- Flags stored as JSONB on `match_logs`, blocking reward eligibility

## Implementation Steps

### Step 1: Enable Lovable Cloud + Create Database Schema
- Enable Supabase via Lovable Cloud
- Create all tables with migrations, RLS policies, and the division enum

### Step 2: Match Logging System
- Create `src/lib/matchLogger.ts` — captures match data from GameScene events
- On game over, compute anti-cheat flags and insert into `match_logs`
- Track survival time (start/end timestamps) in GameScene

### Step 3: Player Profile + Division System
- Auto-create player profile on first game
- Division promotion/demotion based on cumulative score thresholds
- Display current division in GameHUD

### Step 4: Leaderboard Page
- New route `/leaderboard` with division-segmented tabs
- Query leaderboard table grouped by period + division
- Show rank, player name, best score, matches played, combo efficiency

### Step 5: Reward Distribution Module
- Edge function `process-rewards`: selects top N players per division, calculates reward amounts by rank + division tier, inserts into `reward_payouts`
- Reward calculation: flat tiers (e.g. Pearl I 1st = $50, 2nd = $30... Pearl V 1st = $10)
- Requires `reward_period` to be in "validating" status and all matches validated

### Step 6: Payout Export + Integration Hooks
- Edge function `export-payouts`: returns CSV/JSON of approved payouts with player ID, amount, method
- `src/lib/payoutIntegrations.ts` — stub interfaces for Stripe, Coinbase, Circle, Thirdweb
- Each stub has a `preparePayout(data)` method ready for future implementation
- Admin UI button to export payout data

### Step 7: Admin Rewards Page
- New route `/admin/rewards` — view reward periods, validate matches, approve payouts, export
- Protected by admin role check

### Step 8: Navigation Updates
- Add nav to leaderboard from game over screen and HUD
- Game remains fully playable without auth (scores just won't be tracked)

## Technical Details

- **Division thresholds**: Pearl V (0-5000), IV (5001-15000), III (15001-35000), II (35001-70000), I (70001+) cumulative points
- **Combo efficiency**: total combo points / total points — measures skill vs chain reliance
- **Reward caps per division** are configurable in a constants file
- **NFT-ready**: `reward_payouts.payout_method` includes "thirdweb"; `players` table can later link to wallet addresses
- **Weekly periods**: derived from ISO week numbers

## Files to Create/Modify

- **New**: `src/lib/matchLogger.ts`, `src/lib/divisionSystem.ts`, `src/lib/payoutIntegrations.ts`, `src/pages/Leaderboard.tsx`, `src/pages/AdminRewards.tsx`, `src/components/DivisionBadge.tsx`
- **Modify**: `src/game/GameScene.ts` (emit match data on game over), `src/components/GameHUD.tsx` (show division), `src/App.tsx` (add routes)
- **Supabase**: 5 migration files, 2 edge functions

