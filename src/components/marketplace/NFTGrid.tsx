/**
 * NFTGrid — horizontal nebula carousel showing exactly 4 NFT cards per page.
 * Users navigate left/right between sets. No vertical scroll.
 */
import { useState } from 'react';
import { useCollectionNFTs } from '@/lib/thirdweb/nftQueries';
import NFTCard from './NFTCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CARDS_PER_PAGE = 4;

const NFTGrid = () => {
  const [page, setPage] = useState(1);
  const { data: nfts, isLoading, error, refetch } = useCollectionNFTs(page, CARDS_PER_PAGE);

  const isLastPage = !nfts || nfts.length < CARDS_PER_PAGE;

  /* ── Loading ── */
  if (isLoading) {
    return (
      <CarouselFrame page={page} onPrev={() => {}} onNext={() => {}} prevDisabled nextDisabled>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
            <div key={i} className="rounded-xl border border-red-500/20 bg-black/40 p-4 space-y-3">
              <Skeleton className="aspect-square w-full bg-red-500/10" />
              <Skeleton className="h-5 w-3/4 bg-red-500/10" />
              <Skeleton className="h-4 w-1/2 bg-red-500/10" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-10 w-24 bg-red-500/10" />
                <Skeleton className="h-10 w-20 bg-red-500/10" />
              </div>
            </div>
          ))}
        </div>
      </CarouselFrame>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div
        className="rounded-2xl border bg-black/55 p-12 text-center space-y-4 backdrop-blur-md"
        style={{
          borderColor: 'rgba(255, 51, 68, 0.4)',
          boxShadow: '0 0 40px rgba(255, 51, 68, 0.18)',
        }}
      >
        <div className="text-xl font-mono tracking-[0.3em] uppercase font-bold" style={{ color: '#ff5566', textShadow: '0 0 12px #ff3344' }}>
          Failed to Load
        </div>
        <p className="text-sm text-white/60 font-mono">Couldn't reach Base. Check your connection and try again.</p>
        <button
          onClick={() => refetch()}
          className="min-h-[48px] px-6 rounded-lg border bg-black/40 text-sm tracking-[0.25em] font-mono font-bold uppercase hover:scale-[1.04] transition-all"
          style={{
            borderColor: 'rgba(255, 51, 68, 0.6)',
            color: '#ff8899',
            boxShadow: '0 0 22px rgba(255, 51, 68, 0.3)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Empty ── */
  if (!nfts || nfts.length === 0) {
    return (
      <div
        className="rounded-2xl border bg-black/55 p-14 text-center space-y-3 backdrop-blur-md"
        style={{
          borderColor: 'rgba(255, 51, 68, 0.3)',
          boxShadow: '0 0 30px rgba(255, 51, 68, 0.12)',
        }}
      >
        <div className="text-xl font-mono tracking-[0.3em] uppercase font-bold" style={{ color: '#ff5566', textShadow: '0 0 12px #ff3344' }}>
          No Cards Deployed
        </div>
        <p className="text-sm text-white/50 font-mono tracking-wider">The collection is empty on this page.</p>
      </div>
    );
  }

  /* ── Active carousel ── */
  return (
    <CarouselFrame
      page={page}
      onPrev={() => page > 1 && setPage((p) => p - 1)}
      onNext={() => !isLastPage && setPage((p) => p + 1)}
      prevDisabled={page === 1}
      nextDisabled={isLastPage}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {nfts.map((nft) => (
          <NFTCard key={nft.id.toString()} nft={nft} />
        ))}
      </div>
    </CarouselFrame>
  );
};

/* ──────────────────────────────────────────────────────────
   CarouselFrame — nebula-styled shell with side arrows + footer label
   ────────────────────────────────────────────────────────── */
interface FrameProps {
  page: number;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  children: React.ReactNode;
}

const NAV_BTN = `
  group relative h-12 w-12 shrink-0 flex items-center justify-center rounded-full
  border transition-all duration-300 hover:scale-110 active:scale-95
  disabled:opacity-15 disabled:pointer-events-none disabled:scale-100
`;

const CarouselFrame = ({ page, onPrev, onNext, prevDisabled, nextDisabled, children }: FrameProps) => (
  <div
    className="relative rounded-2xl border bg-black/45 backdrop-blur-xl overflow-hidden"
    style={{
      borderColor: 'rgba(255, 51, 68, 0.35)',
      boxShadow: '0 0 50px rgba(255, 51, 68, 0.18), inset 0 0 60px rgba(120, 0, 40, 0.08)',
      backgroundImage:
        'radial-gradient(ellipse at top, rgba(255, 51, 68, 0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(80, 20, 120, 0.08) 0%, transparent 60%)',
    }}
  >
    {/* Nebula starfield accents */}
    <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
      style={{
        backgroundImage:
          'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,150,180,0.5), transparent), radial-gradient(2px 2px at 40% 80%, rgba(180,120,255,0.4), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,255,255,0.5), transparent)',
      }}
    />

    {/* Carousel body — arrows flank the cards */}
    <div className="relative flex items-stretch gap-4 lg:gap-6 p-5 lg:p-7">
      <div className="flex items-center">
        <button
          onClick={onPrev}
          disabled={prevDisabled}
          aria-label="Previous cards"
          className={NAV_BTN}
          style={{
            borderColor: 'rgba(255, 51, 68, 0.7)',
            color: '#ffaabb',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 51, 68, 0.25), rgba(0,0,0,0.6) 70%)',
            boxShadow: '0 0 28px rgba(255, 51, 68, 0.45), inset 0 0 18px rgba(255, 51, 68, 0.2)',
          }}
        >
          <ChevronLeft className="h-10 w-10 drop-shadow-[0_0_8px_rgba(255,80,110,0.9)]" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 min-w-0 flex items-center">{children}</div>

      <div className="flex items-center">
        <button
          onClick={onNext}
          disabled={nextDisabled}
          aria-label="Next cards"
          className={NAV_BTN}
          style={{
            borderColor: 'rgba(255, 51, 68, 0.7)',
            color: '#ffaabb',
            background: 'radial-gradient(circle at 70% 30%, rgba(255, 51, 68, 0.25), rgba(0,0,0,0.6) 70%)',
            boxShadow: '0 0 28px rgba(255, 51, 68, 0.45), inset 0 0 18px rgba(255, 51, 68, 0.2)',
          }}
        >
          <ChevronRight className="h-10 w-10 drop-shadow-[0_0_8px_rgba(255,80,110,0.9)]" strokeWidth={2.5} />
        </button>
      </div>
    </div>

    {/* Footer page indicator */}
    <div
      className="relative flex items-center justify-center gap-3 py-3 border-t bg-black/55"
      style={{ borderColor: 'rgba(255, 51, 68, 0.3)' }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#ff5566', boxShadow: '0 0 8px #ff3344' }} />
      <span
        className="text-sm font-mono tracking-[0.4em] uppercase font-bold"
        style={{ color: '#ffaabb', textShadow: '0 0 12px rgba(255, 51, 68, 0.7)' }}
      >
        Sector {String(page).padStart(2, '0')}
      </span>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#ff5566', boxShadow: '0 0 8px #ff3344' }} />
    </div>
  </div>
);

export default NFTGrid;
