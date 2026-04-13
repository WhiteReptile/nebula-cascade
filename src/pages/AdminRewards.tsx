import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DIVISION_LABELS, type Division, getCurrentPeriod } from '@/lib/divisionSystem';
import { exportPayoutCSV, type PayoutData } from '@/lib/payoutIntegrations';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400',
  validating: 'bg-yellow-500/20 text-yellow-400',
  frozen: 'bg-blue-500/20 text-blue-400',
  pending_payout: 'bg-orange-500/20 text-orange-400',
  paid: 'bg-purple-500/20 text-purple-400',
  finalized: 'bg-blue-500/20 text-blue-400',
};

const AdminRewards = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [flaggedMatches, setFlaggedMatches] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) { setLoading(false); return; }
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', userData.user.id);
    const admin = roles?.some(r => r.role === 'admin') ?? false;
    setIsAdmin(admin);
    if (admin) { await loadPeriods(); await loadFlaggedMatches(); }
    setLoading(false);
  };

  const loadPeriods = async () => {
    const { data } = await supabase.from('reward_periods').select('*').order('created_at', { ascending: false });
    setPeriods(data || []);
  };

  const loadFlaggedMatches = async () => {
    const { data } = await supabase
      .from('match_logs')
      .select('*, players!inner(display_name, user_id)')
      .eq('is_flagged', true)
      .order('ended_at', { ascending: false })
      .limit(50);
    setFlaggedMatches(data || []);
  };

  const createPeriod = async () => {
    const period = getCurrentPeriod();
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    await supabase.from('reward_periods').insert({
      period,
      status: 'open',
      starts_at: now.toISOString(),
      ends_at: endOfMonth.toISOString(),
    });
    await loadPeriods();
  };

  const processRewards = async (periodId: string, periodStr: string) => {
    await supabase.from('reward_periods').update({ status: 'validating' }).eq('id', periodId);
    const divisions: Division[] = ['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v'];

    for (const div of divisions) {
      const { data: topPlayers } = await supabase
        .from('leaderboard')
        .select('player_id, avg_top3_score, players!inner(display_name)')
        .eq('period', periodStr)
        .eq('division', div)
        .order('avg_top3_score', { ascending: false })
        .limit(5);

      if (!topPlayers) continue;
      // Payouts are calculated off-chain per season; insert placeholder amounts
      for (let i = 0; i < topPlayers.length; i++) {
        const { data: flagged } = await supabase
          .from('match_logs').select('id').eq('player_id', topPlayers[i].player_id).eq('is_flagged', true).limit(1);
        if (flagged && flagged.length > 0) continue;
        await supabase.from('reward_payouts').insert({
          reward_period_id: periodId, player_id: topPlayers[i].player_id,
          division: div, rank: i + 1, reward_amount_cents: 0, status: 'pending',
        });
      }
    }
    await loadPayouts(periodId);
  };

  const loadPayouts = async (periodId: string) => {
    setSelectedPeriod(periodId);
    const { data } = await supabase
      .from('reward_payouts')
      .select('*, players!inner(display_name)')
      .eq('reward_period_id', periodId)
      .order('division').order('rank');
    setPayouts(data || []);
  };

  const exportCSV = () => {
    const payoutData: PayoutData[] = payouts.map(p => ({
      playerId: p.player_id,
      displayName: (p as any).players?.display_name || 'Unknown',
      division: p.division, rank: p.rank, amountCents: p.reward_amount_cents,
    }));
    const csv = exportPayoutCSV(payoutData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payouts_${selectedPeriod}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center font-mono">Loading...</div>;
  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center font-mono">
      <div className="text-center">
        <div className="text-red-400 text-xl mb-4">Access Denied</div>
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400">← Back to Game</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm">← Back</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>REWARDS ADMIN</h1>
        <div />
      </div>

      {/* Revenue note */}
      <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs text-yellow-400/70">
        40% of total platform revenue (card sales + marketplace fees) goes to the rewards pool.
      </div>

      {/* Flagged Matches */}
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-widest text-red-400/70 mb-3">⚠ Flagged Matches ({flaggedMatches.length})</h2>
        {flaggedMatches.length === 0 ? (
          <div className="text-white/30 text-xs">No flagged matches</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/10">
                <th className="py-1 px-2 text-left">Player</th><th className="py-1 px-2 text-right">Score</th>
                <th className="py-1 px-2 text-right">Time</th><th className="py-1 px-2 text-left">Flags</th>
              </tr></thead>
              <tbody>{flaggedMatches.slice(0, 10).map((m: any) => (
                <tr key={m.id} className="border-b border-white/5 text-red-300/70">
                  <td className="py-1 px-2">{m.players?.display_name}</td>
                  <td className="py-1 px-2 text-right">{m.score?.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right">{m.survival_time_seconds}s</td>
                  <td className="py-1 px-2 text-[10px]">{JSON.stringify(m.anti_cheat_flags)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reward Periods — 30-day cycles */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-sm uppercase tracking-widest text-yellow-400/70">Reward Periods (30-Day)</h2>
          <button onClick={createPeriod} className="text-[10px] px-2 py-1 rounded border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">+ New Period</button>
        </div>
        <div className="space-y-2">
          {periods.map(p => (
            <div key={p.id} className="flex items-center gap-3 text-xs">
              <span className="text-white/60">{p.period}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${STATUS_STYLES[p.status] || 'bg-white/10 text-white/40'}`}>
                {p.status.toUpperCase().replace('_', ' ')}
              </span>
              {p.status === 'open' && (
                <button onClick={() => processRewards(p.id, p.period)} className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">Process Rewards</button>
              )}
              <button onClick={() => loadPayouts(p.id)} className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-white/60 hover:bg-white/5">View Payouts</button>
            </div>
          ))}
        </div>
      </section>

      {/* Payouts */}
      {selectedPeriod && (
        <section>
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-sm uppercase tracking-widest text-green-400/70">Payouts</h2>
            {payouts.length > 0 && (
              <button onClick={exportCSV} className="text-[10px] px-2 py-1 rounded border border-green-500/30 text-green-400 hover:bg-green-500/10">Export CSV</button>
            )}
          </div>
          {payouts.length === 0 ? (
            <div className="text-white/30 text-xs">No payouts generated</div>
          ) : (
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/10">
                <th className="py-1 px-2 text-left">Player</th><th className="py-1 px-2 text-left">Division</th>
                <th className="py-1 px-2 text-right">Rank</th><th className="py-1 px-2 text-right">Amount</th>
                <th className="py-1 px-2 text-left">Status</th>
              </tr></thead>
              <tbody>{payouts.map((p: any) => (
                <tr key={p.id} className="border-b border-white/5 text-white/70">
                  <td className="py-1 px-2">{p.players?.display_name}</td>
                  <td className="py-1 px-2">{DIVISION_LABELS[p.division as Division]}</td>
                  <td className="py-1 px-2 text-right">#{p.rank}</td>
                  <td className="py-1 px-2 text-right">${(p.reward_amount_cents / 100).toFixed(2)}</td>
                  <td className="py-1 px-2 text-[10px]">{p.status}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminRewards;
