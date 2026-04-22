/**
 * NFTGrid — paginated grid of live NFTs from the Nebula collection on Base.
 * 12 per page. Skeleton → Empty → Error → Grid states.
 */
import { useState } from 'react';
import { useCollectionNFTs, NFT_PAGE_SIZE } from '@/lib/thirdweb/nftQueries';
import NFTCard from './NFTCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const NFTGrid = () => {
  const [page, setPage] = useState(1);
  const { data: nfts, isLoading, error, refetch } = useCollectionNFTs(page, NFT_PAGE_SIZE);

  // Heuristic: if a page returns < pageSize, we've hit the end.
  const isLastPage = !nfts || nfts.length < NFT_PAGE_SIZE;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: NFT_PAGE_SIZE }).map((_, i) => (
          <div key={i} className="rounded-xl border border-red-500/20 bg-black/40 p-4 space-y-3">
            <Skeleton className="aspect-square w-full bg-red-500/10" />
            <Skeleton className="h-4 w-3/4 bg-red-500/10" />
            <Skeleton className="h-3 w-1/2 bg-red-500/10" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-20 bg-red-500/10" />
              <Skeleton className="h-8 w-16 bg-red-500/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border bg-black/55 p-10 text-center space-y-4 backdrop-blur-md"
        style={{
          borderColor: 'rgba(255, 51, 68, 0.4)',
          boxShadow: '0 0 30px rgba(255, 51, 68, 0.15)',
        }}
      >
        <div className="text-lg font-mono tracking-[0.25em] uppercase font-bold" style={{ color: '#ff5566', textShadow: '0 0 10px #ff3344' }}>
          Failed to Load
        </div>
        <p className="text-sm text-white/60 font-mono">
          Couldn't reach Base. Check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="min-h-[44px] px-5 rounded-lg border bg-black/40 text-sm tracking-[0.2em] font-mono font-bold uppercase hover:scale-[1.03] transition-all"
          style={{
            borderColor: 'rgba(255, 51, 68, 0.6)',
            color: '#ff8899',
            boxShadow: '0 0 20px rgba(255, 51, 68, 0.3)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <div
        className="rounded-xl border bg-black/55 p-12 text-center space-y-3 backdrop-blur-md"
        style={{
          borderColor: 'rgba(255, 51, 68, 0.3)',
          boxShadow: '0 0 25px rgba(255, 51, 68, 0.1)',
        }}
      >
        <div
          className="text-lg font-mono tracking-[0.3em] uppercase font-bold"
          style={{ color: '#ff5566', textShadow: '0 0 10px #ff3344' }}
        >
          No Cards Deployed
        </div>
        <p className="text-sm text-white/50 font-mono tracking-wider">
          The collection is empty on this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <NFTCard key={nft.id.toString()} nft={nft} />
        ))}
      </div>

      {/* Arrow pager — always visible so users know how to browse */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          onClick={() => page > 1 && setPage(p => p - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="min-h-[44px] min-w-[44px] px-4 rounded-lg border bg-black/40 font-mono font-bold text-xl transition-all hover:scale-110 disabled:opacity-20 disabled:pointer-events-none"
          style={{
            borderColor: 'rgba(255, 51, 68, 0.6)',
            color: '#ff8899',
            boxShadow: '0 0 18px rgba(255, 51, 68, 0.25)',
          }}
        >
          ←
        </button>
        <span
          className="text-sm font-mono tracking-[0.3em] uppercase font-bold min-w-[80px] text-center"
          style={{ color: '#ff8899', textShadow: '0 0 8px rgba(255, 51, 68, 0.5)' }}
        >
          Page {page}
        </span>
        <button
          onClick={() => !isLastPage && setPage(p => p + 1)}
          disabled={isLastPage}
          aria-label="Next page"
          className="min-h-[44px] min-w-[44px] px-4 rounded-lg border bg-black/40 font-mono font-bold text-xl transition-all hover:scale-110 disabled:opacity-20 disabled:pointer-events-none"
          style={{
            borderColor: 'rgba(255, 51, 68, 0.6)',
            color: '#ff8899',
            boxShadow: '0 0 18px rgba(255, 51, 68, 0.25)',
          }}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default NFTGrid;
