# Nebula Cascade — PRD

## Overview
Nebula Cascade is a Phaser.js puzzle game (Tetris-like with cosmic orbs) by ColdLogic.
Built with React + FastAPI + Supabase (primary DB) + MongoDB (status checks).

## Phase 1 — Blockchain Framework (COMPLETE)

### Backend (FastAPI)
- **NFT API** (`/api/nft/*`) — ERC-721 metadata, minting framework, player NFT records
- **Marketplace API** (`/api/marketplace/*`) — Server-side validation, fee calculation (5-10%)
- **Wallet API** (`/api/wallet/*`) — Link/verify/unlink wallet, signature verification
- **Anti-Cheat API** (`/api/anticheat/*`) — Score validation, multi-flag risk assessment
- **Blockchain Service** — Thirdweb integration framework, Base chain (8453)

### Frontend
- **ThirdwebWalletConnect** — Lazy-loaded, email/social/MetaMask/Coinbase
- **SwapWidget** — LI.FI iframe integration (framework ready)
- **API Client** — Typed client for all backend endpoints
- **WalletContext** — Global wallet state management
- **Swap Page** (`/swap`) — Token swap & bridge UI

### Architecture
- Supabase = primary database & auth
- FastAPI = validation, anti-cheat, blockchain bridge
- Thirdweb = wallet connect + NFT minting (Base chain)
- LI.FI = token swaps & bridging
- Chain: Base (ERC-721)

## Phase 1.5 — Player Segmentation Rule (COMPLETE)

### CRITICAL RULE: has_ever_owned_card (ONE-WAY, PERMANENT)
- `core_rules.py` — Single source of truth for all game rules
- Non-NFT players: No cards, compete on FREE leaderboard only
- NFT players: Own/owned card, compete on NFT leaderboard only
- Once flagged as card owner → PERMANENTLY excluded from FREE board
- Enforced at: match submission, leaderboard queries, frontend UI

### Backend
- `/api/player/segment/{id}` — Get player segment
- `/api/player/flag-card-ownership` — One-way permanent flag
- `/api/player/leaderboard/{type}` — Filtered leaderboard (no_nft/nft/global)
- `/api/player/can-submit/{id}/{board}` — Eligibility check
- `/api/anticheat/validate-score` — Now enforces segmentation

### Frontend
- `playerSegmentation.ts` — Frontend enforcement logic (mirrors core_rules.py)
- `Leaderboard.tsx` — Dual boards (FREE/NFT/ALL), segment-based tab visibility
- `api.ts` — playerApi client for all segmentation endpoints

### Database (Supabase SQL — run once)
```sql
ALTER TABLE players ADD COLUMN IF NOT EXISTS has_ever_owned_card BOOLEAN DEFAULT FALSE NOT NULL;
```
- All backend APIs: WORKING (25/25 tests passed)
- Frontend pages: WORKING (framework mode — no API keys)
- Blockchain: FRAMEWORK MODE (needs THIRDWEB_SECRET_KEY, VITE_THIRDWEB_CLIENT_ID)
- Swap: FRAMEWORK MODE (needs VITE_LIFI_API_KEY)

### Future Phases
- Phase 2: Stripe Connect for payouts
- Phase 2: On-chain NFT minting
- Phase 3: 3 external anti-cheat APIs
- No MongoDB migration (keep Supabase)
