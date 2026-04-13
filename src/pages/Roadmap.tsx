import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface Milestone {
  text: string;
  done: boolean;
}

interface RoadmapMonth {
  month: string;
  year: number;
  monthIndex: number; // 0-based (0=Jan)
  goal: string;
  color: string;
  glow: string;
  milestones: Milestone[];
  deliverable: string;
}

const ROADMAP_DATA: RoadmapMonth[] = [
  {
    month: 'APRIL',
    year: 2026,
    monthIndex: 3,
    goal: 'Beta launch with core NFT integration',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    milestones: [
      { text: 'UI complete and deployed', done: true },
      { text: 'Wallet connection via Thirdweb', done: true },
      { text: 'Core puzzle gameplay functional', done: true },
      { text: 'Energy system (2/day, UTC reset)', done: true },
      { text: 'Division system logic (I-V rarity tiers)', done: true },
      { text: 'Primary/Secondary card rewards (100% / 20%)', done: true },
      { text: 'No-NFT bracket with random energy activation', done: true },
      { text: 'Deploy first NFT collection (King Cold + 15 copies)', done: false },
      { text: 'Test energy consumption with real wallets', done: false },
      { text: 'Verify leaderboard score submission', done: false },
      { text: 'Onboard 50-100 beta testers', done: false },
      { text: 'Track first week of gameplay data', done: false },
      { text: 'Set up 40-day season timer', done: false },
      { text: 'Build simple admin panel for rewards calculation', done: false },
      { text: 'Begin marketplace UI development', done: false },
    ],
    deliverable: 'Closed beta live. Initial NFT cards minted and playable.',
  },
  {
    month: 'MAY',
    year: 2026,
    monthIndex: 4,
    goal: 'Marketplace launch + public access',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    milestones: [
      { text: 'Marketplace functional (buy/list/sell cards)', done: false },
      { text: '3% trading fee implemented', done: false },
      { text: 'Fee routing to rewards pool tracked', done: false },
      { text: 'Card ownership transfers with energy reset', done: false },
      { text: 'Marketplace reaches 90% completion', done: false },
      { text: 'Swap functionality added', done: false },
      { text: 'Public registration opens', done: false },
      { text: 'Additional 50-100 cards minted across divisions', done: false },
      { text: 'First season concludes (40-day cycle ends)', done: false },
      { text: 'Manual rewards distribution to beta players', done: false },
    ],
    deliverable: 'Marketplace live. Public can join and trade. First rewards paid.',
  },
  {
    month: 'JUNE',
    year: 2026,
    monthIndex: 5,
    goal: 'Scale and stabilize',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    milestones: [
      { text: '100% marketplace completion', done: false },
      { text: 'Automated off-chain rewards system', done: false },
      { text: 'Player profiles with stats/history', done: false },
      { text: 'Anti-bot protections', done: false },
      { text: 'Second card collection drop', done: false },
      { text: 'Community dashboard launch', done: false },
      { text: 'Season 2 underway', done: false },
      { text: 'Target: 500+ daily active users', done: false },
    ],
    deliverable: 'Fully functional economy. Growing player base.',
  },
  {
    month: 'JULY',
    year: 2026,
    monthIndex: 6,
    goal: 'Expansion',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.4)',
    milestones: [
      { text: 'Third card collection release', done: false },
      { text: 'Mobile-responsive optimization', done: false },
      { text: 'Seasonal event (tournament style)', done: false },
      { text: 'Referral system launch', done: false },
      { text: 'Target: 1,000+ daily active users', done: false },
    ],
    deliverable: 'Expanded card ecosystem. Tournament events live.',
  },
  {
    month: 'AUGUST',
    year: 2026,
    monthIndex: 7,
    goal: 'Platform maturity',
    color: '#f43f5e',
    glow: 'rgba(244,63,94,0.4)',
    milestones: [
      { text: '500+ total NFTs in circulation', done: false },
      { text: 'Multi-chain exploration (optional chain support)', done: false },
      { text: 'Treasury transparency reports', done: false },
      { text: 'Community governance on 30% allocation', done: false },
      { text: 'Target: 2,000+ daily active users', done: false },
    ],
    deliverable: 'Mature platform with community governance.',
  },
];

