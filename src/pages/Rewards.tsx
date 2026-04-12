import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentPeriod, DIVISION_LABELS, REWARD_TIERS, type Division } from '@/lib/divisionSystem';

const Rewards = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<any>(null);
  const [playerDivision, setPlayerDivision] = useState<Division | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const currentPeriod = getCurrentPeriod();

      const { data: periodData } = await supabase
        .from('reward_periods')
        .select('*')
        .eq('period', currentPeriod)
        .single();

      setPeriod(periodData);

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: player } = await supabase
          .from('players')
          .select('division')
          .eq('user_id', userData.user.id)
          .single();
        if (player) setPlayerDivision(player.division as Division);
      }

      setLoading(false);
    };
    load();
  }, []);

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="min-h-screen bg-[#050510] text-white font-mono p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm">← Back</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          REWARDS
        </h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Current period */}
        <div className="rounded-xl border border-yellow-500/20 bg-black/60 p-6 backdrop-blur-sm text-center">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Competition Period</div>
          <div className="text-2xl font-bold text-yellow-400" style={{ textShadow: '0 0 10px #ffdd00' }}>
            {currentPeriod}
          </div>
          <div className="text-xs text-white/30 mt-1">30-day cycle</div>
          {period && (
            <div className="mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                period.status === 'open' ? 'bg-green-500/20 text-green-400' :
                period.status === 'frozen' ? 'bg-blue-500/20 text-blue-400' :
                period.status === 'pending_payout' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>{period.status.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Your division */}
        {playerDivision && (
          <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Your Division</div>
            <div className="text-lg font-bold" style={{ color: '#66ffee' }}>
              {DIVISION_LABELS[playerDivision]}
            </div>
          </div>
        )}

        {/* Reward tiers */}
        <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-4">
            Compete for rewards from the pool
          </div>
          <div className="space-y-3">
            {(Object.entries(REWARD_TIERS) as [Division, number[]][]).map(([div, tiers]) => (
              <div key={div} className="border-b border-white/5 pb-2">
                <div className="text-sm font-bold mb-1" style={{ color: div === playerDivision ? '#66ffee' : 'rgba(255,255,255,0.5)' }}>
                  {DIVISION_LABELS[div]}
                </div>
                <div className="flex gap-2 text-[10px] text-white/40">
                  {tiers.map((amount, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/5">
                      #{i + 1}: ${(amount / 100).toFixed(0)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-white/20 mt-4 text-center">
            40% of total platform revenue goes to rewards (card sales + marketplace fees)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
