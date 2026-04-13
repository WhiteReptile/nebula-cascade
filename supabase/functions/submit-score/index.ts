/**
 * submit-score — Edge function: Validate and record match results
 *
 * Called when a game ends. Uses service role for trusted writes.
 *
 * Flow:
 *   1. Authenticate user via JWT
 *   2. Validate session (must exist, belong to player, not completed)
 *   3. Compute anti-cheat flags (score/sec, combo ratio, clear rate)
 *   4. Insert match_log with all stats
 *   5. Update player division_points and division tier
 *   6. Compute avg_top3_score from best 3 matches
 *   7. Upsert monthly leaderboard entry
 *   8. Mark session as completed with 60s cooldown
 *
 * Returns: { success, isFlagged, avgTop3, division }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.103.0/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { sessionId, score, level, maxCombo, comboPoints, omniColorCount, linesCleared, startedAt } = body;

    if (!sessionId || score === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get player
    const { data: player } = await serviceClient
      .from("players")
      .select("id, division_points, total_matches")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return new Response(JSON.stringify({ error: "No player profile" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate session
    const { data: session } = await serviceClient
      .from("game_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("player_id", player.id)
      .eq("completed", false)
      .single();

    if (!session) {
      return new Response(JSON.stringify({ error: "Invalid or completed session" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endedAt = new Date().toISOString();
    const startTime = new Date(startedAt || session.started_at);
    const survivalSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const comboEfficiency = score > 0 ? (comboPoints || 0) / score : 0;

    // Anti-cheat flags
    const flags: Record<string, boolean> = {};
    if (survivalSeconds > 0 && score / survivalSeconds > 50) flags.highScorePerSecond = true;
    if ((maxCombo || 0) > (level || 1) * 8) flags.abnormalCombo = true;
    if (survivalSeconds > 10 && (linesCleared || 0) / survivalSeconds > 2) flags.impossibleClears = true;
    const isFlagged = Object.values(flags).some(Boolean);

    // Insert match log
    await serviceClient.from("match_logs").insert({
      player_id: player.id,
      score,
      level_reached: level || 1,
      survival_time_seconds: survivalSeconds,
      max_combo: maxCombo || 0,
      combo_efficiency: comboEfficiency,
      omni_color_count: omniColorCount || 0,
      lines_cleared: linesCleared || 0,
      anti_cheat_flags: flags,
      is_flagged: isFlagged,
      started_at: startTime.toISOString(),
      ended_at: endedAt,
      card_id: session.card_id,
      session_seed: session.seed,
      session_id: sessionId,
    });

    // Update player stats
    const DIVISION_THRESHOLDS = [
      { division: "gem_i", minPoints: 70001 },
      { division: "gem_ii", minPoints: 35001 },
      { division: "gem_iii", minPoints: 15001 },
      { division: "gem_iv", minPoints: 5001 },
      { division: "gem_v", minPoints: 0 },
    ];

    const newPoints = player.division_points + score;
    let newDivision = "gem_v";
    for (const { division, minPoints } of DIVISION_THRESHOLDS) {
      if (newPoints >= minPoints) { newDivision = division; break; }
    }

    await serviceClient.from("players").update({
      division_points: newPoints,
      division: newDivision,
      total_matches: player.total_matches + 1,
    }).eq("id", player.id);

    // Compute avg top 3
    const { data: topScores } = await serviceClient
      .from("match_logs")
      .select("score")
      .eq("player_id", player.id)
      .order("score", { ascending: false })
      .limit(3);

    const avgTop3 = topScores && topScores.length > 0
      ? Math.floor(topScores.reduce((s, r) => s + Number(r.score), 0) / topScores.length)
      : 0;

    // Upsert leaderboard
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: existing } = await serviceClient
      .from("leaderboard")
      .select("id, total_score, best_score, matches_played")
      .eq("player_id", player.id)
      .eq("period", period)
      .single();

    if (existing) {
      await serviceClient.from("leaderboard").update({
        total_score: existing.total_score + score,
        best_score: Math.max(existing.best_score, score),
        matches_played: existing.matches_played + 1,
        division: newDivision,
        avg_top3_score: avgTop3,
      }).eq("id", existing.id);
    } else {
      await serviceClient.from("leaderboard").insert({
        player_id: player.id,
        period,
        division: newDivision,
        total_score: score,
        best_score: score,
        matches_played: 1,
        avg_top3_score: avgTop3,
      });
    }

    // Mark session completed
    await serviceClient.from("game_sessions").update({
      completed: true,
      cooldown_until: new Date(Date.now() + 60000).toISOString(),
    }).eq("id", sessionId);

    return new Response(JSON.stringify({ success: true, isFlagged, avgTop3, division: newDivision }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
