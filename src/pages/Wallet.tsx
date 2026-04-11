import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import WalletConnect from '@/components/wallet/WalletConnect';
import { getAllGems, type GemMetadata } from '@/lib/gemSystem';
import { DIVISION_LABELS } from '@/lib/divisionSystem';

const Wallet = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [gems, setGems] = useState<GemMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: player } = await supabase
          .from('players')
          .select('wallet_address')
          .eq('user_id', userData.user.id)
          .single();
        setWalletAddress(player?.wallet_address ?? null);
      }
      const allGems = await getAllGems();
      setGems(allGems);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center font-mono">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm">← Back</button>
        <h1 className="text-xl font-bold tracking-[0.3em] text-yellow-400/80" style={{ textShadow: '0 0 15px #ffdd00' }}>
          WALLET & GEMS
        </h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <WalletConnect currentAddress={walletAddress} />

        {/* Gems display */}
        <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
          <h2 className="text-sm uppercase tracking-widest text-white/40 font-mono mb-4">
            Cosmic Gems ({gems.length}/5)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gems.map(gem => (
              <div
                key={gem.tokenId}
                className="rounded-lg border p-4 flex items-center gap-3"
                style={{
                  borderColor: `${gem.colorHex}40`,
                  background: `${gem.colorHex}08`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    background: `radial-gradient(circle, ${gem.colorHex}, ${gem.colorHex}60)`,
                    boxShadow: `0 0 12px ${gem.colorHex}60`,
                  }}
                >
                  {gem.tokenId}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: gem.colorHex }}>{gem.name}</div>
                  <div className="text-[10px] text-white/40">
                    {DIVISION_LABELS[gem.division]} • {gem.ownerWallet ? 'Owned' : 'Unowned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
