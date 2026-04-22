
## Replace scroll dependency with a fixed 6-card pager in Marketplace

The Marketplace mint view will stop relying on vertical scrolling. Instead, it will always show **6 cards at a time** and let the user move through the collection with **left/right arrows**.

### 1. Change Mint pagination from 12 to 6
Update the Mint grid so each page fetches and renders **exactly 6 NFTs** instead of 12.

Files:
- `src/components/marketplace/NFTGrid.tsx`
- `src/lib/thirdweb/nftQueries.ts`

Implementation:
- Change the page size used by `useCollectionNFTs(...)` from `12` to `6`.
- Keep the current page-based contract reads, just with a smaller batch size.
- Keep the “last page” heuristic the same: if fewer than 6 NFTs return, disable the next arrow.

### 2. Redesign the Mint grid to fit in-view without scrolling
Make the card layout a **two-row max** desktop grid so the user can browse by paging, not scrolling.

File:
- `src/components/marketplace/NFTGrid.tsx`

Implementation:
- Use a layout that shows:
  - mobile: 1 column
  - tablet: 2 columns
  - desktop: 3 columns
- With 6 cards/page, desktop becomes **3 × 2**, which avoids the current long page.
- Reduce vertical gap slightly so the full mint block feels tighter and more menu-like.

### 3. Turn the pager into a clear “6 more cards” control
Keep only the arrow-based navigation pattern the user asked for.

File:
- `src/components/marketplace/NFTGrid.tsx`

Implementation:
- Keep previous/next controls at the bottom, but restyle them as clear arrow navigation.
- Show a small center label like:
  - `PAGE 1`
  - or `1 / N` if total-page estimation becomes available later
- Disable previous on page 1.
- Disable next when the fetched result count is under 6.

### 4. Remove Mint’s dependence on page scroll
The Mint section should behave like a contained browsing surface, not a long document.

Files:
- `src/pages/Marketplace.tsx`
- `src/components/marketplace/NFTGrid.tsx`

Implementation:
- Keep the existing Marketplace shell, galaxy background, and sidebar.
- Ensure the Mint tab content is visually complete with:
  - section title
  - short subtitle
  - 6-card grid
  - bottom arrows
- No additional content should require scrolling just to continue browsing the collection.

### 5. Do not touch the existing NFT card logic beyond layout compatibility
Keep the current NFT build intact while changing only the browsing model.

Files left functionally intact:
- `src/components/marketplace/NFTCard.tsx`

This means:
- claim-condition logic stays as-is
- “Coming Soon” overrides stay as-is
- division badges stay as-is
- image logic stays as-is for this pass

### Technical notes
- Current code already has page-based fetching, so this is a focused refactor, not a rebuild.
- The main change is:
  - `NFT_PAGE_SIZE: 12 -> 6`
  - grid layout adjusted to match
  - pager restyled to emphasize arrow navigation
- No database, wallet, contract, or marketplace-trade logic changes are needed.

### Files to modify
- `src/lib/thirdweb/nftQueries.ts`
- `src/components/marketplace/NFTGrid.tsx`
- `src/pages/Marketplace.tsx`

### Result after implementation
- The Mint view shows **6 cards max per screen**
- Users move through the collection with **arrows**, not page scrolling
- The experience stays cleaner and closer to the minimal menu style
- Existing NFT data + card behavior remain intact
