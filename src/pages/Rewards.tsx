import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIVISION_LABELS, DIVISION_COLORS, DIVISION_RARITY, type Division } from '@/lib/divisionSystem';

type Tab = 'divisions' | 'cards' | 'no-nft' | 'rewards' | 'season';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'divisions', label: 'Divisions', icon: '💎' },
  { key: 'cards', label: 'Cards', icon: '🃏' },
  { key: 'no-nft', label: 'No NFT', icon: '🆓' },
  { key: 'rewards', label: 'Rewards', icon: '🏆' },
  { key: 'season', label: 'Season', icon: '⏳' },
];

const DIVISIONS_ORDERED: { key: Division; roman: string; color: string }[] = [
  { key: 'gem_i', roman: 'I', color: DIVISION_COLORS.gem_i },
  { key: 'gem_ii', roman: 'II', color: DIVISION_COLORS.gem_ii },
  { key: 'gem_iii', roman: 'III', color: DIVISION_COLORS.gem_iii },
  { key: 'gem_iv', roman: 'IV', color: DIVISION_COLORS.gem_iv },
  { key: 'gem_v', roman: 'V', color: DIVISION_COLORS.gem_v },
];

/* ─── Reusable building blocks ──────────────────────────── */

const SectionTitle = ({ children, color = '#66ffee' }: { children: React.ReactNode; color?: string }) => (
  <h2
    className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] mb-3"
    style={{ color, textShadow: `0 0 12px ${color}55` }}
  >
    {children}
  </h2>
);

const Para = ({ children }: { children: React.ReactNode }) => (
  <p className="text-white/90 text-base md:text-[15px] leading-[1.7]">{children}</p>
);

const Highlight = ({ children, color = '#66ffee' }: { children: React.ReactNode; color?: string }) => (
  <span className="font-bold" style={{ color, textShadow: `0 0 8px ${color}55` }}>{children}</span>
);

const KeyFact = ({ icon, value, label, color = '#66ffee' }: { icon: string; value: string; label: string; color?: string }) => (
  <div
    className="rounded-xl border p-4 text-center backdrop-blur-sm transition-transform hover:scale-[1.03]"
    style={{
      borderColor: `${color}40`,
      background: `linear-gradient(135deg, ${color}12, rgba(255,255,255,0.02))`,
      boxShadow: `0 0 16px ${color}15`,
    }}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-lg font-black" style={{ color, textShadow: `0 0 10px ${color}66` }}>{value}</div>
    <div className="text-[11px] text-white/70 mt-1 tracking-wider uppercase">{label}</div>
  </div>
);

/* ─── Tab content ──────────────────────────────────────── */

