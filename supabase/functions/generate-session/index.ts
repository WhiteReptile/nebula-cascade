/**
 * generate-session — Edge function: Create a new game session
 *
 * Called before each game starts. Enforces a 60-second cooldown
 * between sessions to prevent rapid-fire score farming.
 *
 * Flow:
 *   1. Authenticate user via JWT
 *   2. Look up player record and active card
 *   3. Check cooldown (60s since last session)
 *   4. Generate unique session ID + seed
 *   5. Insert into `game_sessions` table
 *   6. Return { sessionId, seed, cardId }
 *
 * The seed is used for deterministic RNG validation (future).
 * The sessionId is required by submit-score to validate the match.
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

    // Get player
    const { data: player } = await supabase
      .from("players")
      .select("id, active_card_id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return new Response(JSON.stringify({ error: "No player profile" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check 60s cooldown
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: lastSession } = await serviceClient
      .from("game_sessions")
      .select("started_at")
      .eq("player_id", player.id)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (lastSession) {
      const elapsed = Date.now() - new Date(lastSession.started_at).getTime();
      if (elapsed < 60000) {
        const remaining = Math.ceil((60000 - elapsed) / 1000);
        return new Response(JSON.stringify({ error: "Cooldown active", remaining }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate session
    const seed = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    await serviceClient.from("game_sessions").insert({
      id: sessionId,
      player_id: player.id,
      card_id: player.active_card_id,
      seed,
      completed: false,
    });

    return new Response(JSON.stringify({ sessionId, seed, cardId: player.active_card_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
