

# Marketplace Cosmic Overhaul + Sui/Thirdweb Wallet Fix

## Summary
Update the Marketplace page to use the cosmic visual theme (`bg-[#050510]`, neon glows, starfield gradients) consistent with the rest of the app. Fix the wallet section to reference **Sui + Thirdweb** instead of Solana/Helius. Remove all Solana/Helius references from wallet code.

## Changes

### 1. `src/pages/Marketplace.tsx` — Visual + Wallet Fix
- **Background**: Change from `bg-[#0a0a1a]` to `bg-[#050510]` with radial cosmic gradients and subtle starfield dots (CSS-only, matching Rewards/Roadmap pages)
- **Header**: Add neon cyan/purple glow to "NEBULA HUB" title, animated subtle pulse
- **Sidebar**: Add gradient overlay, neon accent on active item (cyan glow instead of plain yellow)
- **Cards/Listings**: Add cosmic border glows, subtle hover animations with neon shadows matching card color
- **Empty states**: Replace plain emoji with glowing cosmic orbs
- **Wallet section (lines 638-669)**: Replace "SOLANA WALLET — COMING SOON" / "Helius RPC" with **"SUI WALLET — COMING SOON"** and **"Thirdweb"** as the auth/wallet provider. Update blockchain info to show Chain: Sui, Provider: Thirdweb
- **Fee color helper**: Simplify since fee is always flat 3% now (always green)

### 2. `src/lib/walletSystem.ts` — Already correct (Thirdweb + Sui references in comments), no changes needed

### 3. `src/components/wallet/WalletConnect.tsx` — Minor cosmic styling
- Add cosmic glow borders, match the `bg-[#050510]` theme
- Update "coming soon" text to mention Sui

### Files
| File | Action |
|------|--------|
| `src/pages/Marketplace.tsx` | Modify — cosmic theme + Sui/Thirdweb wallet |
| `src/components/wallet/WalletConnect.tsx` | Modify — cosmic styling + Sui reference |