const Roadmap = () => {
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [expanded, setExpanded] = useState<number[]>(
    ROADMAP_DATA.map((m, i) =>
      m.year === currentYear && m.monthIndex === currentMonth ? i : -1
    ).filter(i => i >= 0)
  );

  const toggle = (i: number) =>
    setExpanded(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]));

  const getStatus = (m: RoadmapMonth) => {
    if (m.year < currentYear || (m.year === currentYear && m.monthIndex < currentMonth)) return 'past';
    if (m.year === currentYear && m.monthIndex === currentMonth) return 'current';
    return 'future';
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg border border-red-500/50 bg-red-500/20 px-5 py-2 text-red-300 hover:bg-red-500/30 transition-colors text-sm uppercase tracking-widest"
          style={{ textShadow: '0 0 8px #ff3333' }}
        >
          ← Back
        </button>
      </div>

      {/* Title */}
      <div className="text-center pt-4 pb-8">
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-4" />
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-[0.4em]"
          style={{ color: '#66ffee', textShadow: '0 0 20px rgba(102,255,238,0.3), 0 0 60px rgba(102,255,238,0.1)' }}
        >
          ROADMAP
        </h1>
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/25 mt-2">Development Timeline</p>
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-4" />
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 pb-16 relative">
        {/* Vertical line */}
        <div className="absolute left-8 md:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/20 via-cyan-500/10 to-transparent" />

        {ROADMAP_DATA.map((month, i) => {
          const status = getStatus(month);
          const isOpen = expanded.includes(i);
          const doneCount = month.milestones.filter(m => m.done).length;
          const totalCount = month.milestones.length;
          const progress = Math.round((doneCount / totalCount) * 100);

          return (
            <div
              key={month.month}
              className={`relative ml-12 md:ml-20 mb-6 transition-opacity duration-500 ${status === 'future' ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[2.05rem] md:-left-[2.55rem] top-4 w-4 h-4 rounded-full border-2 ${
                  status === 'current' ? 'animate-pulse' : ''
                }`}
                style={{
                  borderColor: month.color,
                  backgroundColor: status === 'past' ? month.color : status === 'current' ? month.color : 'transparent',
                  boxShadow: status !== 'future' ? `0 0 12px ${month.glow}` : 'none',
                }}
              />

              {/* Card */}
              <div
                className="rounded-xl border overflow-hidden cursor-pointer"
                style={{
                  borderColor: `${month.color}33`,
                  background: `linear-gradient(135deg, ${month.color}08, transparent)`,
                }}
                onClick={() => toggle(i)}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span
                        className="text-lg font-black tracking-[0.3em]"
                        style={{ color: month.color, textShadow: `0 0 12px ${month.glow}` }}
                      >
                        {month.month} {month.year}
                      </span>
                      <p className="text-white/40 text-xs mt-0.5">{month.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress badge */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ borderColor: `${month.color}44`, color: month.color }}
                    >
                      {doneCount}/{totalCount}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: month.color }}
                    />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mx-5 h-1 rounded-full bg-white/5 mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, backgroundColor: month.color }}
                  />
                </div>

                {/* Expandable content */}
                {isOpen && (
                  <div className="px-5 py-4 border-t" style={{ borderColor: `${month.color}15` }}>
                    <ul className="space-y-2">
                      {month.milestones.map((ms, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 flex-shrink-0">
                            {ms.done ? '✅' : '🔄'}
                          </span>
                          <span className={ms.done ? 'text-white/70 line-through' : 'text-white/50'}>
                            {ms.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div
                      className="mt-4 pt-3 border-t text-xs"
                      style={{ borderColor: `${month.color}15`, color: month.color }}
                    >
                      <span className="text-white/30 mr-2">DELIVERABLE:</span>
                      {month.deliverable}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
