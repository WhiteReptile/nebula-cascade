

# Difficulty Rebalance — Reduce Explosion Frequency

## Problem
Too many explosions trigger because thresholds are too low and color distribution is too clustered. The 35% color-repeat bias + lucky piece every 15 spawns creates same-color clusters constantly, making proximity bursts (threshold: 5) fire almost every few pieces.

## Changes

### 1. Raise Proximity Burst threshold: 5 → 7
**File**: `src/game/logic/chainResolver.ts`
Change `cluster.length >= 5` to `cluster.length >= 7`. Clusters of 7+ are meaningfully harder to form — still achievable but feel earned.

### 2. Reduce color-repeat bias: 35% → 20%
**File**: `src/game/pieces.ts`
Change `Math.random() < 0.35` to `Math.random() < 0.20`. Less same-color clustering on the board.

### 3. Reduce lucky piece frequency and probability
**File**: `src/game/pieces.ts`
Change from every 15 spawns at 70% to every 25 spawns at 50%. Still provides occasional helpful pieces but far less often.

### 4. Raise line match requirement: 3 → 4 same-color consecutive full rows
**File**: `src/game/logic/chainResolver.ts` — `findLineMatch`
Change `sameColorRun.length >= 3` to `sameColorRun.length >= 4`. Completing 4 consecutive same-dominant-color full rows is a real achievement.

### 5. Increase base gravity slightly
**File**: `src/game/GameScene.ts`
Change `BASE_GRAVITY` from `0.0014` to `0.002`. Pieces fall ~40% faster from the start — still comfortable but less time to plan.

### 6. Start urgency earlier: 80s → 60s
**File**: `src/game/GameScene.ts`
Change `URGENCY_START` from `80` to `60`. Tension builds sooner.

## Summary of Value Changes

| Parameter | Before | After |
|-----------|--------|-------|
| Proximity Burst threshold | 5 orbs | 7 orbs |
| Color repeat bias | 35% | 20% |
| Lucky piece interval | every 15, 70% | every 25, 50% |
| Line match (same-color rows) | 3 rows | 4 rows |
| Base gravity | 0.0014 | 0.002 |
| Urgency start | 80s | 60s |

## Files Modified

| File | Change |
|------|--------|
| `src/game/logic/chainResolver.ts` | Raise proximity burst to 7, line match to 4 |
| `src/game/pieces.ts` | Lower color bias to 20%, lucky piece to every 25 at 50% |
| `src/game/GameScene.ts` | Raise BASE_GRAVITY to 0.002, URGENCY_START to 60 |

