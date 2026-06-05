import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integr
cat << 'EOF' > src/pages/Leaderboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';

type BoardTab = 'no_nft' | 'nft' | 'guests';

interface Row {
  rank: number;
  name: string;
  score: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<BoardTab>('guests');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      let out: Row[] = [];

      if (tab === 'guests') {
        const { data } = await supabase
          .from('guest_scores')
          .select('nickname, score')
          .order('score', { ascending: false })
          .limit(10);
        
        out = (data ?? []).map((r: any, i: number) => ({
          rank: i + 1,
          name: r.nickname || 'ANONYMOUS',
          score: Number(r.score ?? 0),
        }));
      } else {
        const { data } = await supabase
          .from('leaderboard')
          .select('total_score, players!inner(display_name, has_ever_owned_card)')
          .order('total_score', { ascending: false })
          .limit(10);

        const filtered = (data ?? []).filter((r: any) => {
          if (tab === 'nft') return r.players?.has_ever_owned_card === true;
          return r.players?.has_ever_owned_card === false;
        });

        out = filtered.map((r: any, i: number) => ({
          rank: i + 1,
          name: r.players?.display_name || 'PLAYER',
          score: Number(r.total_score ?? 0),
        }));
      }

      if (!cancel) {
        setRows(out);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [tab]);

  return (
    <div className="min-h-screen text-white font-mono p-6 select-none" style={{ backgroundColor: '#000000' }}>
      <SEO title="Leaderboard" description="Nebula Cascade Rankings" path="/leaderboard" />
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-widest text-yellow-400 uppercase mb-2" style={{ textShadow: '2px 2px #ff0055' }}>
          SCORE TERMINAL
        </h1>
        <button onClick={() => navigate('/')} className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest">
          [ ESCAPE ]
        </button>
      </div>

      {/* TABS RETRO */}
      <div className="flex justify-center gap-4 mb-6 border-b border-gray-800 pb-4">
        {(['guests', 'no_nft', 'nft'] as BoardTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1 text-xs font-bold uppercase tracking-widest border ${
              tab === t ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-gray-700 text-gray-400'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* LISTA ESTILO N64/SNES */}
      <div className="max-w-md mx-auto border-2 border-gray-800 bg-gray-950 p-4 font-mono">
        <div className="flex justify-between text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800 pb-2 mb-2">
          <span>RANK / PLAYER</span>
          <span>SCORE</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-gray-500 animate-pulse">LOADING SYSTEM...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">NO ENTRIES FOUND</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.rank} className="flex justify-between items-center text-xs tracking-wider">
                <div className="flex gap-4">
                  <span className="text-yellow-500 font-bold">{String(r.rank).padStart(2, '0')}</span>
                  <span className="uppercase text-gray-200">{r.name}</span>
                </div>
                <span className="text-cyan-400 font-bold tabular-nums">{r.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
