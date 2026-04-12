import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getActiveListings, buyCard, cancelListing, listCard, calculateFee, type MarketplaceListing } from '@/lib/marketplaceSystem';
import { getCardsForPlayer, setActiveCard, type CardMetadata } from '@/lib/cardSystem';
import { getCardEnergy, type CardEnergy } from '@/lib/energySystem';
import { DIVISION_LABELS, DIVISION_COLORS, getNextDivisionThreshold, type Division } from '@/lib/divisionSystem';
import { Input } from '@/components/ui/input';
import WalletConnect from '@/components/wallet/WalletConnect';
import { useToast } from '@/hooks/use-toast';

/* ── Types ── */
type EnrichedListing = MarketplaceListing & { cardName?: string; cardDivision?: Division; cardColor?: string };
type Section = 'marketplace' | 'my-cards' | 'profile' | 'wallet';

const DIVISIONS: (Division | 'all')[] = ['all', 'gem_v', 'gem_iv', 'gem_iii', 'gem_ii', 'gem_i'];
const DIV_FILTER_LABELS: Record<string, string> = { all: 'ALL', gem_v: 'V', gem_iv: 'IV', gem_iii: 'III', gem_ii: 'II', gem_i: 'I' };

/* ── Fee color helper ── */
const feeColor = (f: number) => f >= 10 ? '#ff4444' : f >= 7 ? '#ffdd00' : '#33ff88';

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

  /* ── Auth form (inline) ── */
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  /* ── Navigation ── */
  const [section, setSection] = useState<Section>('marketplace');

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
      return { ...l, cardName: card?.name ?? 'Unknown', cardDivision: (card?.division as Division) ?? 'gem_v', cardColor: card?.color_hex ?? '#ffffff' };
    }));
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Fee preview on card select ── */
  useEffect(() => {
    if (listingCardId) {
      calculateFee(listingCardId).then(setEstimatedFee);
    }
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
  const listableCards = cards.filter(c => !listings.some(l => l.cardId === c.id));
  const priceCents = Math.round((parseFloat(listPrice) || 0) * 100);
  const feeAmount = priceCents * estimatedFee / 100;
  const sellerReceives = priceCents - feeAmount;
  const nextThreshold = playerData ? getNextDivisionThreshold(playerData.division) : null;

  /* ── Sidebar nav items ── */
  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'marketplace', label: 'MARKET', icon: '🏪' },
    { key: 'my-cards', label: 'MY CARDS', icon: '🃏' },
    { key: 'profile', label: 'PROFILE', icon: '👤' },
    { key: 'wallet', label: 'WALLET', icon: '💎' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-mono">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button onClick={() => navigate('/')} className="text-yellow-400/70 hover:text-yellow-400 text-sm transition-colors">← Back</button>
        <h1 className="text-lg font-bold tracking-[0.4em] text-yellow-400/90" style={{ textShadow: '0 0 20px #ffdd0060' }}>NEBULA HUB</h1>
        <div className="w-14" />
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* ── Sidebar ── */}
        <nav className="w-44 flex-shrink-0 border-r border-white/5 bg-black/30 flex flex-col">
          <div className="flex-1 py-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full text-left px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all flex items-center gap-3 ${
                  section === item.key
                    ? 'bg-yellow-400/10 text-yellow-400 border-r-2 border-yellow-400'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          {user && (
            <div className="p-4 border-t border-white/5">
              <button onClick={handleLogout} className="w-full text-xs text-red-400/60 hover:text-red-400 transition-colors tracking-widest uppercase py-2">
                LOG OUT
              </button>
            </div>
          )}
        </nav>

        {/* ── Content ── */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* ════════ MARKETPLACE ════════ */}
          {section === 'marketplace' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-[0.3em] text-white/50">Card Marketplace</h2>
                <span className="text-[10px] text-white/30">{filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Division filter */}
              <div className="flex gap-2">
                {DIVISIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDivFilter(d)}
                    className={`px-3 py-1.5 text-[10px] tracking-widest rounded-md border transition-all ${
                      divFilter === d
                        ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                        : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'
                    }`}
                  >
                    {DIV_FILTER_LABELS[d]}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center text-white/30 py-16">Loading listings…</div>
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-white/20 space-y-3">
                  <span className="text-4xl">🌌</span>
                  <span className="text-sm tracking-widest">NO ACTIVE LISTINGS</span>
                  <span className="text-[10px] text-white/15">Cards listed for trade will appear here</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredListings.map(listing => (
                    <div
                      key={listing.id}
                      className="rounded-xl border border-white/8 bg-black/50 p-5 backdrop-blur-sm hover:border-white/15 transition-all group"
                    >
                      {/* Card orb */}
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${listing.cardColor}cc, ${listing.cardColor}40)`,
                            boxShadow: `0 0 20px ${listing.cardColor}30, inset 0 -2px 6px ${listing.cardColor}20`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate" style={{ color: listing.cardColor }}>{listing.cardName}</div>
                          <div className="text-[10px] text-white/35 flex items-center gap-2">
                            <span style={{ color: DIVISION_COLORS[listing.cardDivision!] }}>
                              {DIVISION_LABELS[listing.cardDivision!]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price + fee */}
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="text-[10px] text-white/25 uppercase tracking-widest">Price</div>
                          <div className="text-lg font-bold text-yellow-400" style={{ textShadow: '0 0 10px #ffdd0030' }}>
                            ${(listing.priceCents / 100).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] tracking-widest" style={{ color: feeColor(listing.feePercent) }}>
                            {listing.feePercent}% FEE
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {playerId && listing.sellerPlayerId !== playerId && (
                        <button
                          onClick={() => handleBuy(listing.id)}
                          className="w-full py-2 rounded-lg border border-green-500/30 text-green-400 text-xs tracking-widest hover:bg-green-500/10 transition-all"
                        >
                          BUY
                        </button>
                      )}
                      {playerId && listing.sellerPlayerId === playerId && (
                        <button
                          onClick={() => handleCancel(listing.id)}
                          className="w-full py-2 rounded-lg border border-red-500/20 text-red-400/70 text-xs tracking-widest hover:bg-red-500/10 transition-all"
                        >
                          CANCEL LISTING
                        </button>
                      )}
                      {!playerId && (
                        <button
                          onClick={() => setSection('profile')}
                          className="w-full py-2 rounded-lg border border-white/10 text-white/30 text-xs tracking-widest hover:text-white/50 transition-all"
                        >
                          SIGN IN TO BUY
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════ MY CARDS ════════ */}
          {section === 'my-cards' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {!user ? (
                <div className="flex flex-col items-center py-16 text-white/20 space-y-4">
                  <span className="text-4xl">🔒</span>
                  <span className="text-sm tracking-widest">SIGN IN TO VIEW YOUR CARDS</span>
                  <button onClick={() => setSection('profile')} className="text-xs text-yellow-400/70 hover:text-yellow-400 tracking-widest transition-colors">
                    GO TO PROFILE →
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm uppercase tracking-[0.3em] text-white/50">Your Cards</h2>
                    <span className="text-[10px] text-white/30 border border-white/10 px-2 py-1 rounded">{cards.length} / 10</span>
                  </div>

                  {/* Listing form */}
                  {listingCardId && (
                    <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs tracking-widest text-yellow-400/80 uppercase">List Card for Sale</h3>
                        <button onClick={() => { setListingCardId(null); setListPrice(''); }} className="text-white/30 hover:text-white/60 text-xs">✕</button>
                      </div>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] text-white/30 uppercase tracking-widest">Price (USD)</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={listPrice}
                            onChange={e => setListPrice(e.target.value)}
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/20 font-mono h-9"
                          />
                        </div>
                        <button
                          onClick={handleList}
                          disabled={listingSubmitting || !listPrice || parseFloat(listPrice) <= 0}
                          className="px-6 py-2 rounded-lg border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 text-xs tracking-widest hover:bg-yellow-400/20 disabled:opacity-30 transition-all h-9"
                        >
                          {listingSubmitting ? '...' : 'LIST'}
                        </button>
                      </div>
                      {/* Fee converter */}
                      {parseFloat(listPrice) > 0 && (
                        <div className="text-[10px] text-white/40 space-y-1 border-t border-white/5 pt-3">
                          <div className="flex justify-between">
                            <span>Sale price</span>
                            <span className="text-white/60">${(priceCents / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fee ({estimatedFee}%)</span>
                            <span style={{ color: feeColor(estimatedFee) }}>−${(feeAmount / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-xs">
                            <span className="text-white/60">You receive</span>
                            <span className="text-yellow-400">${(sellerReceives / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {cards.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-white/20 space-y-3">
                      <span className="text-4xl">🃏</span>
                      <span className="text-sm tracking-widest">NO CARDS YET</span>
                      <span className="text-[10px] text-white/15">Purchase cards from the marketplace</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cards.map(card => {
                        const energy = cardEnergies[card.id];
                        const isActive = card.id === activeCardId;
                        const isListed = listings.some(l => l.cardId === card.id && l.status === 'active');
                        return (
                          <div
                            key={card.id}
                            className={`rounded-xl border p-5 transition-all cursor-pointer group ${
                              isActive ? 'ring-1 ring-yellow-400/40' : ''
                            }`}
                            style={{
                              borderColor: isActive ? '#ffdd0030' : `${card.colorHex}20`,
                              background: `linear-gradient(135deg, ${card.colorHex}08, transparent)`,
                            }}
                            onClick={() => !isListed && handleSetActive(card.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all ${
                                  isActive ? 'animate-pulse' : 'group-hover:scale-105'
                                }`}
                                style={{
                                  background: `radial-gradient(circle at 35% 35%, ${card.colorHex}cc, ${card.colorHex}40)`,
                                  boxShadow: isActive
                                    ? `0 0 25px ${card.colorHex}50, 0 0 50px ${card.colorHex}20`
                                    : `0 0 12px ${card.colorHex}30`,
                                }}
                              >
                                {card.tokenId}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate" style={{ color: card.colorHex }}>{card.name}</div>
                                <div className="text-[10px] text-white/35 flex items-center gap-2">
                                  <span style={{ color: DIVISION_COLORS[card.division] }}>{DIVISION_LABELS[card.division]}</span>
                                  {isActive && <span className="text-yellow-400">• ACTIVE</span>}
                                  {isListed && <span className="text-cyan-400">• LISTED</span>}
                                </div>
                              </div>
                              {energy && (
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs font-bold" style={{ color: energy.energy > 0 ? '#66ffee' : '#ff4444' }}>
                                    ⚡ {energy.energy}/{energy.maxEnergy}
                                  </div>
                                  {/* Energy pips */}
                                  <div className="flex gap-1 mt-1 justify-end">
                                    {Array.from({ length: energy.maxEnergy }).map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                          background: i < energy.energy ? '#66ffee' : '#ffffff10',
                                          boxShadow: i < energy.energy ? '0 0 4px #66ffee' : 'none',
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Card actions */}
                            {!isListed && (
                              <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setListingCardId(card.id); setSection('my-cards'); }}
                                  className="text-[10px] px-3 py-1 rounded border border-yellow-400/20 text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/5 tracking-widest transition-all"
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
            <div className="max-w-md mx-auto space-y-6">
              {!user ? (
                /* Inline auth form */
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold tracking-[0.3em] text-yellow-400/90" style={{ textShadow: '0 0 15px #ffdd0040' }}>
                      {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    </h2>
                    <p className="text-[10px] text-white/30 tracking-widest">Access your cards, wallet, and marketplace</p>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-black/50 p-6 backdrop-blur-sm">
                    <form onSubmit={handleAuth} className="space-y-4">
                      {!isLogin && (
                        <Input
                          placeholder="Display Name"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          className="bg-black/40 border-white/10 text-white placeholder:text-white/20 font-mono h-10"
                        />
                      )}
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/20 font-mono h-10"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/20 font-mono h-10"
                      />
                      <button
                        type="submit"
                        disabled={authSubmitting}
                        className="w-full py-2.5 rounded-lg border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 text-xs tracking-[0.2em] font-bold hover:bg-yellow-400/20 disabled:opacity-40 transition-all"
                        style={{ textShadow: '0 0 8px #ffdd0040' }}
                      >
                        {authSubmitting ? '...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
                      </button>
                    </form>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full mt-3 py-2 text-[10px] text-white/30 hover:text-white/60 tracking-widest transition-colors"
                    >
                      {isLogin ? 'CREATE NEW ACCOUNT' : 'ALREADY HAVE AN ACCOUNT'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Profile info */
                <div className="space-y-6">
                  <h2 className="text-sm uppercase tracking-[0.3em] text-white/50">Profile</h2>

                  <div className="rounded-xl border border-white/8 bg-black/50 p-6 backdrop-blur-sm space-y-5">
                    {/* Identity */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl">
                        👤
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white/90">{playerData?.display_name ?? 'Player'}</div>
                        <div className="text-[10px] text-white/30">{user.email}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    {playerData && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Division</div>
                          <div className="text-sm font-bold" style={{ color: DIVISION_COLORS[playerData.division as Division] }}>
                            {DIVISION_LABELS[playerData.division as Division]}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Matches</div>
                          <div className="text-sm font-bold text-white/80">{playerData.total_matches}</div>
                        </div>
                        <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Points</div>
                          <div className="text-sm font-bold text-white/80">{playerData.division_points}</div>
                        </div>
                        <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-1">Cards</div>
                          <div className="text-sm font-bold text-white/80">{cards.length}/10</div>
                        </div>
                      </div>
                    )}

                    {/* Division progress */}
                    {playerData && nextThreshold && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest">
                          <span>Division Progress</span>
                          <span>{playerData.division_points} / {nextThreshold}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (playerData.division_points / nextThreshold) * 100)}%`,
                              background: `linear-gradient(90deg, ${DIVISION_COLORS[playerData.division as Division]}, ${DIVISION_COLORS[playerData.division as Division]}80)`,
                              boxShadow: `0 0 8px ${DIVISION_COLORS[playerData.division as Division]}40`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Active card */}
                    {activeCardId && (
                      <div className="space-y-2">
                        <div className="text-[10px] text-white/25 uppercase tracking-widest">Active Card</div>
                        {(() => {
                          const card = cards.find(c => c.id === activeCardId);
                          if (!card) return null;
                          return (
                            <div className="flex items-center gap-3 rounded-lg bg-white/3 border border-white/5 p-3">
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{
                                  background: `radial-gradient(circle at 35% 35%, ${card.colorHex}cc, ${card.colorHex}40)`,
                                  boxShadow: `0 0 12px ${card.colorHex}40`,
                                }}
                              />
                              <div>
                                <div className="text-xs font-bold" style={{ color: card.colorHex }}>{card.name}</div>
                                <div className="text-[10px] text-white/30">{DIVISION_LABELS[card.division]}</div>
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
            <div className="max-w-md mx-auto space-y-6">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/50">Wallet</h2>
              <WalletConnect currentAddress={walletAddress} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
