// verify-nft-ownership — checks whether the caller owns any card in the given division.
// Off-chain source of truth: public.cards (cards table mirrors on-chain ownership).
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_DIVISIONS = new Set(['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v']);

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

  let body: { division?: string };
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const division = (body.division ?? '').trim();
  if (!VALID_DIVISIONS.has(division)) return json({ error: 'invalid_division' }, 400);

  const { data: player } = await admin
    .from('players')
    .select('id, wallet_address')
    .eq('user_id', userId)
    .single();
  if (!player) return json({ owns: false, cardIds: [], wallet: null });

  const { data: cards } = await admin
    .from('cards')
    .select('id, token_id, name')
    .eq('owner_player_id', player.id)
    .eq('division', division);

  return json({
    owns: (cards?.length ?? 0) > 0,
    cardIds: cards?.map((c) => c.id) ?? [],
    cards: cards ?? [],
    wallet: player.wallet_address ?? null,
    division,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