const DivisionsContent = () => (
  <div className="space-y-6">
    <SectionTitle>Five Tiers of Rarity</SectionTitle>
    <Para>
      Nebula uses a five-tier division system that represents <Highlight>rarity only — not skill</Highlight>.
      The worst player can own a Division I card, and the best player can start with Division V. Your card's
      division decides which leaderboard you compete in, but gives <Highlight color="#f87171">zero gameplay advantage</Highlight>.
      All cards share the same energy, rules, and scoring.
    </Para>
    <Para>
      Two things actually separate divisions: <Highlight>rarity</Highlight> (how many cards exist) and
      <Highlight> reward pool access</Highlight> (how the season prize money flows to you). Gameplay is identical
      across all five tiers — a Division V player can absolutely outscore a Division I player. What changes is
      which leaderboard you compete in and how you earn from the pool.
    </Para>
    <Para>
      Your <Highlight>Main Card</Highlight> earns you <Highlight>100%</Highlight> of its division's reward pool
      (if you rank). Any other cards you hold from different divisions earn <Highlight>20%</Highlight> of those
      pools. Hold a deep roster, earn from multiple brackets — but each extra card costs energy to activate.
    </Para>

    <div className="grid gap-3">
      {DIVISIONS_ORDERED.map(({ key, roman, color }) => {
        const rarity = DIVISION_RARITY[key];
        return (
          <div
            key={key}
            className="flex items-center gap-4 rounded-xl border px-5 py-4 transition-transform hover:translate-x-1"
            style={{
              borderColor: `${color}40`,
              background: `linear-gradient(135deg, ${color}12 0%, transparent 70%)`,
              boxShadow: `0 0 14px ${color}20`,
            }}
          >
            <div
              className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-black"
              style={{ color, background: `${color}18`, border: `1.5px solid ${color}55`, textShadow: `0 0 12px ${color}` }}
            >
              {roman}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base md:text-lg font-bold tracking-wider" style={{ color }}>
                  {DIVISION_LABELS[key]}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full tracking-widest uppercase font-bold"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}
                >
                  {rarity.rarity}
                </span>
              </div>
              <div className="text-xs text-white/70 mt-1">Supply: <span className="text-white">{rarity.supplyPercent}</span> of all cards</div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: DIVISIONS_ORDERED.length - DIVISIONS_ORDERED.findIndex(d => d.key === key) }).map((_, j) => (
                <div key={j} className="w-2.5 h-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const CardsContent = () => (
  <div className="space-y-6">
    <SectionTitle>How Cards Work</SectionTitle>
    <Para>
      Each card is an <Highlight>ERC-1155 NFT on the Base blockchain</Highlight>, deployed via Thirdweb. Cards
      carry an internal energy reserve. At the start of every match there is a <Highlight>40% chance</Highlight>
      to consume <Highlight>2 energy</Highlight> from your active card. No roll = free play, full leaderboard
      eligibility. Roll hits = energy spent.
    </Para>
    <Para>
      Energy refills on a <Highlight>rolling 24-hour timer per card</Highlight> — not a global midnight reset.
      Each card refills exactly 24 hours after its last consumption. Run a card dry and it's
      <Highlight color="#f87171"> unusable</Highlight> until its individual reset. Cycle between cards to keep playing.
    </Para>
    <Para>
      A wallet can hold up to <Highlight>10 cards</Highlight> total, and a maximum of <Highlight>2 copies</Highlight>
      of any single token ID. This keeps rosters deep but stops single-token hoarding. Points belong to your
      <Highlight> wallet</Highlight>, not your card — sell a card, points stay with you.
    </Para>
    <Para>
      <Highlight>Main Card vs Active Card</Highlight>: your Main Card is a sticky designation you choose — it
      qualifies you for <Highlight>100%</Highlight> of its division's reward pool. Your Active Card is per-match,
      drives in-game VFX, and decides which division leaderboard each run lands on.
    </Para>
    <Para>
      <Highlight color="#f87171">24-hour sale lock</Highlight>: listing or transferring a card triggers a
      24-hour in-game lock on it (anti-flip protection). The card stays in your wallet but can't be played
      until the lock expires.
    </Para>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KeyFact icon="🎲" value="40% ROLL" label="Energy chance / match" />
      <KeyFact icon="⚡" value="2 ENERGY" label="Cost when roll hits" color="#fbbf24" />
      <KeyFact icon="🃏" value="10 MAX" label="Cards per wallet" color="#a78bfa" />
      <KeyFact icon="♻️" value="2 COPY CAP" label="Per token ID" color="#34d399" />
    </div>
  </div>
);

const NoNftContent = () => (
  <div className="space-y-6">
    <SectionTitle color="#34d399">Play Free, Compete Fair</SectionTitle>
    <Para>
      You don't need a single NFT to play Nebula. Every account — created via Thirdweb (Google, email, etc.) —
      automatically joins the <Highlight color="#34d399">No-NFT bracket</Highlight>, a fully separate leaderboard
      from the NFT divisions.
    </Para>
    <Para>
      Bracket placement is <Highlight color="#34d399">wallet-based and live</Highlight>: zero cards = No-NFT bracket,
      one or more cards = appropriate division bracket. Sell all your cards and you return to No-NFT immediately.
      Scores stay valid in the bracket where they were earned.
    </Para>
    <Para>
      Free players use the same energy mechanic as card holders: every match has a <Highlight color="#34d399">40%
      chance</Highlight> to consume 2 energy from a shared <Highlight color="#34d399">player energy pool</Highlight>.
      Same rolling reset, same fair competition — just no card-specific mechanics. Free players compete only
      against other free players.
    </Para>

    <div
      className="rounded-xl border-2 p-5 backdrop-blur-sm"
      style={{
        borderColor: 'rgba(52,211,153,0.4)',
        background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(255,255,255,0.02))',
        boxShadow: '0 0 20px rgba(52,211,153,0.15)',
      }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">🔄</span>
        <div>
          <div className="text-sm font-black text-emerald-400 tracking-widest mb-2">FLUID BRACKETS</div>
          <p className="text-sm text-white/85 leading-relaxed">
            Wallet-based, real-time. <Highlight color="#34d399">0 NFTs</Highlight> → No-NFT bracket.
            <Highlight color="#34d399"> ≥1 NFT</Highlight> → Division bracket. Sell all → back to No-NFT.
            No lock-in, ever.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const RewardsContent = () => (
  <div className="space-y-6">
    <SectionTitle color="#fbbf24">How Rewards Are Funded</SectionTitle>
    <Para>
      The Nebula rewards pool is funded by <Highlight color="#fbbf24">30% of all platform fees</Highlight>:
      the 3% marketplace fee on every secondary sale plus a portion of primary card revenue.
      Fees accumulate continuously across each 40-day season — more trading means a bigger pool.
    </Para>
    <Para>
      At season's end, the team calculates payouts <Highlight color="#fbbf24">off-chain</Highlight> based on final
      leaderboard standings within each division. Your reward is determined by <Highlight color="#fbbf24">your rank
      relative to your division</Highlight>, not an absolute score.
    </Para>
    <Para>
      <Highlight color="#fbbf24">Main Card</Highlight> = 100% of one division's pool.
      <Highlight color="#fbbf24"> Secondary Cards</Highlight> = 20% of each additional division's pool you hold a
      card in. Both require leaderboard placement — holding alone doesn't pay. Once payouts are calculated, the
      team <Highlight color="#fbbf24">sends rewards directly to your wallet</Highlight>. No claiming process.
    </Para>
    <Para>
      All marketplace and reward values display in <Highlight color="#fbbf24">ETH + live USD equivalent</Highlight>
      (CoinGecko feed, refreshed every minute). The 30% allocation may be adjusted as the platform matures, with
      advance notice.
    </Para>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KeyFact icon="💰" value="30%" label="Fees → Pool" color="#fbbf24" />
      <KeyFact icon="🛒" value="3%" label="Marketplace fee" color="#fbbf24" />
      <KeyFact icon="👑" value="100%" label="Main card pool" color="#fbbf24" />
      <KeyFact icon="🃏" value="20%" label="Secondary pools" color="#fbbf24" />
    </div>
  </div>
);

const SeasonContent = () => (
  <div className="space-y-6">
    <SectionTitle color="#a78bfa">40-Day Competitive Cycles</SectionTitle>
    <Para>
      Nebula runs on <Highlight color="#a78bfa">40-day seasons</Highlight>. Each is a self-contained competition with
      its own leaderboards, pool, and payout. <Highlight color="#a78bfa">Day 1</Highlight>: every standing resets to
      zero. Everyone starts fresh.
    </Para>
    <Para>
      From Day 1 → Day 40, every ranked match counts. The leaderboard ranks by your <Highlight color="#a78bfa">average
      top-3 scores</Highlight>, rewarding consistency over lucky single runs. The reward pool grows with every
      marketplace transaction throughout the season.
    </Para>
    <Para>
      On <Highlight color="#a78bfa">Day 40</Highlight>, standings lock and the team begins off-chain payout calculation,
      including anti-cheat validation. Once finalized, rewards are sent directly to wallets. Then the cycle repeats:
      clean slate, new pool, same hunger.
    </Para>

    <div
      className="rounded-xl border-2 p-5 backdrop-blur-sm"
      style={{
        borderColor: 'rgba(167,139,250,0.4)',
        background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(255,255,255,0.02))',
        boxShadow: '0 0 20px rgba(167,139,250,0.15)',
      }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">🧪</span>
        <div>
          <div className="text-sm font-black text-purple-300 tracking-widest mb-2">BETA STATUS</div>
          <p className="text-sm text-white/85 leading-relaxed">
            The reward system is live but distribution activates after NFT launch on Base.
            Season structure may be refined during beta based on community feedback.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      {[
        { day: 'DAY 1', desc: 'Season begins\nLeaderboards reset', icon: '🚀' },
        { day: 'DAY 1–40', desc: 'Active competition\nPool grows daily', icon: '⚔️' },
        { day: 'DAY 40+', desc: 'Standings lock\nRewards sent', icon: '🏆' },
      ].map((step) => (
        <div
          key={step.day}
          className="rounded-xl border p-4 text-center backdrop-blur-sm"
          style={{
            borderColor: 'rgba(167,139,250,0.35)',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.08), transparent)',
          }}
        >
          <div className="text-2xl mb-1">{step.icon}</div>
          <div className="text-sm font-black text-purple-300 tracking-wider mb-1.5">{step.day}</div>
          <div className="text-xs text-white/75 whitespace-pre-line leading-snug">{step.desc}</div>
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
      className="min-h-screen w-full text-white font-mono"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(102,255,238,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(170,68,255,0.05) 0%, transparent 50%), #050510',
      }}
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-cyan-500/15 backdrop-blur-md bg-[#050510]/80">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-2 text-red-200 hover:bg-red-500/25 transition-colors text-sm uppercase tracking-widest"
          style={{ textShadow: '0 0 8px #ff3333' }}
        >
          ← Back
        </button>
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Nebula Cascade</div>
        <div className="w-20" />
      </header>

      {/* Title */}
      <div className="text-center pt-10 pb-6">
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-4" />
        <h1
          className="text-4xl md:text-6xl font-black uppercase tracking-[0.4em]"
          style={{ color: '#66ffee', textShadow: '0 0 20px rgba(102,255,238,0.5), 0 0 60px rgba(102,255,238,0.2)' }}
        >
          REWARDS & RULES
        </h1>
        <p className="text-xs uppercase tracking-[0.5em] text-red-400 mt-3">Everything you need to know</p>
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mt-4" />
      </div>

      {/* Tab buttons */}
      <div className="sticky top-[60px] z-10 flex flex-wrap justify-center gap-2 px-4 py-3 backdrop-blur-md bg-[#050510]/70 border-b border-white/5">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] border transition-all duration-300 flex items-center gap-2 ${
                isActive
                  ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200 scale-105'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.06]'
              }`}
              style={
                isActive
                  ? { boxShadow: '0 0 18px rgba(102,255,238,0.3)', textShadow: '0 0 8px rgba(102,255,238,0.5)' }
                  : undefined
              }
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="px-4 py-8 pb-32">
        <div
          key={activeTab}
          className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ boxShadow: '0 0 30px rgba(102,255,238,0.05)' }}
        >
          <ContentComponent />
        </div>
      </div>
    </div>
  );
};

export default Rewards;
