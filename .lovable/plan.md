

# Update Rewards & Rules Content

## File: `src/pages/Rewards.tsx`

### Cards tab (lines 84-121)
- Rewrite paragraph to include: **points belong to wallet** (not card), **instant 2-energy reset on purchase** (no UTC wait on trade), **primary card = highest division card with energy** (auto-selected), **no auto-switch** when energy depletes (manual selection required)
- Change 4th stat card from `UTC 00:00 / Energy reset time` → `INSTANT / Energy on trade`

### No-NFT tab (lines 123-158)
- Rewrite paragraph: replace permanent lock-in with **fluid bracket system** — hold 0 NFTs = No-NFT bracket, hold ≥1 NFT = NFT division bracket, selling all cards returns you immediately
- Specify **50% chance** energy activates each game start
- Replace red `PERMANENT RULE` warning box with **green/emerald `FLUID BRACKETS`** info box explaining the wallet-based bracket system

### Rewards tab (lines 161-196)
- Remove all Merkle proof / on-chain claims / RewardsVault references
- Replace with: team collects fees → calculates payouts off-chain → sends rewards directly to wallets
- Change 3rd stat card from `MERKLE / On-chain claims` → `DIRECT / Team sends rewards`
- **No reward pool estimates displayed** — keep it clean

### Season tab (lines 199-247)
- Remove Merkle tree / RewardsVault contract references from paragraph
- Replace with: team distributes rewards directly after season close
- Update DAY 40+ step from "Claims open" to "Rewards distributed"

### Divisions tab — No changes

### Summary of changes
- Only `src/pages/Rewards.tsx` is modified
- No new files, no new dependencies

