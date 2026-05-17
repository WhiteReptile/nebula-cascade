import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GuestPayload {
  nickname?: string
  device_id?: string
  score?: number
  level_reached?: number
  survival_seconds?: number
}

const NICK_RE = /^[A-Za-z0-9_-]{3,16}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: GuestPayload
  try { body = await req.json() } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const nickname = (body.nickname ?? '').trim()
  const device_id = (body.device_id ?? '').trim()
  const score = Number(body.score ?? 0)
  const level_reached = Math.max(1, Math.floor(Number(body.level_reached ?? 1)))
  const survival_seconds = Math.max(0, Math.floor(Number(body.survival_seconds ?? 0)))

  if (!NICK_RE.test(nickname)) return json({ error: 'invalid_nickname' }, 400)
  if (!device_id || device_id.length < 8 || device_id.length > 128) return json({ error: 'invalid_device' }, 400)
  if (!Number.isFinite(score) || score < 2000 || score > 100_000_000) return json({ error: 'score_below_threshold' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Upsert keyed on (device_id, nickname); only overwrite if new score is higher.
  const { data: existing } = await supabase
    .from('guest_scores')
    .select('id, score')
    .eq('device_id', device_id)
    .eq('nickname', nickname)
    .maybeSingle()

  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  if (existing) {
    if (score <= existing.score) {
      return json({ ok: true, updated: false, reason: 'lower_than_existing' })
    }
    const { error } = await supabase
      .from('guest_scores')
      .update({ score, level_reached, survival_seconds, expires_at, created_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, updated: true })
  }

  const { error } = await supabase.from('guest_scores').insert({
    nickname, device_id, score, level_reached, survival_seconds, expires_at,
  })
  if (error) return json({ error: error.message }, 500)

  // opportunistic purge
  await supabase.rpc('purge_expired_guest_scores').catch?.(() => {})

  return json({ ok: true, updated: true, created: true })
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
