

## Confirmed: Yes — Part A + B integrate directly into your existing Nebula Marketplace

Same plan as approved, just confirming scope so there's zero ambiguity.

### Where this lives in your app
- **Same page**: `src/pages/Marketplace.tsx` (your existing "Nebula Hub")
- **Same UI shell**: galaxy background, red neon title, sidebar, glow panels — all untouched
- **Same routes**: `/marketplace` stays as-is
- **Same auth + Supabase flow**: untouched

### Part A — Sui → Base purge (project-wide)
- Memory: rewrite `mem://tech/web3-readiness`, update `mem://index.md` core line, sweep marketplace/card-economy/no-nft memory files
- Code: search-and-replace any `Sui` / `SUI` strings referring to chain → `Base` / `BASE`
- UI copy: any visible "Sui" text in Marketplace, Roadmap, Rewards, WalletConnect → "Base"

### Part B — Thirdweb foundation (wired into Marketplace)
- Install `thirdweb` v5 SDK
- Add `VITE_THIRDWEB_CLIENT_ID=0ee0974906e5b6b9d18c8f635d4a3df0` to `.env`
- New folder `src/lib/thirdweb/`:
  - `client.ts` — shared Thirdweb client
  - `chains.ts` — locked to Base (chain 8453)
  - `contracts.ts` — your collection `0xa89C9d428321291fF9b3609D62861123690aa07e`
- **Inside `src/pages/Marketplace.tsx`**: add one `useEffect` that on mount fetches `getContractMetadata()` from your Base contract, logs to console, and shows a toast: **"Connected to Nebula Collection on Base ✓"**

### What you'll see after this lands
- Marketplace looks identical (red neon title, animated galaxy, glow panels)
- Open it → toast confirms live connection to your Base contract
- Console shows your collection's name, symbol, image
- Zero Sui references anywhere in the app or memory

### What is NOT in this step (queued for next)
- Phase 2: real `ConnectButton` replacing the wallet stub
- Phase 3: NFT grid rendering your collection
- Phase 4: claim/mint flow
- Phase 5: wallet ↔ in-game card sync

### Files touched
- `package.json`, `.env`
- `src/lib/thirdweb/client.ts`, `chains.ts`, `contracts.ts` (new)
- `src/pages/Marketplace.tsx` (one `useEffect` only — no UI change)
- `src/lib/walletSystem.ts`, `src/components/wallet/WalletConnect.tsx` (Sui→Base copy if present)
- `src/pages/Roadmap.tsx`, `src/pages/Rewards.tsx` (Sui→Base copy if present)
- Memory files listed above

Approve and I'll execute Part A + B in one pass.

