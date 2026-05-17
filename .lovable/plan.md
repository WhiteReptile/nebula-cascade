## Goal
Add "Continue with Google" to every auth touchpoint in the app, wired to Lovable Cloud's managed Google OAuth (no client ID/secret needed from you). Treat Lovable as the single source of truth — Replit's separate Supabase project is abandoned and will not be migrated.

## Why Google was missing
`src/pages/Auth.tsx` only implements `signInWithPassword`. No OAuth call, no Google button, no provider enabled on the Lovable Cloud backend. The Replit Supabase project (`pbklgtguxftmckwhwgtb…`) is a completely separate backend from Lovable Cloud (`aoodmexjovwvytzjdyhk…`), so any Google config you added there has no effect here.

## Scope of changes

### 1. Enable Google provider on Lovable Cloud
- Turn on managed Google OAuth for this backend (uses Lovable's shared credentials — zero config from you).
- Email/password stays enabled. No auto-confirm. No HIBP toggle change.

### 2. `/auth` page (`src/pages/Auth.tsx`)
- Add a "Continue with Google" button above the email/password form, styled to match the existing yellow neon Auth theme (`#ffdd00` glow, mono font, black/40 surface).
- A subtle "— or —" divider between Google and the email form.
- On click: redirect-style OAuth, returns to current origin after Google consent. Errors surfaced via the existing `useToast`.

### 3. Main menu (`src/components/menu/MainMenu.tsx`)
- The existing top-right **Login / Sign Up** button stays and still routes to `/auth` (full form lives there).
- Add a small secondary **"Continue with Google"** chip directly below the Login / Sign Up button, same cyan border style, so logged-out players get a one-click path without leaving the menu.
- Hidden once the user is logged in (uses `usePlayerProfile().isLoggedIn`).

### 4. Guest nickname modal (`src/components/menu/GuestNicknameModal.tsx`)
- Add a "Sign in with Google instead" link at the bottom of the modal, so guests have a clear upgrade path before committing to anonymous play.
- Triggers the same OAuth call; on success the guest flow is cancelled and the game starts as the authenticated player.

### 5. Profile auto-creation
- The existing `handle_new_user()` trigger already inserts a row into `public.players` on signup using `display_name` from `raw_user_meta_data`. Google sign-ups will land there with `display_name` falling back to `'Player'`. We'll patch the trigger to prefer `full_name` / `name` from Google's identity metadata when present, so new Google users get a real name automatically. No schema changes, just a function update.

## Technical notes
- Uses Lovable Cloud's managed Google OAuth — no client ID, secret, or Google Cloud Console setup required from you.
- Single OAuth helper added at `src/lib/auth.ts` so the same `signInWithGoogle()` call powers all three entry points.
- Redirect target: `window.location.origin`. Works in both preview and published environments.
- Email/password flow, guest flow, and all existing UI remain unchanged.

## Out of scope
- Migrating any data from the Replit Supabase project.
- Apple sign-in or other providers.
- Marketplace V3 (next thread).
- Restyling the existing Auth page beyond inserting the Google button + divider.

## Files touched
- `supabase/migrations/<new>.sql` — patched `handle_new_user()` to read Google name metadata.
- `src/lib/auth.ts` *(new)* — `signInWithGoogle()` helper.
- `src/pages/Auth.tsx` — Google button + divider.
- `src/components/menu/MainMenu.tsx` — Google chip under Login/Sign Up, hidden when logged in.
- `src/components/menu/GuestNicknameModal.tsx` — "Sign in with Google instead" link.
- Lovable Cloud auth config — Google provider enabled via `configure_social_auth`.
