// finalize-season — admin closes the current reward_period, snapshots leaderboard
// per division, generates reward_payouts rows, and opens the next period.
// Off-chain only: no on-chain TX. Amounts default to 0 (use set-payout-amount).
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DIVISIONS = ['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v'] as const;
const TOP_N_PER_DIVISION = 10;
const SEASON_DAYS = 40;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
    authHeader.replace('Bearer ', ''),
  );
  if (claimsErr || !claims?.claims?.sub) return json({ error: 'unauthorized' }, 401);

  // Admin check
  const { data: isAdmin } = await admin.rpc('has_role', {
    _user_id: claims.claims.sub,
    _role: 'admin',
  });
  if (!isAdmin) return json({ error: 'forbidden_admin_only' }, 403);

  let body: { period_id?: string };
  try { body = await req.json(); } catch { body = {}; }

  // Find target period
  let period;
  if (body.period_id) {
    const { data } = await admin.from('reward_periods').select('*').eq('id', body.period_id).single();
    period = data;
  } else {
    const { data } = await admin
      .from('reward_periods')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    period = data;
  }
  if (!period) return json({ error: 'no_period' }, 404);
  if (period.status === 'finalized') return json({ error: 'already_finalized' }, 409);

  // Snapshot leaderboard per division for this period
  const allPayouts: Array<{
    player_id: string;
    division: string;
    rank: number;
    reward_amount_cents: number;
    reward_period_id: string;
    status: string;
  }> = [];

  for (const division of DIVISIONS) {
    const { data: rows } = await admin
      .from('leaderboard')
      .select('player_id, rank')
      .eq('period', period.period)
      .eq('division', division)
      .not('rank', 'is', null)
      .order('rank', { ascending: true })
      .limit(TOP_N_PER_DIVISION);

    if (!rows) continue;
    for (const row of rows) {
      allPayouts.push({
        player_id: row.player_id,
        division,
        rank: row.rank!,
        reward_amount_cents: 0, // set later via set-payout-amount
        reward_period_id: period.id,
        status: 'pending',
      });
    }
  }

  if (allPayouts.length > 0) {
    const { error: insErr } = await admin.from('reward_payouts').insert(allPayouts);
    if (insErr) return json({ error: insErr.message }, 500);
  }

  // Mark period finalized
  const { error: finErr } = await admin
    .from('reward_periods')
    .update({ status: 'finalized', finalized_at: new Date().toISOString() })
    .eq('id', period.id);
  if (finErr) return json({ error: finErr.message }, 500);

  // Open next period
  const now = new Date();
  const ends = new Date(now.getTime() + SEASON_DAYS * 24 * 60 * 60 * 1000);
  const periodLabel = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-S${now.getUTCDate()}`;
  const { data: next, error: nextErr } = await admin.from('reward_periods').insert({
    period: periodLabel,
    status: 'open',
    starts_at: now.toISOString(),
    ends_at: ends.toISOString(),
  }).select().single();
  if (nextErr) console.warn('next_period_insert_failed', nextErr.message);

  return json({
    ok: true,
    finalized_period_id: period.id,
    payouts_created: allPayouts.length,
    next_period_id: next?.id ?? null,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
