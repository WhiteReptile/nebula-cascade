---
name: web3-readiness
description: Base (ETH L2) blockchain via Thirdweb SDK v5. NFT collection deployed at 0xa89C...aa07e on chain 8453.
type: feature
---
Chain: **Base** (ETH L2), chain ID **8453**. NOT Sui.
SDK: Thirdweb v5 (`thirdweb` npm package).
Client ID (public): `0ee0974906e5b6b9d18c8f635d4a3df0`.
NFT Collection contract: `0xa89C9d428321291fF9b3609D62861123690aa07e` (Drop with claim phases).
Marketplace V3: NOT used — primary sales via collection's claim phases. Secondary trading is currently off-chain (Supabase `marketplace_listings`).
Shared modules live in `src/lib/thirdweb/{client,chains,contracts}.ts`.
