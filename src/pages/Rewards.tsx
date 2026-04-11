import { useNavigate } from 'react-router-dom';

const Rewards = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center font-mono">
      <h1 className="text-4xl font-black tracking-[0.3em] text-yellow-400 mb-4" style={{ textShadow: '0 0 20px #ffdd00' }}>
        REWARDS
      </h1>
      <p className="text-white/50 text-lg mb-8">Coming soon...</p>
      <button
        onClick={() => navigate('/')}
        className="rounded-lg border border-red-500/50 bg-red-500/20 px-6 py-2 text-red-300 hover:bg-red-500/30 transition-colors"
        style={{ textShadow: '0 0 8px #ff3333' }}
      >
        ← BACK
      </button>
    </div>
  );
};

export default Rewards;
