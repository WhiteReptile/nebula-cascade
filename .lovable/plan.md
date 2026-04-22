
## Replace Marketplace Mint with a self-contained card browser

The problem is no longer “page scroll.” For the Marketplace Mint tab, I’ll stop depending on the page itself and make the NFT area scrollable/browsable inside its own container.

### 1. Turn Mint into a contained viewport
Use the existing `ScrollArea` component to wrap the Mint card region in a fixed-height panel.

Files:
- `src/pages/Marketplace.tsx`
- `src/components/marketplace/NFTGrid.tsx`

Implementation:
- Keep the Marketplace shell as-is.
- Inside the Mint tab, place the card browser inside a bordered, neon-styled container.
- Give that container a fixed viewport-friendly height so it always works inside the embedded preview.
- The scrollbar will live inside that Mint box, not on the whole page.

Result:
- Even if the preview iframe behaves badly, the user can still wheel-scroll inside the Mint panel.

### 2. Keep 6 cards per page, but make the 6-card block scroll inside the box
Keep the current page-based fetch size of 6.

Files:
- `src/lib/thirdweb/nftQueries.ts`
- `src/components/marketplace/NFTGrid.tsx`

Implementation:
- Keep `NFT_PAGE_SIZE = 6`.
- Render those 6 cards inside the internal scroll viewport.
- Use a tighter layout so the card block feels more like a contained gallery than a long page.

### 3. Compact the Mint card layout so 6 cards fit better
Right now each NFT card is too tall for the available preview height.

File:
- `src/components/marketplace/NFTCard.tsx`

Implementation:
- Add a compact Marketplace variant for Mint cards:
  - slightly smaller image area
  - tighter padding
  - tighter gaps
  - reduce secondary text size/spacing
  - keep name, token number, division badge, price, and status pill intact
- Do not change the actual NFT logic, image sourcing, division logic, or claim-state logic.

Result:
- The 6-card page becomes much easier to browse inside the contained box.

### 4. Upgrade the arrows so browsing is obvious
Make the previous/next controls much more visible and treat them as the main navigation between 6-card sets.

File:
- `src/components/marketplace/NFTGrid.tsx`

Implementation:
- Keep page-based left/right navigation.
- Enlarge the arrows visually and place them so they feel like a real card browser.
- Keep the center page label.
- Disable previous on page 1 and next on the last page as it works now.

### 5. Add the fallback browsing mode only if needed
If the contained 6-card browser still feels too cramped after the compact pass, switch the Mint grid to a 4-card horizontal carousel layout.

Files:
- `src/components/marketplace/NFTGrid.tsx`
- optionally `src/components/marketplace/NFTCard.tsx`

Fallback structure:
- desktop: 4 cards in one horizontal row
- large left/right arrows
- each click shows the next mixed set of cards
- division filters remain separate and can still narrow results later

This fallback will only be used if the contained 6-card scroll box still cannot feel clean in the preview.

### 6. Scope the work only to Marketplace Mint
Do not touch:
- Rewards & Rules
- game page
- Trade marketplace behavior
- wallet/auth logic

Only the Mint browsing experience changes.

## Files to modify
- `src/pages/Marketplace.tsx`
- `src/components/marketplace/NFTGrid.tsx`
- `src/components/marketplace/NFTCard.tsx`
- `src/lib/thirdweb/nftQueries.ts` (likely unchanged or only confirmed at 6)

## Expected result
- The Mint area becomes a dedicated card browser panel
- Mouse wheel works inside the Mint box even if page scrolling is unreliable
- Users browse 6 cards at a time with clear arrows
- If needed, the UI can be tightened further into a 4-card horizontal carousel without changing the data source
