

# Marketplace User Hub — Complete Rebuild

## Overview
Transform the Marketplace page into a premium all-in-one user hub with 4 tabs: Marketplace, My Cards, Profile, and Wallet. Includes auth state awareness (login/logout/signup inline), card listing form with fee converter, and consistent cosmic styling.

## Architecture

The Marketplace page becomes a single-page hub with a vertical sidebar nav (left) and content area (right), replacing the current simple 2-tab layout.

```text
┌─────────────────────────────────────────────┐
│  ← Back            NEBULA HUB              │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ MARKET   │   [Active content area]          │
│ MY CARDS │                                  │
│ PROFILE  │                                  │
│ WALLET   │                                  │
│          │                                  │
│──────────│                                  │
│ Log Out  │                                  │
└──────────┴──────────────────────────────────┘
```

If not logged in, the sidebar shows Login / Sign Up buttons instead of Profile/Logout, and My Cards shows a prompt to sign in.

## Sections

### 1. MARKETPLACE Tab
- Card grid layout (not list) with card orb, name, division badge, price
- Fee tier color indicator (green 5% / yellow 7% / red 10%)
- BUY button for others' cards, CANCEL for own listings
- Division filter buttons across top (All, Div V, IV, III, II, I)
- Empty state with cosmic styling

### 2. MY CARDS Tab
- Owned cards grid with visual energy bars (filled/empty pips)
- Active card highlighted with animated glow ring
- Click card to set active
- "List on Marketplace" button per card — opens inline listing form
- Listing form: price input (USD), live fee preview calculator showing "You receive: $X.XX after Y% fee"
- Card count indicator (X/10)

### 3. PROFILE Tab
- Display name, email (from auth), division badge, total matches
- Active card preview
- Division progress bar toward next tier
- If not logged in: show sign-in/sign-up form inline (reuse Auth page logic)

### 4. WALLET Tab
- Existing WalletConnect component unchanged
- Current linked wallet address display

## File Changes

| File | Change |
|------|--------|
| `src/pages/Marketplace.tsx` | Full rebuild — sidebar nav, 4 sections, listing form, fee converter, auth integration, division filter |
| `src/components/game/GameHUD.tsx` | Line 342: change `/cards` to `/marketplace` |

## Technical Details

- **Auth state**: Use `supabase.auth.getUser()` + `onAuthStateChange` to show login/logout contextually
- **Logout**: Call `supabase.auth.signOut()` then redirect to `/`
- **Sign in/up**: Inline forms in Profile tab (same logic as Auth.tsx but embedded)
- **Listing form**: Local state `listingCardId`, `listPrice`. Calls `calculateFee()` from marketplaceSystem for live preview, then `listCard()` on submit
- **Fee converter**: Pure math — `priceCents * feePercent / 100` shown inline
- **Division filter**: Client-side filter on `listings` array by `cardDivision`
- **No new dependencies** — all existing UI components + Tailwind
- **Sidebar nav**: Vertical `Tabs` with `TabsList` orientation vertical, styled with the yellow/cyan neon accents matching MainMenu

## Styling Approach
- Dark cosmic background (#0a0a1a) with backdrop-blur panels
- Yellow-400 accent for active states, white/40 for inactive
- Neon text-shadows matching game HUD aesthetic
- Card orbs with radial gradients and colored box-shadows
- Energy displayed as `⚡ X/2` with cyan/red coloring
- Consistent font-mono, uppercase tracking throughout

