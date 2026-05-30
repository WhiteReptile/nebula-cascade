# Nebula Marketplace — Deployment Guide

## Prerequisites

- Node.js 18+ and npm installed
- Thirdweb CLI: `npm install -g @thirdweb-dev/cli`
- Your compiled `NebulaMarketplace.sol` contract in `/workspaces/nebula-cascade/contracts/`
- MetaMask or wallet provider ready (you'll need testnet ETH for gas fees)
- The ERC-1155 NFT collection address already deployed (we have: `0xa89C9d428321291fF9b3609D62861123690aa07e`)

---

## Step 1: Deploy to Base Sepolia Testnet

### Initialize Thirdweb Project (if not done)

```bash
cd /workspaces/nebula-cascade
thirdweb create --template hardhat-javascript
# Or use existing setup if you already have one
```

### Deploy NebulaMarketplace to Sepolia

```bash
thirdweb deploy \
  --contract /workspaces/nebula-cascade/contracts/NebulaMarketplace.sol \
  --chain base-sepolia \
  --name NebulaMarketplace
```

**What to expect:**
1. Browser opens → authenticate with your wallet
2. Choose Base Sepolia testnet
3. Set constructor params:
   - `_nftContractAddress`: `0xa89C9d428321291fF9b3609D62861123690aa07e` (your ERC-1155 collection)
4. Deploy! → wait ~1–2 min for confirmations
5. Copy the deployed contract address

### Example Output

```
✓ Contract deployed to: 0x1234567890abcdef1234567890abcdef12345678
✓ Deployment ID: abcd-efgh-ijkl
✓ View on explorer: https://sepolia.basescan.org/address/0x1234567890abcdef1234567890abcdef12345678
```

---

## Step 2: Configure Frontend Environment Variables

Once deployed, set the contract address in `.replit` (or your `.env`):

```bash
VITE_MARKETPLACE_V3_ADDRESS=0x<YOUR_DEPLOYED_ADDRESS>
VITE_NEBULA_TESTNET=true
VITE_NEBULA_COLLECTION_ADDRESS=0xa89C9d428321291fF9b3609D62861123690aa07e
```

### Apply migrations to Supabase (adds `price_wei` & `onchain_listing_id` fields)

```bash
supabase db push --project-ref pbklgtguxftmckwhwgtb
```

---

## Step 3: Local Testing (Before Production)

### Run dev server

```bash
npm run dev
```

### Test End-to-End Marketplace Flow

1. **Connect wallet** on `/marketplace`
   - Ensure you're on Base Sepolia
   - Have test ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base))

2. **List a card** (e.g., $1.50 = 150 cents USD)
   - UI shows: `$1.50 USD` | `0.000875 ETH` (at 1715 ETH/USD)
   - Contract receives Wei-denominated price
   - `price_cents` = 150, `price_wei` = "875000000000000" stored in Supabase

3. **Buy a card** from another wallet (in Sepolia)
   - Test with two browser wallets or two Metamask accounts

4. **Cancel listing**
   - Verify card returns to seller's collection

5. **Monitor event mirrors**
   - Check Supabase `marketplace_listings` table
   - Verify `onchain_listing_id`, `price_cents`, `price_wei` are populated

---

## Step 4: Deploy to Base Mainnet (Production)

Once testing is complete and you're ready for production:

### Deploy to Base Mainnet

```bash
thirdweb deploy \
  --contract /workspaces/nebula-cascade/contracts/NebulaMarketplace.sol \
  --chain base-mainnet \
  --name NebulaMarketplace-Mainnet
```

### Update Production Environment

```bash
VITE_MARKETPLACE_V3_ADDRESS=0x<MAINNET_ADDRESS>
VITE_NEBULA_TESTNET=false
VITE_NEBULA_COLLECTION_ADDRESS=0xa89C9d428321291fF9b3609D62861123690aa07e
```

### Run production build

```bash
npm run build
```

---

## Troubleshooting

### "Contract not found" Error

```bash
# Ensure Solidity file is valid
solc /workspaces/nebula-cascade/contracts/NebulaMarketplace.sol --version
```

### "Wallet not connected" in Thirdweb CLI

- Clear browser cache or open incognito window
- Re-authenticate in the browser window that opens
- Ensure MetaMask is on Base Sepolia

### "Gas estimation failed"

- Check you have enough testnet ETH (need ~0.1 ETH)
- Get more from [Base Faucet](https://www.coinbase.com/faucets/base)

### Contract calls fail with "Revert"

- Verify NFT collection address is correct on the chain
- Ensure `setApprovalForAll` was called for the marketplace contract
- Check that card owner has sufficient gas

---

## Post-Deployment Checklist

- [ ] Testnet contract deployed and address captured
- [ ] Frontend env vars updated with testnet address
- [ ] Supabase migrations applied (`price_wei`, `onchain_listing_id` fields)
- [ ] E2E flow tested: list → buy → cancel
- [ ] Event listeners verified (DB mirrors on-chain state)
- [ ] Mainnet contract ready for deploy
- [ ] Production env vars prepared
- [ ] Build tested locally before shipping

---

## Quick Reference: Deployed Addresses

| Env | Chain | Marketplace Address | Collection |
|---|---|---|---|
| Testnet | Base Sepolia | TBD | `0xa89C9d428321291fF9b3609D62861123690aa07e` |
| Production | Base Mainnet | TBD | `0xa89C9d428321291fF9b3609D62861123690aa07e` |

---

## Support

For Thirdweb issues: https://thirdweb.com/support  
For Base chain issues: https://base.org/docs
