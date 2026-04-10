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
}

interface AntiCheatFlags {
  highScorePerSecond?: boolean;
  abnormalCombo?: boolean;
  impossibleClears?: boolean;
}

function computeAntiCheatFlags(data: MatchData, survivalSeconds: number): { flags: AntiCheatFlags; isFlagged: boolean } {
  const flags: AntiCheatFlags = {};

  // Score-to-time ratio check
  if (survivalSeconds > 0 && data.score / survivalSeconds > 50) {
    flags.highScorePerSecond = true;
  }

  // Combo anomaly — max combo shouldn't exceed level * 8
  if (data.maxCombo > data.level * 8) {
    flags.abnormalCombo = true;
  }

  // Impossible clears — more than 2 lines/second sustained
  if (survivalSeconds > 10 && data.linesCleared / survivalSeconds > 2) {
    flags.impossibleClears = true;
  }

  const isFlagged = Object.values(flags).some(Boolean);
  return { flags, isFlagged };
}

export async function logMatch(data: MatchData): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return; // not logged in — skip silently

  const userId = userData.user.id;

  // Get player record
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

  // Insert match log
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

  // Upsert leaderboard
  const period = getCurrentPeriod();
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
    });
  }
}
