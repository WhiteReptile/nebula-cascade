/**
 * matchLogger.ts — Client-side match result logging (fallback)
 *
 * NOTE: The primary match submission path is the `submit-score` edge function
 * which runs server-side with service role for anti-cheat. This client-side
 * logger exists as a fallback/development convenience.
 *
 * On match end:
 *   1. Computes survival time, combo efficiency, anti-cheat flags
 *   2. Inserts into `match_logs` table
 *   3. Updates player's division_points and division tier
 *   4. Upserts monthly leaderboard entry with avg_top3_score
 *
 * Anti-cheat flags (advisory, not blocking):
 *   - highScorePerSecond: >50 score/sec
 *   - abnormalCombo: combo > level × 8
 *   - impossibleClears: >2 lines/sec sustained
 */
import { supabase } from '@/integrations/supabase/client';
import { getDivisionForPoints, getCurrentPeriod } from './divisionSystem';

interface MatchData {
  score: number;
  level: number;
  maxCombo: number;
  comboPoints: number;
  omniColorCount: number;
  linesCleared: number;
  startedAt: Date;
  cardId?: string;
  sessionSeed?: string;
  sessionId?: string;
}

interface AntiCheatFlags {
  highScorePerSecond?: boolean;
  abnormalCombo?: boolean;
  impossibleClears?: boolean;
}

function computeAntiCheatFlags(data: MatchData, survivalSeconds: number): { flags: AntiCheatFlags; isFlagged: boolean } {
  const flags: AntiCheatFlags = {};
  if (survivalSeconds > 0 && data.score / survivalSeconds > 50) flags.highScorePerSecond = true;
  if (data.maxCombo > data.level * 8) flags.abnormalCombo = true;
  if (survivalSeconds > 10 && data.linesCleared / survivalSeconds > 2) flags.impossibleClears = true;
  const isFlagged = Object.values(flags).some(Boolean);
  return { flags, isFlagged };
}

async function computeAvgTop3(playerId: string): Promise<number> {
  const { data } = await supabase
    .from('match_logs')
    .select('score')
    .eq('player_id', playerId)
    .order('score', { ascending: false })
    .limit(3);

  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, row) => acc + Number(row.score), 0);
  return Math.floor(sum / data.length);
}

export async function logMatch(data: MatchData): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;

  const userId = userData.user.id;
  const { data: player } = await supabase
    .from('players')
    .select('id, division_points, total_matches')
    .eq('user_id', userId)
    .single();

  if (!player) return;

  const endedAt = new Date();
  const survivalSeconds = Math.floor((endedAt.getTime() - data.startedAt.getTime()) / 1000);
  const comboEfficiency = data.score > 0 ? data.comboPoints / data.score : 0;
  const { flags, isFlagged } = computeAntiCheatFlags(data, survivalSeconds);

  await supabase.from('match_logs').insert({
    player_id: player.id,
    score: data.score,
    level_reached: data.level,
    survival_time_seconds: survivalSeconds,
    max_combo: data.maxCombo,
    combo_efficiency: comboEfficiency,
    omni_color_count: data.omniColorCount,
    lines_cleared: data.linesCleared,
    anti_cheat_flags: flags as any,
    is_flagged: isFlagged,
    started_at: data.startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    card_id: data.cardId ?? null,
    session_seed: data.sessionSeed ?? null,
    session_id: data.sessionId ?? null,
  });

  // Update player stats
  const newPoints = player.division_points + data.score;
  const newDivision = getDivisionForPoints(newPoints);

  await supabase
    .from('players')
    .update({
      division_points: newPoints,
      division: newDivision,
      total_matches: player.total_matches + 1,
    })
    .eq('id', player.id);

  // Upsert leaderboard with avg_top3_score
  const period = getCurrentPeriod();
  const avgTop3 = await computeAvgTop3(player.id);

  const { data: existing } = await supabase
    .from('leaderboard')
    .select('id, total_score, best_score, matches_played')
    .eq('player_id', player.id)
    .eq('period', period)
    .single();

  if (existing) {
    await supabase
      .from('leaderboard')
      .update({
        total_score: existing.total_score + data.score,
        best_score: Math.max(existing.best_score, data.score),
        matches_played: existing.matches_played + 1,
        division: newDivision,
        avg_top3_score: avgTop3,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('leaderboard').insert({
      player_id: player.id,
      period,
      division: newDivision,
      total_score: data.score,
      best_score: data.score,
      matches_played: 1,
      avg_top3_score: avgTop3,
    });
  }
}
