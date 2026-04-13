/**
 * Leaderboard Page — Dual leaderboard with player segmentation
 * ═══════════════════════════════════════════════════════════════
 *
 * CRITICAL RULE (see core_rules.py + playerSegmentation.ts):
 *
 * Players are split into two separate leaderboards:
 *   - No-NFT Board: ONLY players who have NEVER owned a card
 *   - NFT Board: ONLY players who own or have EVER owned a card
 *
 * A player who has_ever_owned_card = true can NEVER appear on
 * or view the No-NFT board. This is permanent and by design.
 *
 * The Global board shows everyone (for display only, no rewards).
 *
 * ═══════════════════════════════════════════════════════════════
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DIVISION_LABELS, DIVISION_COLORS, getCurrentPeriod, type Division } from '@/lib/divisionSystem';
import DivisionBadge from '@/components/game/DivisionBadge';
import {
  type LeaderboardType,
  getEligibleLeaderboards,
  getSegmentDisplay,
} from '@/lib/playerSegmentation';

const DIVISIONS: Division[] = ['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v'];

/**
 * Leaderboard tabs — which boards exist.
 * Visibility is controlled by player segment.
 */
const BOARD_TABS: { type: LeaderboardType; label: string; description: string }[] = [
  {
    type: "no_nft",
    label: "FREE",
    description: "Players who have never owned a card",
  },
  {
    type: "nft",
    label: "NFT",
    description: "Current and former card owners",
  },
  {
    type: "global",
    label: "ALL",
    description: "All players combined (display only)",
  },
];

interface LeaderboardEntry {
  id: string;
  player_id: string;
  total_score: number;
  best_score: number;
  avg_top3_score: number;
  matches_played: number;
  rank: number | null;
  display_name: string;
  division: Division;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState<Division>('gem_v');
  const [activeBoard, setActiveBoard] = useState<LeaderboardType>("no_nft");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const period = getCurrentPeriod();

  /**
   * SEGMENTATION: Determine which boards this player can see.
   *
   * In production, fetch has_ever_owned_card from Supabase or backend.
   * For now, we show all tabs but mark which is the player's "home" board.
   *
   * Backend enforces the real rule — frontend is UX only.
   */
  const [hasEverOwnedCard, setHasEverOwnedCard] = useState(false);
  const eligibleBoards = getEligibleLeaderboards(hasEverOwnedCard);
  const segmentDisplay = getSegmentDisplay(hasEverOwnedCard);

  useEffect(() => {
    // Check player ownership status from Supabase (if logged in)
    const checkSegment = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: player } = await supabase
          .from('players')
          .select('has_ever_owned_card')
          .eq('auth_id', user.id)
          .single();
        if (player && player.has_ever_owned_card !== undefined) {
          setHasEverOwnedCard(player.has_ever_owned_card);
          // Auto-select the right board for the player's segment
          if (player.has_ever_owned_card) {
            setActiveBoard("nft");
          }
        }
      }
    };
    checkSegment();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      /**
       * SEGMENTATION FILTER:
       * - no_nft board → WHERE has_ever_owned_card = false
       * - nft board → WHERE has_ever_owned_card = true
       * - global board → no filter
       *
       * NOTE: The has_ever_owned_card column must exist in the players table.
       * If it doesn't yet, all data goes to the "global" view.
       */
      let query = supabase
        .from('leaderboard')
        .select('id, player_id, total_score, best_score, avg_top3_score, matches_played, rank, division, players!inner(display_name, has_ever_owned_card)')
        .eq('period', period)
        .eq('division', activeDivision)
        .order('avg_top3_score', { ascending: false })
        .limit(50);

      const { data } = await query;

      if (data) {
        // Client-side segmentation filter (backup for when DB column isn't ready)
        let filtered = data;
        if (activeBoard === "no_nft") {
          filtered = data.filter((row: any) =>
            !row.players?.has_ever_owned_card
          );
        } else if (activeBoard === "nft") {
          filtered = data.filter((row: any) =>
            row.players?.has_ever_owned_card === true
          );
        }
        // else "global" → show all

        setEntries(filtered.map((row: any, idx: number) => ({
          ...row,
          display_name: row.players?.display_name || 'Anonymous',
          rank: idx + 1,
        })));
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [activeDivision, activeBoard, period]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/20">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 transition-colors text-sm">&larr; Back to Game</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>LEADERBOARD</h1>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
            style={{
              backgroundColor: segmentDisplay.color === 'purple' ? 'rgba(168,85,247,0.15)' : 'rgba(0,229,255,0.15)',
              color: segmentDisplay.color === 'purple' ? '#a855f7' : '#00e5ff',
              border: `1px solid ${segmentDisplay.color === 'purple' ? 'rgba(168,85,247,0.3)' : 'rgba(0,229,255,0.3)'}`,
            }}
          >
            {segmentDisplay.badge}
          </span>
          <span className="text-xs text-white/40">{period}</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
       * BOARD TABS — Segmented leaderboards
       *
       * RULE: If has_ever_owned_card is true, the No-NFT tab
       * is hidden entirely. The player cannot see or interact
       * with the free leaderboard. This is intentional.
       * ═══════════════════════════════════════════════════════════ */}
      <div className="flex gap-1 px-4 pt-3 pb-1 border-b border-white/5">
        {BOARD_TABS.filter(tab => {
          // SEGMENTATION: Hide boards the player isn't eligible for
          // NFT players can't see the No-NFT board (permanent rule)
          if (tab.type === "no_nft" && hasEverOwnedCard) return false;
          // Non-NFT players can't see the NFT board
          if (tab.type === "nft" && !hasEverOwnedCard) return false;
          return true;
        }).map(tab => (
          <button
            key={tab.type}
            onClick={() => setActiveBoard(tab.type)}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all ${
              activeBoard === tab.type
                ? 'bg-white/10 border border-b-0 border-white/20 text-white'
                : 'border border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
            title={tab.description}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Board description */}
      <div className="px-4 py-1">
        <span className="text-[10px] text-white/25 tracking-wider">
          {BOARD_TABS.find(t => t.type === activeBoard)?.description}
        </span>
      </div>

      {/* Division filter */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto">
        {DIVISIONS.map(div => (
          <button
            key={div}
            onClick={() => setActiveDivision(div)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeDivision === div ? 'bg-white/10 border border-white/20' : 'border border-transparent hover:bg-white/5'
            }`}
            style={{ color: DIVISION_COLORS[div], textShadow: activeDivision === div ? `0 0 8px ${DIVISION_COLORS[div]}` : undefined }}
          >
            {DIVISION_LABELS[div]}
          </button>
        ))}
      </div>

      {/* Entries table */}
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
                  <th className="py-2 px-2 text-right">Avg Top 3</th>
                  <th className="py-2 px-2 text-right">Best</th>
                  <th className="py-2 px-2 text-right">Matches</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id} className={`border-b border-white/5 ${i < 3 ? 'text-yellow-300' : 'text-white/70'}`}>
                    <td className="py-2 px-2 font-bold">{i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : i === 2 ? '\u{1F949}' : `#${i + 1}`}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {entry.display_name}
                        <DivisionBadge division={entry.division} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-bold" style={{ color: '#66ffee' }}>{entry.avg_top3_score.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">{entry.best_score.toLocaleString()}</td>
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
