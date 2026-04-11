import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DIVISION_LABELS, DIVISION_COLORS, getCurrentPeriod, type Division } from '@/lib/divisionSystem';
import DivisionBadge from '@/components/game/DivisionBadge';

const DIVISIONS: Division[] = ['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v'];

interface LeaderboardEntry {
  id: string;
  player_id: string;
  total_score: number;
  best_score: number;
  matches_played: number;
  rank: number | null;
  display_name: string;
  division: Division;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState<Division>('gem_v');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const period = getCurrentPeriod();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('leaderboard')
        .select('id, player_id, total_score, best_score, matches_played, rank, division, players!inner(display_name)')
        .eq('period', period)
        .eq('division', activeDivision)
        .order('total_score', { ascending: false })
        .limit(50);

      if (data) {
        setEntries(data.map((row: any, idx: number) => ({
          ...row,
          display_name: row.players?.display_name || 'Anonymous',
          rank: idx + 1,
        })));
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [activeDivision, period]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/20">
        <button
          onClick={() => navigate('/')}
          className="text-yellow-400/70 hover:text-yellow-400 transition-colors text-sm"
        >
          ← Back to Game
        </button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          LEADERBOARD
        </h1>
        <div className="text-xs text-white/40">{period}</div>
      </div>

      {/* Division tabs */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto">
        {DIVISIONS.map(div => (
          <button
            key={div}
            onClick={() => setActiveDivision(div)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeDivision === div
                ? 'bg-white/10 border border-white/20'
                : 'border border-transparent hover:bg-white/5'
            }`}
            style={{
              color: DIVISION_COLORS[div],
              textShadow: activeDivision === div ? `0 0 8px ${DIVISION_COLORS[div]}` : undefined,
            }}
          >
            {DIVISION_LABELS[div]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="text-center text-white/40 py-12">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-white/40 py-12">No entries yet for this division</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-[10px] uppercase tracking-widest border-b border-white/10">
                  <th className="py-2 px-2 text-left">Rank</th>
                  <th className="py-2 px-2 text-left">Player</th>
                  <th className="py-2 px-2 text-right">Best</th>
                  <th className="py-2 px-2 text-right">Total</th>
                  <th className="py-2 px-2 text-right">Matches</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-white/5 ${i < 3 ? 'text-yellow-300' : 'text-white/70'}`}
                  >
                    <td className="py-2 px-2 font-bold">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {entry.display_name}
                        <DivisionBadge division={entry.division} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">{entry.best_score.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">{entry.total_score.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">{entry.matches_played}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
