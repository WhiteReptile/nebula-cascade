/**
 * Leaderboard v2 — "Dense Data Terminal"
 *
 * Tabs:
 *   NO NFT  → logged-in players with has_ever_owned_card = false. Flat ranking, no divisions.
 *   NFT     → card owners. Filtered by division (Gem I–V), defaults to player's division.
 *   GUESTS  → anonymous nickname players. Score ≥ 2,000, rows auto-purge after 24h.
 *   ALL     → display-only union of NO NFT + NFT (guests excluded).
 *
 * The word "FREE" is gone — both NO NFT and GUESTS are free, segmentation
 * is now explicit by account type.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DIVISION_LABELS, DIVISION_COLORS, getCurrentPeriod, type Division } from '@/lib/divisionSystem';
import SEO from '@/components/SEO';

type BoardTab = 'no_nft' | 'nft' | 'guests' | 'all';
type SortKey = 'avg_top3_score' | 'best_score' | 'matches_played';

const DIVISIONS: Division[] = ['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v'];

const TAB_META: Record<BoardTab, { label: string; accent: string; chip: string; desc: string }> = {
  no_nft: { label: 'NO NFT',  accent: '#00e5ff', chip: 'cyan',    desc: 'Account holders without cards · rewards launching soon' },
  nft:    { label: 'NFT',     accent: '#ffd24a', chip: 'gold',    desc: 'Card owners · ranked per division' },
  guests: { label: 'GUESTS',  accent: '#ff52c8', chip: 'magenta', desc: 'Anonymous · score ≥ 2,000 · entries clear after 24h' },
  all:    { label: 'ALL',     accent: '#e6e6f0', chip: 'white',   desc: 'Combined accounts (guests excluded) · display only' },
};

interface Row {
  rank: number;
  name: string;
  avg_top3_score: number;
  best_score: number;
  matches_played: number;
  division?: Division | null;
  isYou?: boolean;
  trend?: number[];
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const period = getCurrentPeriod();

  const [tab, setTab] = useState<BoardTab>('no_nft');
  const [division, setDivision] = useState<Division>('gem_iii');
  const [sortKey, setSortKey] = useState<SortKey>('avg_top3_score');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [meSegment, setMeSegment] = useState<'no_nft' | 'nft' | 'guest'>('guest');
  const [mePlayerId, setMePlayerId] = useState<string | null>(null);

  // Detect viewer segment & default tab
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMeSegment('guest'); setTab('guests'); return; }
      const { data: player } = await supabase
        .from('players')
        .select('id, division, has_ever_owned_card')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!player) { setMeSegment('guest'); setTab('guests'); return; }
      setMePlayerId(player.id);
      if (player.has_ever_owned_card) {
        setMeSegment('nft');
        setTab('nft');
        if (player.division) setDivision(player.division as Division);
      } else {
        setMeSegment('no_nft');
        setTab('no_nft');
      }
    })();
  }, []);

  // Fetch rows whenever tab/division/sort changes
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const out = await fetchRows(tab, division, sortKey, period, mePlayerId);
      if (!cancel) { setRows(out); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [tab, division, sortKey, period, mePlayerId]);

  const accent = TAB_META[tab].accent;
  const showDivisions = tab === 'nft';

  return (
    <div className="min-h-screen text-white font-mono" style={{ backgroundColor: '#05050d' }}>
      <SEO
        title="Leaderboard — Nebula Cascade"
        description="Live division rankings for Nebula Cascade. Compete across NFT, No-NFT, and guest tiers."
        path="/leaderboard"
      />
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <button
          onClick={() => navigate('/')}
          className="text-white/40 hover:text-white text-[11px] tracking-[0.25em] uppercase transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-baseline gap-3">
          <h1
            className="text-lg font-bold tracking-[0.45em] uppercase"
            style={{ color: accent, textShadow: `0 0 16px ${accent}80` }}
          >
            Leaderboard
          </h1>
          <span className="text-[10px] text-white/30 tracking-widest">PERIOD {period}</span>
        </div>
        <SegmentChip segment={meSegment} />
      </div>

      {/* Tab bar */}
      <div className="flex items-stretch border-b border-white/10 px-4">
        {(Object.keys(TAB_META) as BoardTab[]).map((t) => {
          const active = tab === t;
          const meta = TAB_META[t];
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-5 py-2.5 text-[11px] uppercase tracking-[0.3em] font-bold transition-all"
              style={{
                color: active ? meta.accent : 'rgba(255,255,255,0.4)',
                textShadow: active ? `0 0 8px ${meta.accent}` : 'none',
              }}
            >
              {meta.label}
              {active && (
                <span
                  className="absolute left-2 right-2 bottom-0 h-[2px]"
                  style={{ background: meta.accent, boxShadow: `0 0 10px ${meta.accent}` }}
                />
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="self-center text-[10px] text-white/30 tracking-wider pr-2">
          {TAB_META[tab].desc}
        </div>
      </div>

      {/* Division row — NFT tab only */}
      {showDivisions && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 overflow-x-auto">
          <span className="text-[10px] text-white/40 tracking-[0.3em] pr-2">DIVISION ▸</span>
          {DIVISIONS.map((d) => {
            const active = division === d;
            return (
              <button
                key={d}
                onClick={() => setDivision(d)}
                className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm border transition-all whitespace-nowrap"
                style={{
                  color: DIVISION_COLORS[d],
                  borderColor: active ? DIVISION_COLORS[d] : 'transparent',
                  background: active ? `${DIVISION_COLORS[d]}15` : 'transparent',
                  textShadow: active ? `0 0 8px ${DIVISION_COLORS[d]}` : 'none',
                }}
              >
                {DIVISION_LABELS[d]}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="px-4 py-3">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="text-white/40 text-[10px] uppercase tracking-[0.25em] border-b border-white/10">
              <th className="py-2 px-2 text-left w-[60px]">#</th>
              <th className="py-2 px-2 text-left">Player</th>
              <SortHeader label="Avg 3" k="avg_top3_score" sortKey={sortKey} setSortKey={setSortKey} />
              <SortHeader label="Best"  k="best_score"     sortKey={sortKey} setSortKey={setSortKey} />
              <SortHeader label="Matches" k="matches_played" sortKey={sortKey} setSortKey={setSortKey} />
              <th className="py-2 px-2 text-right w-[110px]">Trend</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-white/30">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-white/30">No entries yet</td></tr>
            ) : rows.map((r, i) => (
              <tr
                key={`${r.name}-${i}`}
                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent',
                  color: r.isYou ? accent : (i < 3 ? '#fff' : 'rgba(255,255,255,0.78)'),
                  textShadow: r.isYou ? `0 0 10px ${accent}80` : 'none',
                }}
              >
                <td className="py-1.5 px-2 font-bold tabular-nums">
                  {r.isYou && <span style={{ color: accent }}>★ </span>}
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(r.rank).padStart(2, '0')}
                </td>
                <td className="py-1.5 px-2">
                  <span className="uppercase tracking-wider">{r.name}</span>
                  {r.division && (
                    <span
                      className="ml-2 inline-block w-1.5 h-1.5 rounded-full align-middle"
                      style={{ background: DIVISION_COLORS[r.division], boxShadow: `0 0 6px ${DIVISION_COLORS[r.division]}` }}
                      title={DIVISION_LABELS[r.division]}
                    />
                  )}
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums font-bold" style={{ color: r.isYou ? accent : '#66ffee' }}>
                  {r.avg_top3_score.toLocaleString()}
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums">{r.best_score.toLocaleString()}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{r.matches_played}</td>
                <td className="py-1.5 px-2 text-right">
                  <Sparkline values={r.trend ?? []} color={accent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tab === 'guests' && (
          <div className="mt-3 text-[10px] text-pink-300/60 tracking-wider">
            * Guest entries are temporary. Create an account to keep your scores and earn rewards.
          </div>
        )}
        {tab === 'no_nft' && (
          <div className="mt-3 text-[10px] text-cyan-300/60 tracking-wider">
            * Account-holder rewards launching in the next reward period. Keep grinding.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Subcomponents ────────────────────────────────────────────────────────

const SegmentChip = ({ segment }: { segment: 'no_nft' | 'nft' | 'guest' }) => {
  const m = {
    no_nft: { label: 'NO NFT', color: '#00e5ff' },
    nft:    { label: 'NFT',    color: '#ffd24a' },
    guest:  { label: 'GUEST',  color: '#ff52c8' },
  }[segment];
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.2em] uppercase border"
      style={{ color: m.color, borderColor: `${m.color}50`, background: `${m.color}10` }}
    >
      {m.label}
    </span>
  );
};

const SortHeader = ({
  label, k, sortKey, setSortKey,
}: { label: string; k: SortKey; sortKey: SortKey; setSortKey: (k: SortKey) => void }) => (
  <th
    className={`py-2 px-2 text-right cursor-pointer select-none ${sortKey === k ? 'text-white' : ''}`}
    onClick={() => setSortKey(k)}
  >
    {label}{sortKey === k ? ' ▾' : ''}
  </th>
);

const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
  if (!values || values.length < 2) return <span className="text-white/20">—</span>;
  const w = 80, h = 18;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <polyline fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.85" points={pts} />
    </svg>
  );
};

// ─── Data layer ───────────────────────────────────────────────────────────

async function fetchRows(
  tab: BoardTab,
  division: Division,
  sortKey: SortKey,
  period: string,
  mePlayerId: string | null,
): Promise<Row[]> {
  if (tab === 'guests') {
    const { data } = await supabase
      .from('guest_scores')
      .select('nickname, score, level_reached, survival_seconds, created_at')
      .gte('score', 2000)
      .order('score', { ascending: false })
      .limit(50);
    return (data ?? []).map((r: any, i: number) => ({
      rank: i + 1,
      name: r.nickname,
      avg_top3_score: r.score,
      best_score: r.score,
      matches_played: 1,
    }));
  }

  // Account boards (no_nft / nft / all) all read from `leaderboard` joined with `players`.
  let q = supabase
    .from('leaderboard')
    .select('player_id, total_score, best_score, avg_top3_score, matches_played, division, players!inner(display_name, has_ever_owned_card)')
    .eq('period', period)
    .order(sortKey, { ascending: false })
    .limit(100);

  if (tab === 'nft') q = q.eq('division', division);

  const { data } = await q;
  let filtered = (data ?? []) as any[];

  if (tab === 'no_nft') filtered = filtered.filter((r) => r.players?.has_ever_owned_card === false);
  else if (tab === 'nft') filtered = filtered.filter((r) => r.players?.has_ever_owned_card === true);
  // 'all' → no segment filter

  // Trend: last 7 match_logs per player (only for top 25 to limit queries)
  const top = filtered.slice(0, 50);
  const trendMap = await fetchTrends(top.map((r) => r.player_id).slice(0, 25));

  return top.map((r: any, i: number) => ({
    rank: i + 1,
    name: r.players?.display_name ?? 'Anonymous',
    avg_top3_score: Number(r.avg_top3_score ?? 0),
    best_score: Number(r.best_score ?? 0),
    matches_played: Number(r.matches_played ?? 0),
    division: r.division ?? null,
    isYou: mePlayerId === r.player_id,
    trend: trendMap.get(r.player_id),
  }));
}

async function fetchTrends(playerIds: string[]): Promise<Map<string, number[]>> {
  const map = new Map<string, number[]>();
  if (!playerIds.length) return map;
  const { data } = await supabase
    .from('match_logs')
    .select('player_id, score, ended_at')
    .in('player_id', playerIds)
    .order('ended_at', { ascending: false })
    .limit(playerIds.length * 7);
  if (!data) return map;
  for (const id of playerIds) map.set(id, []);
  for (const row of data as any[]) {
    const arr = map.get(row.player_id);
    if (arr && arr.length < 7) arr.unshift(Number(row.score));
  }
  return map;
}

export default Leaderboard;
