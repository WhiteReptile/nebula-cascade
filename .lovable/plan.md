

# Replace Sui with Base (Coinbase L2)

Noted: primary RPC `https://mainnet.base.org` is confirmed. Fallback RPCs (`https://base.llamarpc.com`, `https://base-rpc.publicnode.com`) to be added later.

## Changes across 6 files — text/comment updates only

### 1. `src/pages/Rewards.tsx`
- "Sui blockchain" → "Base blockchain" (2 occurrences)

### 2. `src/pages/Marketplace.tsx`
- "Sui" → "Base" in comments, labels, and descriptions (4 occurrences)
- "SUI WALLET" → "BASE WALLET"

### 3. `src/components/wallet/WalletConnect.tsx`
- "Sui wallet" → "Base wallet" in comments (2 occurrences)

### 4. `src/lib/walletSystem.ts`
- "on Sui blockchain" → "on Base blockchain"

### 5. `src/lib/cardSystem.ts`
- "on Sui" → "on Base"

### 6. `src/lib/payoutIntegrations.ts`
- All "Sui" references → "Base"
- Rename `suiChainConfig` → `baseChainConfig`
- Set `name: 'Base'`, `rpcUrl: 'https://mainnet.base.org'`, `chainId: 8453`
- Remove `rewardsVaultAddress` placeholder, replace with `contractAddress: ''`

No dependency changes. No game logic changes.

