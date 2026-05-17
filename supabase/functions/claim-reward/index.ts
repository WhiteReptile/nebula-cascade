// claim-reward — user marks a pending reward_payouts row as claimed.
// Off-chain: no blockchain TX; status transitions pending -> claimed.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
  const userId = claims.claims.sub as string;

  let body: { payout_id?: string };
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const payoutId = (body.payout_id ?? '').trim();
  if (!payoutId) return json({ error: 'missing_payout_id' }, 400);

  // Look up player_id for this user
  const { data: player } = await admin.from('players').select('id').eq('user_id', userId).single();
  if (!player) return json({ error: 'no_player' }, 404);

  // Find payout, verify ownership + status
  const { data: payout, error: payoutErr } = await admin
    .from('reward_payouts')
    .select('id, player_id, status, reward_amount_cents, division, rank')
    .eq('id', payoutId)
    .single();
  if (payoutErr || !payout) return json({ error: 'payout_not_found' }, 404);
  if (payout.player_id !== player.id) return json({ error: 'forbidden' }, 403);
  if (payout.status !== 'pending') return json({ error: `cannot_claim_status_${payout.status}` }, 409);
  if (!payout.reward_amount_cents || payout.reward_amount_cents <= 0) {
    return json({ error: 'amount_not_set' }, 409);
  }

  const { error: updErr } = await admin
    .from('reward_payouts')
    .update({ status: 'claimed', exported_at: new Date().toISOString() })
    .eq('id', payoutId)
    .eq('status', 'pending'); // race-safe
  if (updErr) return json({ error: updErr.message }, 500);

  return json({
    ok: true,
    amount_cents: payout.reward_amount_cents,
    division: payout.division,
    rank: payout.rank,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
