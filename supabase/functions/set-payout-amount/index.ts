// set-payout-amount — admin sets reward_amount_cents on a pending payout row.
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

  const { data: isAdmin } = await admin.rpc('has_role', {
    _user_id: claims.claims.sub,
    _role: 'admin',
  });
  if (!isAdmin) return json({ error: 'forbidden_admin_only' }, 403);

  let body: { payout_id?: string; amount_cents?: number };
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }

  const payoutId = (body.payout_id ?? '').trim();
  const amountCents = Number(body.amount_cents);
  if (!payoutId) return json({ error: 'missing_payout_id' }, 400);
  if (!Number.isFinite(amountCents) || amountCents < 0 || amountCents > 1_000_000_000) {
    return json({ error: 'invalid_amount' }, 400);
  }

  const { data: payout } = await admin
    .from('reward_payouts')
    .select('id, status')
    .eq('id', payoutId)
    .single();
  if (!payout) return json({ error: 'payout_not_found' }, 404);
  if (payout.status !== 'pending') return json({ error: `cannot_modify_status_${payout.status}` }, 409);

  const { error: updErr } = await admin
    .from('reward_payouts')
    .update({ reward_amount_cents: Math.floor(amountCents) })
    .eq('id', payoutId)
    .eq('status', 'pending');
  if (updErr) return json({ error: updErr.message }, 500);

  return json({ ok: true, payout_id: payoutId, amount_cents: Math.floor(amountCents) });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
