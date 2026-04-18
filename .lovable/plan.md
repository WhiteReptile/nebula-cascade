

# Fix: White Screen in Standalone Tab

## Problem
The app defaults to **light mode** (white background) because the CSS `:root` uses `--background: 0 0% 100%` (white). The Lovable preview iframe may inject a dark class, but a standalone browser tab does not — so you get a white screen with invisible dark-themed content.

## Solution
Force dark mode on the `<html>` element so the app always uses the dark color scheme. This is a game with a cosmic dark theme — light mode makes no sense here.

### Changes (2 files)

**1. `index.html`** — Add `class="dark"` to the `<html>` tag:
```html
<html lang="en" class="dark">
```

**2. `src/index.css`** — Add a fallback `background-color` to `html, body` so even before React mounts, the page is dark:
```css
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #050510;
}
```

No other files change. Game mechanics, menu, and all other components remain untouched.

