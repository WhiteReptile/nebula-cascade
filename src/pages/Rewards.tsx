import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIVISION_LABELS, DIVISION_COLORS, DIVISION_RARITY, type Division } from '@/lib/divisionSystem';

type Tab = 'divisions' | 'cards' | 'no-nft' | 'rewards' | 'season';

const TABS: { key: Tab; label: string }[] = [
  { key: 'divisions', label: 'DIVISIONS' },
  { key: 'cards', label: 'CARDS' },
  { key: 'no-nft', label: 'NO NFT' },
  { key: 'rewards', label: 'REWARDS' },
  { key: 'season', label: 'SEASON' },
];

const DIVISIONS_ORDERED: { key: Division; roman: string; color: string }[] = [
  { key: 'gem_i', roman: 'I', color: DIVISION_COLORS.gem_i },
  { key: 'gem_ii', roman: 'II', color: DIVISION_COLORS.gem_ii },
  { key: 'gem_iii', roman: 'III', color: DIVISION_COLORS.gem_iii },
  { key: 'gem_iv', roman: 'IV', color: DIVISION_COLORS.gem_iv },
  { key: 'gem_v', roman: 'V', color: DIVISION_COLORS.gem_v },
];

/* ────────────────────────────────────────────────────────── */

const DivisionsContent = () => (
  <div className="space-y-5">
    <p className="text-white/80 text-xs leading-relaxed">
      Nebula uses a five-tier division system that represents <span className="text-white">rarity only — not skill level</span>. 
      The worst player on the platform can own a Division I card, and the best player can start with Division V. 
      Your card's division determines which leaderboard tier you compete in, but it does not give any gameplay 
      advantage whatsoever. All cards have identical mechanics — same energy, same game rules, same scoring. 
      The only difference is scarcity: fewer Division I cards exist in circulation, making them more exclusive 
      and typically more valuable on the secondary market. Supply percentages listed below are estimates based 
      on initial design targets. The actual distribution may shift slightly depending on demand, but the ratios 
      will stay close to these ranges. Ultimately, the market itself determines the real value of every card 
      regardless of division — a high-demand Division V card from a popular collection could outprice a low-demand 
      Division II card. Rarity creates the framework, but player demand writes the final price. To earn rewards 
      from a division's leaderboard, you must earn your rank through consistent gameplay performance. Owning a 
      rare card gets you into the tier — keeping your rank is entirely on you.
    </p>

    <div className="grid gap-3">
      {DIVISIONS_ORDERED.map(({ key, roman, color }) => {
        const rarity = DIVISION_RARITY[key];
        return (
          <div
            key={key}
            className="flex items-center gap-4 rounded-lg border px-4 py-3"
            style={{
              borderColor: `${color}25`,
              background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
            }}
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-lg font-black"
              style={{ color, background: `${color}12`, border: `1px solid ${color}30`, textShadow: `0 0 8px ${color}` }}
            >
              {roman}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider" style={{ color }}>{DIVISION_LABELS[key]}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full tracking-widest uppercase"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  {rarity.rarity}
                </span>
              </div>
              <div className="text-[10px] text-white/50 mt-0.5">Supply: {rarity.supplyPercent} of total cards</div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: DIVISIONS_ORDERED.length - DIVISIONS_ORDERED.findIndex(d => d.key === key) }).map((_, j) => (
                <div key={j} className="w-2 h-2 rounded-sm" style={{ background: color, boxShadow: `0 0 4px ${color}80` }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const CardsContent = () => (
  <div className="space-y-4">
    <p className="text-white/80 text-xs leading-relaxed">
      Cards are the core asset in Nebula — each one is an NFT deployed via Thirdweb on the Base blockchain. 
      Every card generates <span className="text-white">2 energy per day</span>, and each energy point allows 
      you to play one ranked match. That means a single card gives you 2 ranked runs daily. If you own multiple 
      cards, each card has its own independent energy pool — you must play with each card separately to use its 
      energy. A wallet can hold up to <span className="text-white">10 cards maximum</span>, which means the 
      theoretical daily cap is 20 ranked runs per player (10 cards × 2 energy each). Energy resets every day at 
      <span className="text-white">UTC midnight</span> — unused energy does not carry over. If all your cards 
      are out of energy, you can still play the game freely, but those matches will not count toward any ranked 
      leaderboard or seasonal standings.
    </p>
    <p className="text-white/80 text-xs leading-relaxed">
      <span className="text-white">Points belong to your wallet, not your card.</span> If you sell a card and 
      buy a new one, your accumulated points stay with you. You compete in whatever division your current active 
      card belongs to, using your existing points. When a new card is added to your wallet — whether purchased from 
      the marketplace or received via trade — its energy pool initializes instantly with <span className="text-white">
      2 energy</span>. No waiting, no UTC dependency. The new owner gets to play immediately.
    </p>
    <p className="text-white/80 text-xs leading-relaxed">
      <span className="text-white">Primary card selection</span> works automatically: when you start a game, the 
      system checks your wallet and selects the highest division card that still has energy available. If that card 
      runs out of energy, the game does <span className="text-white">not</span> automatically switch to another card. 
      You must manually select a different card to continue earning ranked scores. If you forget or choose not to use 
      your other cards, that energy goes unused. Consistency is part of the competition. Card art, names, and flavor 
      text are purely cosmetic — they provide zero gameplay stats or advantages.
    </p>

    <div className="grid grid-cols-2 gap-3">
      {[
        { label: '2 / DAY', desc: 'Energy per card', icon: '⚡' },
        { label: '10 MAX', desc: 'Cards per wallet', icon: '🃏' },
        { label: '20 MAX', desc: 'Daily ranked runs', icon: '🎯' },
        { label: 'INSTANT', desc: 'Energy on trade', icon: '🔄' },
      ].map(item => (
        <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
          <div className="text-lg mb-1">{item.icon}</div>
          <div className="text-sm font-bold text-cyan-300" style={{ textShadow: '0 0 8px rgba(102,255,238,0.3)' }}>{item.label}</div>
          <div className="text-[10px] text-white/50 mt-0.5">{item.desc}</div>
        </div>
      ))}
    </div>
  </div>
);

const NoNftContent = () => (
  <div className="space-y-4">
    <p className="text-white/80 text-xs leading-relaxed">
      You do not need to own any NFT cards to play Nebula. Every account — created via Thirdweb using Google, 
      email, or any supported login method — automatically participates in the <span className="text-white">
      No-NFT bracket</span>. This is a completely separate leaderboard from the division-based NFT tiers. 
      Bracket placement is determined entirely by your current wallet contents: holding <span className="text-white">
      zero NFT cards</span> places you in the No-NFT bracket, while holding one or more NFT cards moves you to 
      the appropriate division bracket. There is no permanent lock-in — selling all your NFT cards immediately 
      returns you to the No-NFT bracket. Scores you submitted remain valid in the bracket where they were 
      originally earned.
    </p>
    <p className="text-white/80 text-xs leading-relaxed">
      Free players receive <span className="text-white">2 energy per day</span> with a random activation mechanic: 
      each time you start a new game, your energy has a <span className="text-white">50% chance</span> to activate 
      for that run. This keeps the free experience accessible while adding a layer of unpredictability that balances 
      the playing field across all free participants. The No-NFT leaderboard operates on the same seasonal schedule 
      as the NFT divisions — 40-day cycles with standings that reset each season. Free players compete exclusively 
      against other free players, ensuring a fair competitive environment that is never influenced by card ownership 
      or spending power.
    </p>

    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="text-emerald-400 text-lg">🔄</span>
        <div>
          <div className="text-xs font-bold text-emerald-400 tracking-wider mb-1">FLUID BRACKETS</div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            Bracket placement is wallet-based and updates in real time. Hold 0 NFTs → No-NFT bracket. 
            Hold ≥1 NFT → NFT division bracket. Sell all cards → return to No-NFT immediately. No permanent lock-in.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const RewardsContent = () => (
  <div className="space-y-4">
    <p className="text-white/80 text-xs leading-relaxed">
      The Nebula rewards pool is funded by <span className="text-white">30% of all platform fees</span>. 
      This includes the 3% marketplace fee charged on every secondary card sale, plus a portion of revenue from 
      primary card sales during launches and drops. These fees accumulate continuously throughout each 40-day season, 
      building a pool that grows proportionally with platform activity. More trading and more players means a 
      larger pool. At the end of each season, the Nebula team calculates payout amounts off-chain based on final 
      leaderboard standings within each division. This means your rewards are determined by your rank relative to 
      other players in your specific division — not by an absolute score threshold. The top performers in Division V 
      are rewarded from the Division V allocation, and the same applies up through Division I. Higher divisions 
      don't automatically guarantee higher individual payouts — the pool allocation per division may vary based on 
      participation and card distribution. Once payouts are calculated, the team <span className="text-white">
      sends rewards directly to player wallets</span>. No complex claiming process required — rewards are distributed 
      by the team after each season closes. The 30% allocation is a launch parameter and may be adjusted by the team 
      as the platform matures, always with advance notice to the community.
    </p>

    <div className="grid grid-cols-3 gap-3">
      {[
        { value: '30%', label: 'Fees → Pool' },
        { value: '3%', label: 'Marketplace fee' },
        { value: 'DIRECT', label: 'Team sends rewards' },
      ].map(item => (
        <div key={item.label} className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3 text-center">
          <div className="text-base font-black text-cyan-300" style={{ textShadow: '0 0 10px rgba(102,255,238,0.3)' }}>{item.value}</div>
          <div className="text-[9px] text-white/50 mt-1 tracking-wider uppercase">{item.label}</div>
        </div>
      ))}
    </div>
  </div>
);

const SeasonContent = () => (
  <div className="space-y-4">
    <p className="text-white/80 text-xs leading-relaxed">
      Nebula operates on <span className="text-white">40-day competitive seasons</span>. Each season is a 
      self-contained competition cycle with its own leaderboard standings, reward pool accumulation, and payout 
      distribution. On Day 1, a new season begins and all leaderboard positions across every division and the 
      No-NFT bracket reset to zero. Every player starts fresh — no carryover from previous seasons. From Day 1 
      through Day 40, every ranked match you play contributes to your seasonal standing. Consistency matters more 
      than single-game spikes: the leaderboard uses your average top-3 scores as the primary ranking metric, which 
      rewards reliable high performance over lucky outlier runs. During the active season, the rewards pool grows 
      with every marketplace transaction and card sale. At the end of Day 40, the season closes. Final standings 
      are locked and the team begins the off-chain payout calculation process. This includes anti-cheat validation 
      — any flagged accounts are reviewed before rewards are distributed. Once payouts are finalized, the team 
      <span className="text-white">sends rewards directly to player wallets</span>. Then 
      the cycle repeats: Day 1 of the new season, clean slate, new pool, same hunger. Season length and structure 
      may be adjusted during the beta phase based on community feedback and participation data. The team will 
      communicate any changes in advance. The 40-day cycle is designed to be long enough for meaningful competition 
      but short enough to keep the meta fresh and give new players regular entry points.
    </p>

    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="text-purple-400 text-lg">🧪</span>
        <div>
          <div className="text-xs font-bold text-purple-400 tracking-wider mb-1">BETA STATUS</div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            The reward system is live but distribution activates after NFT launch on Base. 
            Season structure and pool allocations may be refined during beta based on community feedback.
          </p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4 text-center">
      {[
        { day: 'DAY 1', desc: 'Season begins\nLeaderboards reset' },
        { day: 'DAY 1-40', desc: 'Active competition\nPool accumulates' },
        { day: 'DAY 40+', desc: 'Season ends\nRewards distributed' },
      ].map((step, i) => (
        <div key={step.day} className="flex-1">
          <div className="text-xs font-bold text-purple-300 mb-1">{step.day}</div>
          <div className="text-[10px] text-white/50 whitespace-pre-line leading-tight">{step.desc}</div>
          {i < 2 && <div className="text-white/10 mt-2">→</div>}
        </div>
      ))}
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────── */

const CONTENT_MAP: Record<Tab, () => JSX.Element> = {
  divisions: DivisionsContent,
  cards: CardsContent,
  'no-nft': NoNftContent,
  rewards: RewardsContent,
  season: SeasonContent,
};

const Rewards = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('divisions');

  const ContentComponent = CONTENT_MAP[activeTab];

  return (
    <div
      className="min-h-screen text-white font-mono flex flex-col"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(102,255,238,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(170,68,255,0.03) 0%, transparent 50%), #050510',
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-cyan-500/10 backdrop-blur-md bg-[#050510]/70">
        <button
          onClick={() => navigate('/')}
          className="text-cyan-400/60 hover:text-cyan-300 transition-colors text-sm tracking-wider"
        >
          ← BACK
        </button>
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/20">Nebula Cascade</div>
        <div className="w-16" />
      </header>

      {/* Title */}
      <div className="text-center pt-8 pb-4">
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-4" />
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-[0.4em]"
          style={{ color: '#66ffee', textShadow: '0 0 20px rgba(102,255,238,0.3), 0 0 60px rgba(102,255,238,0.1)' }}
        >
          REWARDS & RULES
        </h1>
        <p className="text-[10px] uppercase tracking-[0.5em] text-red-500 mt-2">System Overview</p>
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-4" />
      </div>

      {/* Tab buttons */}
      <div className="flex flex-wrap justify-center gap-2 px-4 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
              activeTab === tab.key
                ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white/60 hover:border-white/20'
            }`}
            style={activeTab === tab.key ? { boxShadow: '0 0 12px rgba(102,255,238,0.15)', textShadow: '0 0 6px rgba(102,255,238,0.3)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="flex-1 px-4 pb-10">
        <div className="max-w-2xl mx-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
          <ContentComponent />
        </div>
      </div>
    </div>
  );
};

export default Rewards;
