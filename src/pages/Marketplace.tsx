import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getActiveListings, buyCard, cancelListing, listCard, calculateFee, type MarketplaceListing } from '@/lib/marketplaceSystem';
import { getCardsForPlayer, setActiveCard, type CardMetadata } from '@/lib/cardSystem';
import { getCardEnergy, type CardEnergy } from '@/lib/energySystem';
import { DIVISION_LABELS, type Division } from '@/lib/divisionSystem';
import { Input } from '@/components/ui/input';
import WalletConnect from '@/components/wallet/WalletConnect';
import WalletMismatchModal from '@/components/wallet/WalletMismatchModal';
import NFTGrid from '@/components/marketplace/NFTGrid';
import { useToast } from '@/hooks/use-toast';
import { useWalletSync } from '@/hooks/useWalletSync';

/* ── Types ── */
type EnrichedListing = MarketplaceListing & { cardName?: string; cardDivision?: Division; cardColor?: string };
type Section = 'marketplace' | 'my-cards' | 'profile' | 'wallet';

const DIVISIONS: (Division | 'all')[] = ['all', 'gem_v', 'gem_iv', 'gem_iii', 'gem_ii', 'gem_i'];
const DIV_FILTER_LABELS: Record<string, string> = { all: 'ALL', gem_v: 'V', gem_iv: 'IV', gem_iii: 'III', gem_ii: 'II', gem_i: 'I' };

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ── Auth state ── */
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Player state ── */
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [cards, setCards] = useState<CardMetadata[]>([]);
  const [cardEnergies, setCardEnergies] = useState<Record<string, CardEnergy>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  /* ── Marketplace state ── */
  const [listings, setListings] = useState<EnrichedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [divFilter, setDivFilter] = useState<Division | 'all'>('all');

  /* ── Listing form ── */
  const [listingCardId, setListingCardId] = useState<string | null>(null);
  const [listPrice, setListPrice] = useState('');
  const [estimatedFee, setEstimatedFee] = useState(5);
  const [listingSubmitting, setListingSubmitting] = useState(false);

  /* ── Auth form ── */
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  /* ── Navigation ── */
  const [section, setSection] = useState<Section>('marketplace');
  const [marketTab, setMarketTab] = useState<'mint' | 'trade'>('mint');

  /* ── Wallet mismatch modal ── */
  const [mismatchOpen, setMismatchOpen] = useState(false);
  const [mismatchAddr, setMismatchAddr] = useState<string | null>(null);

  /* ── Wallet sync (Thirdweb ↔ Supabase) ── */
  useWalletSync({
    userId: user?.id ?? null,
    onLinked: (addr) => setWalletAddress(addr),
    onMismatch: (addr) => { setMismatchAddr(addr); setMismatchOpen(true); },
  });

  /* ── Auth listener ── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Load player + cards + listings ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    if (user) {
      const { data: player } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (player) {
        setPlayerId(player.id);
        setPlayerData(player);
        setWalletAddress(player.wallet_address ?? null);
        setActiveCardId(player.active_card_id ?? null);
        const playerCards = await getCardsForPlayer(player.id);
        setCards(playerCards);
        const energies: Record<string, CardEnergy> = {};
        for (const card of playerCards) {
          const e = await getCardEnergy(card.id);
          if (e) energies[card.id] = e;
        }
        setCardEnergies(energies);
      }
    }

    const active = await getActiveListings();
    const cardIds = active.map(l => l.cardId);
    const { data: listingCards } = await supabase
      .from('cards')
      .select('id, name, division, color_hex')
      .in('id', cardIds.length > 0 ? cardIds : ['00000000-0000-0000-0000-000000000000']);
    const cardMap = new Map(listingCards?.map(c => [c.id, c]) ?? []);
    setListings(active.map(l => {
      const card = cardMap.get(l.cardId);
      return { ...l, cardName: card?.name ?? 'Unknown', cardDivision: (card?.division as Division) ?? 'gem_v', cardColor: card?.color_hex ?? '#5599ff' };
    }));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Fee preview ── */
  useEffect(() => {
    if (listingCardId) calculateFee(listingCardId).then(setEstimatedFee);
  }, [listingCardId]);

  /* ── Handlers ── */
  const handleBuy = async (id: string) => {
    if (!playerId) return;
    const ok = await buyCard(id, playerId);
    if (ok) { toast({ title: 'Card purchased!' }); loadData(); }
    else toast({ title: 'Purchase failed', variant: 'destructive' });
  };
  const handleCancel = async (id: string) => {
    const ok = await cancelListing(id);
    if (ok) { toast({ title: 'Listing cancelled' }); setListings(prev => prev.filter(l => l.id !== id)); }
  };
  const handleSetActive = async (cardId: string) => {
    if (!playerId) return;
    const ok = await setActiveCard(playerId, cardId);
    if (ok) setActiveCardId(cardId);
  };
  const handleList = async () => {
    if (!playerId || !listingCardId || !listPrice) return;
    setListingSubmitting(true);
    const cents = Math.round(parseFloat(listPrice) * 100);
    if (cents <= 0) { toast({ title: 'Invalid price', variant: 'destructive' }); setListingSubmitting(false); return; }
    const ok = await listCard(listingCardId, playerId, cents);
    if (ok) { toast({ title: 'Card listed!' }); setListingCardId(null); setListPrice(''); loadData(); }
    else toast({ title: 'Listing failed', variant: 'destructive' });
    setListingSubmitting(false);
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!' });
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName || email.split('@')[0] }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'Verification link sent.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setAuthSubmitting(false); }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setPlayerId(null); setPlayerData(null);
    navigate('/');
  };

  /* ── Derived ── */
  const filteredListings = divFilter === 'all' ? listings : listings.filter(l => l.cardDivision === divFilter);
  const priceCents = Math.round((parseFloat(listPrice) || 0) * 100);
  const feeAmount = priceCents * estimatedFee / 100;
  const sellerReceives = priceCents - feeAmount;

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'marketplace', label: 'MARKET', icon: '🏪' },
    { key: 'my-cards', label: 'MY CARDS', icon: '🃏' },
    { key: 'profile', label: 'PROFILE', icon: '👤' },
    { key: 'wallet', label: 'WALLET', icon: '💎' },
  ];

  /* ── Shared classes ── */
  const panel = "rounded-xl border border-white/10 bg-black/55 backdrop-blur-md glow-border-blue";
  const btnPrimary = "min-h-[44px] px-5 rounded-lg border bg-black/40 glow-yellow glow-border-yellow text-sm tracking-[0.2em] font-bold hover:bg-yellow-400/10 hover:scale-[1.03] transition-all disabled:opacity-40";
  const btnSecondary = "min-h-[44px] px-5 rounded-lg border bg-black/40 glow-blue glow-border-blue text-sm tracking-[0.2em] font-bold hover:bg-blue-400/10 hover:scale-[1.03] transition-all disabled:opacity-40";

  return (
    <div className="min-h-screen font-mono relative overflow-x-hidden" style={{ background: '#050510' }}>
      {/* Cinematic galaxy background */}
      <div className="market-galaxy" />

      {/* Starfield dots */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: i % 5 === 0 ? '#ffdd00' : i % 3 === 0 ? '#5599ff' : '#e8f4ff',
              opacity: 0.15 + Math.random() * 0.5,
              boxShadow: '0 0 4px currentColor',
              animation: `pulse ${2 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-blue-500/20 bg-black/40 backdrop-blur-md">
        <button onClick={() => navigate('/')} className="glow-blue text-sm tracking-widest hover:scale-110 transition-transform min-h-[44px] px-3">
          ← BACK
        </button>
        <h1 className="text-3xl md:text-4xl font-bold tracking-[0.5em] glow-yellow">
          NEBULA HUB
        </h1>
        <div className="w-20" />
      </div>

      <div className="relative z-10 flex">
        {/* ── Sidebar ── */}
        <nav className="w-52 flex-shrink-0 border-r border-blue-500/20 bg-black/50 backdrop-blur-md flex flex-col sticky top-[73px] self-start h-[calc(100vh-73px)]">
          <div className="flex-1 py-6 space-y-2">
            {navItems.map(item => {
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className={`relative w-full text-left px-5 py-4 text-base tracking-[0.25em] uppercase font-bold transition-all flex items-center gap-3 min-h-[52px] ${
                    active ? 'glow-yellow bg-yellow-400/5' : 'glow-blue opacity-70 hover:opacity-100 hover:bg-blue-400/5'
                  }`}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                      style={{ background: '#ffdd00', boxShadow: '0 0 12px #ffdd00, 0 0 24px #ffdd00' }}
                    />
                  )}
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
          {user && (
            <div className="p-4 border-t border-blue-500/20">
              <button onClick={handleLogout} className="w-full glow-white text-sm tracking-widest uppercase py-3 hover:glow-yellow transition-all min-h-[44px]">
                LOG OUT
              </button>
            </div>
          )}
        </nav>

        {/* ── Content ── */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* ════════ MARKETPLACE ════════ */}
          {section === 'marketplace' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-3xl uppercase tracking-[0.3em] menu-neon-title-red font-bold">Card Marketplace</h2>
                {marketTab === 'trade' && (
                  <span className="text-sm glow-white tracking-widest">
                    {filteredListings.length} LISTING{filteredListings.length !== 1 ? 'S' : ''}
                  </span>
                )}
              </div>

              {/* Mint / Trade tab bar */}
              <div
                className="inline-flex rounded-lg border bg-black/55 p-1 backdrop-blur-md"
                style={{
                  borderColor: 'rgba(255, 51, 68, 0.3)',
                  boxShadow: '0 0 20px rgba(255, 51, 68, 0.12)',
                }}
              >
                {(['mint', 'trade'] as const).map(t => {
                  const active = marketTab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setMarketTab(t)}
                      className="min-h-[44px] px-6 rounded-md text-sm tracking-[0.25em] font-mono font-bold uppercase transition-all"
                      style={{
                        background: active ? 'rgba(255, 51, 68, 0.12)' : 'transparent',
                        color: active ? '#ff8899' : 'rgba(255,255,255,0.45)',
                        textShadow: active ? '0 0 10px #ff3344' : 'none',
                        boxShadow: active ? 'inset 0 0 12px rgba(255, 51, 68, 0.2)' : 'none',
                      }}
                    >
                      {t === 'mint' ? '◈ Mint' : '⇄ Trade'}
                    </button>
                  );
                })}
              </div>

              {/* MINT — live on-chain grid */}
              {marketTab === 'mint' && (
                <div className="space-y-5">
                  <p className="text-xs text-white/40 font-mono tracking-widest uppercase">
                    Primary mint · Direct from contract on Base · Chain 8453
                  </p>
                  <NFTGrid />
                </div>
              )}

              {/* TRADE — existing peer-to-peer listings */}
              {marketTab === 'trade' && (
                <div className="space-y-5">
                  {/* Division filter */}
                  <div className="flex gap-3 flex-wrap">
                    {DIVISIONS.map(d => {
                      const active = divFilter === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setDivFilter(d)}
                          className={`min-h-[44px] px-5 py-2 text-sm tracking-[0.2em] font-bold rounded-lg border bg-black/40 transition-all hover:scale-105 ${
                            active ? 'glow-yellow glow-border-yellow' : 'glow-white glow-border-blue opacity-70 hover:opacity-100'
                          }`}
                        >
                          {DIV_FILTER_LABELS[d]}
                        </button>
                      );
                    })}
                  </div>

                  {loading ? (
                    <div className="text-center glow-blue text-lg tracking-widest py-20 animate-pulse">LOADING LISTINGS…</div>
                  ) : filteredListings.length === 0 ? (
                    <div className={`${panel} flex flex-col items-center py-20 space-y-4`}>
                      <div
                        className="w-20 h-20 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 40% 40%, rgba(85,153,255,0.5), rgba(255,221,0,0.2), transparent)',
                          boxShadow: '0 0 40px rgba(85,153,255,0.3), 0 0 80px rgba(255,221,0,0.15)',
                        }}
                      />
                      <span className="text-xl tracking-[0.3em] glow-blue font-bold">NO ACTIVE LISTINGS</span>
                      <span className="text-sm glow-white tracking-widest">Cards listed for trade will appear here</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredListings.map(listing => (
                        <div
                          key={listing.id}
                          className={`${panel} p-5 transition-all group hover:scale-[1.03] hover:glow-border-yellow cursor-pointer`}
                        >
                          {/* Card orb */}
                          <div className="flex items-center gap-4 mb-5">
                            <div
                              className="w-14 h-14 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                              style={{
                                background: `radial-gradient(circle at 35% 35%, ${listing.cardColor}ee, ${listing.cardColor}50)`,
                                boxShadow: `0 0 25px ${listing.cardColor}60, 0 0 50px ${listing.cardColor}30, inset 0 -2px 6px ${listing.cardColor}30`,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-bold truncate glow-blue">{listing.cardName}</div>
                              <div className="text-xs glow-white tracking-widest mt-1">
                                {DIVISION_LABELS[listing.cardDivision!]}
                              </div>
                            </div>
                          </div>

                          {/* Price + fee */}
                          <div className="flex items-end justify-between mb-5">
                            <div>
                              <div className="text-xs glow-white uppercase tracking-widest mb-1">Price</div>
                              <div className="text-2xl font-bold glow-yellow">
                                ${(listing.priceCents / 100).toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs glow-white tracking-widest">
                                {listing.feePercent}% FEE
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {playerId && listing.sellerPlayerId !== playerId && (
                            <button onClick={() => handleBuy(listing.id)} className={`w-full ${btnPrimary}`}>
                              BUY
                            </button>
                          )}
                          {playerId && listing.sellerPlayerId === playerId && (
                            <button onClick={() => handleCancel(listing.id)} className={`w-full ${btnSecondary}`}>
                              CANCEL LISTING
                            </button>
                          )}
                          {!playerId && (
                            <button onClick={() => setSection('profile')} className={`w-full ${btnSecondary}`}>
                              SIGN IN TO BUY
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════ MY CARDS ════════ */}
          {section === 'my-cards' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              {!user ? (
                <div className={`${panel} flex flex-col items-center py-20 space-y-5`}>
                  <div
                    className="w-20 h-20 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 40% 40%, rgba(255,221,0,0.4), rgba(85,153,255,0.2), transparent)',
                      boxShadow: '0 0 40px rgba(255,221,0,0.2), 0 0 80px rgba(85,153,255,0.1)',
                    }}
                  />
                  <span className="text-xl tracking-[0.3em] glow-yellow font-bold">SIGN IN TO VIEW YOUR CARDS</span>
                  <button onClick={() => setSection('profile')} className={btnPrimary}>
                    GO TO PROFILE →
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl uppercase tracking-[0.3em] glow-yellow font-bold">Your Cards</h2>
                    <span className="text-sm glow-white tracking-widest border border-blue-500/30 glow-border-blue px-3 py-2 rounded">{cards.length} / 10</span>
                  </div>

                  {/* Listing form */}
                  {listingCardId && (
                    <div className={`${panel} p-6 space-y-5 glow-border-yellow`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg tracking-[0.25em] glow-yellow uppercase font-bold">List Card for Sale</h3>
                        <button onClick={() => { setListingCardId(null); setListPrice(''); }} className="glow-white text-xl hover:glow-yellow transition-all w-10 h-10">✕</button>
                      </div>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                          <label className="text-xs glow-blue uppercase tracking-widest font-bold">Price (USD)</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={listPrice}
                            onChange={e => setListPrice(e.target.value)}
                            className="bg-black/50 border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono h-12 text-lg glow-yellow glow-border-blue"
                          />
                        </div>
                        <button
                          onClick={handleList}
                          disabled={listingSubmitting || !listPrice || parseFloat(listPrice) <= 0}
                          className={btnPrimary}
                        >
                          {listingSubmitting ? '...' : 'LIST'}
                        </button>
                      </div>
                      {/* Fee converter */}
                      {parseFloat(listPrice) > 0 && (
                        <div className="text-sm space-y-2 border-t border-blue-500/20 pt-4">
                          <div className="flex justify-between">
                            <span className="glow-blue tracking-widest">Sale price</span>
                            <span className="glow-white font-bold">${(priceCents / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="glow-blue tracking-widest">Fee ({estimatedFee}%)</span>
                            <span className="glow-white font-bold">−${(feeAmount / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-500/20">
                            <span className="glow-blue tracking-widest">You receive</span>
                            <span className="glow-yellow">${(sellerReceives / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {cards.length === 0 ? (
                    <div className={`${panel} flex flex-col items-center py-16 space-y-4`}>
                      <div
                        className="w-16 h-16 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 40% 40%, rgba(85,153,255,0.4), transparent)',
                          boxShadow: '0 0 30px rgba(85,153,255,0.2)',
                        }}
                      />
                      <span className="text-xl tracking-[0.3em] glow-blue font-bold">NO CARDS YET</span>
                      <span className="text-sm glow-white tracking-widest">Purchase cards from the marketplace</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {cards.map(card => {
                        const energy = cardEnergies[card.id];
                        const isActive = card.id === activeCardId;
                        const isListed = listings.some(l => l.cardId === card.id && l.status === 'active');
                        return (
                          <div
                            key={card.id}
                            className={`${panel} p-5 transition-all cursor-pointer group hover:scale-[1.02] ${
                              isActive ? 'glow-border-yellow' : 'hover:glow-border-yellow'
                            }`}
                            onClick={() => !isListed && handleSetActive(card.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all glow-white ${
                                  isActive ? 'animate-pulse' : 'group-hover:scale-110'
                                }`}
                                style={{
                                  background: `radial-gradient(circle at 35% 35%, ${card.colorHex}ee, ${card.colorHex}50)`,
                                  boxShadow: isActive
                                    ? `0 0 30px ${card.colorHex}80, 0 0 60px ${card.colorHex}40`
                                    : `0 0 18px ${card.colorHex}50`,
                                }}
                              >
                                {card.tokenId}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-base font-bold truncate glow-blue">{card.name}</div>
                                <div className="text-xs tracking-widest mt-1 flex items-center gap-2">
                                  <span className="glow-white">{DIVISION_LABELS[card.division]}</span>
                                  {isActive && <span className="glow-yellow">• ACTIVE</span>}
                                  {isListed && <span className="glow-yellow">• LISTED</span>}
                                </div>
                              </div>
                              {energy && (
                                <div className="text-right flex-shrink-0">
                                  <div className={`text-base font-bold ${energy.energy > 0 ? 'glow-yellow' : 'glow-white'}`}>
                                    ⚡ {energy.energy}/{energy.maxEnergy}
                                  </div>
                                  <div className="flex gap-1 mt-2 justify-end">
                                    {Array.from({ length: energy.maxEnergy }).map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                          background: i < energy.energy ? '#ffdd00' : '#ffffff15',
                                          boxShadow: i < energy.energy ? '0 0 6px #ffdd00' : 'none',
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {!isListed && (
                              <div className="mt-4 pt-4 border-t border-blue-500/20 flex justify-end">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setListingCardId(card.id); setSection('my-cards'); }}
                                  className="min-h-[40px] px-4 py-2 rounded-lg border bg-black/40 glow-yellow glow-border-yellow text-xs tracking-[0.2em] font-bold hover:scale-105 hover:bg-yellow-400/10 transition-all"
                                >
                                  LIST ON MARKETPLACE
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════ PROFILE ════════ */}
          {section === 'profile' && (
            <div className="max-w-md mx-auto space-y-8 animate-fade-in">
              {!user ? (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold tracking-[0.3em] glow-yellow">
                      {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    </h2>
                    <p className="text-sm glow-white tracking-widest">Access cards, wallet, marketplace</p>
                  </div>

                  <div className={`${panel} p-7`}>
                    <form onSubmit={handleAuth} className="space-y-4">
                      {!isLogin && (
                        <div className="space-y-2">
                          <label className="text-xs glow-blue uppercase tracking-widest font-bold">Display Name</label>
                          <Input
                            placeholder="Player name"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="bg-black/50 border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono h-12 glow-yellow glow-border-blue"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-xs glow-blue uppercase tracking-widest font-bold">Email</label>
                        <Input
                          type="email"
                          placeholder="you@nebula.cascade"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="bg-black/50 border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono h-12 glow-yellow glow-border-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs glow-blue uppercase tracking-widest font-bold">Password</label>
                        <Input
                          type="password"
                          placeholder="••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-black/50 border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono h-12 glow-yellow glow-border-blue"
                        />
                      </div>
                      <button type="submit" disabled={authSubmitting} className={`w-full ${btnPrimary} mt-2`}>
                        {authSubmitting ? '...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
                      </button>
                    </form>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full mt-4 py-3 text-xs glow-white tracking-widest hover:glow-yellow transition-all min-h-[44px]"
                    >
                      {isLogin ? 'CREATE NEW ACCOUNT' : 'ALREADY HAVE AN ACCOUNT'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl uppercase tracking-[0.3em] glow-yellow font-bold">Profile</h2>

                  <div className={`${panel} p-6 space-y-6`}>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl glow-white"
                        style={{
                          background: 'radial-gradient(circle at 40% 40%, rgba(255,221,0,0.3), rgba(85,153,255,0.15), transparent)',
                          border: '1px solid rgba(255,221,0,0.4)',
                          boxShadow: '0 0 25px rgba(255,221,0,0.2), inset 0 0 12px rgba(85,153,255,0.1)',
                        }}
                      >
                        👤
                      </div>
                      <div>
                        <div className="text-lg font-bold glow-yellow">{playerData?.display_name ?? 'Player'}</div>
                        <div className="text-xs glow-white tracking-widest mt-1">{user.email}</div>
                      </div>
                    </div>

                    {playerData && (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Division', value: DIVISION_LABELS[playerData.division as Division] },
                          { label: 'Matches', value: playerData.total_matches },
                          { label: 'Points', value: playerData.division_points },
                          { label: 'Cards', value: `${cards.length}/10` },
                        ].map(stat => (
                          <div key={stat.label} className="rounded-lg border border-blue-500/30 bg-black/40 glow-border-blue p-4">
                            <div className="text-xs glow-blue uppercase tracking-widest mb-2 font-bold">{stat.label}</div>
                            <div className="text-xl font-bold glow-yellow">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeCardId && (
                      <div className="space-y-3">
                        <div className="text-xs glow-blue uppercase tracking-widest font-bold">Active Card</div>
                        {(() => {
                          const card = cards.find(c => c.id === activeCardId);
                          if (!card) return null;
                          return (
                            <div className="flex items-center gap-4 rounded-lg border border-yellow-400/30 bg-black/40 glow-border-yellow p-4">
                              <div
                                className="w-10 h-10 rounded-full"
                                style={{
                                  background: `radial-gradient(circle at 35% 35%, ${card.colorHex}ee, ${card.colorHex}50)`,
                                  boxShadow: `0 0 18px ${card.colorHex}60`,
                                }}
                              />
                              <div>
                                <div className="text-sm font-bold glow-blue">{card.name}</div>
                                <div className="text-xs glow-white tracking-widest mt-1">{DIVISION_LABELS[card.division]}</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════ WALLET ════════ */}
          {section === 'wallet' && (
            <div className="max-w-md mx-auto space-y-8 animate-fade-in">
              <h2 className="text-3xl uppercase tracking-[0.3em] glow-yellow font-bold">Wallet</h2>

              {/* Coming Soon — Base */}
              <div className={`${panel} p-7 text-center space-y-4`}>
                <div
                  className="w-20 h-20 rounded-full mx-auto"
                  style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(255,221,0,0.4), rgba(85,153,255,0.2), transparent)',
                    boxShadow: '0 0 40px rgba(255,221,0,0.25), 0 0 80px rgba(85,153,255,0.15)',
                  }}
                />
                <h3 className="text-xl font-bold tracking-[0.25em] glow-yellow">
                  BASE WALLET — COMING SOON
                </h3>
                <p className="text-sm glow-white tracking-widest leading-relaxed">
                  Wallet connection via Thirdweb will be available when the Base integration launches.
                </p>
              </div>

              {/* Legacy wallet connect */}
              <WalletConnect currentAddress={walletAddress} />

              {/* Blockchain info */}
              <div className={`${panel} p-5 space-y-3`}>
                <h3 className="text-lg font-bold glow-yellow tracking-widest">Blockchain Info</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="glow-blue tracking-widest">Chain</span>
                    <span className="glow-white font-bold">Base (planned)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="glow-blue tracking-widest">Auth Provider</span>
                    <span className="glow-white font-bold">Thirdweb (planned)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="glow-blue tracking-widest">Fee Model</span>
                    <span className="glow-yellow font-bold">Flat 3%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Wallet collision modal */}
      <WalletMismatchModal
        open={mismatchOpen}
        onOpenChange={setMismatchOpen}
        conflictingAddress={mismatchAddr}
      />
    </div>
  );
};

export default Marketplace;
