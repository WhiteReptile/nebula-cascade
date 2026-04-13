

# Menu Rename + Roadmap Page

## Changes

### 1. `src/components/menu/MainMenu.tsx`
- Merge `'RULES'` and `'REWARDS'` into `'REWARDS & RULES'` in `MENU_ITEMS`
- Update `handleSelect`: `'REWARDS & RULES'` navigates to `/rewards`; remove separate `'RULES'` case
- Add a **"ROADMAP"** button in the top-left corner (absolute positioned), styled like "Login / Sign Up" but on the opposite side, navigates to `/roadmap`

### 2. `src/pages/Rewards.tsx`
- Change title from `REWARDS` to `REWARDS & RULES` (line 291)

### 3. New: `src/pages/Roadmap.tsx`
- Cosmic-themed page (`bg-[#050510]`, `font-mono`, neon glows, CSS gradients)
- Back button header, "ROADMAP" title
- Timeline with 5 months: **April → August 2026**
- Each month is a collapsible/expandable card with color-coded header, goal subtitle, and milestone list with ✅/🔄 status icons
- Dynamic: months auto-highlight based on current date; past months show completion state, current month pulses/glows, future months are dimmed
- Deliverable summary at bottom of each month card

### 4. `src/App.tsx`
- Add import for `Roadmap`
- Add route: `/roadmap` → `<Roadmap />`
- Redirect `/rules` to `/rewards`

### Files
| File | Action |
|------|--------|
| `src/components/menu/MainMenu.tsx` | Modify — merge items, add Roadmap button |
| `src/pages/Rewards.tsx` | Modify — title rename |
| `src/pages/Roadmap.tsx` | Create — full roadmap page |
| `src/App.tsx` | Modify — add route, redirect `/rules` |

