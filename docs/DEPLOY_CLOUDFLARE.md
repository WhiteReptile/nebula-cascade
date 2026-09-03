# Deploy on Cloudflare

## Portfolio hub — `nebula-cascade.com`

Static Vite SPA from the **repo root**.

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `/` (repository root) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Custom domain | `nebula-cascade.com` (+ redirect `www` → apex) |

SPA routes are handled by [`public/_redirects`](../public/_redirects) (`/* → /index.html`).

Public routes:

- `/` — studio portfolio
- `/film` — Nebula Cascade film landing (+ game gate)
- `/work/yourtruths` — YourTruths case study
- `/work/nebula-cascade` — film/game case study

After connecting the domain in Cloudflare Pages → Custom domains, wait for SSL.

---

## YourTruths — `yourtruths.nebula-cascade.com`

Next.js app in [`opinion-ai/`](../opinion-ai/). Needs a **Node runtime** (API routes, PDF parse, disk queue).

### Recommended first ship (Node host + Cloudflare DNS)

1. Deploy `opinion-ai/` to Railway, Render, or Fly.io (`npm run build` + `npm run start`).
2. Set env:
   - `LLM_API_KEY` — Groq key
   - `ADMIN_PASSWORD` — admin gate
   - `PUBLIC_ORIGIN=https://yourtruths.nebula-cascade.com` (optional; redirects also honor `X-Forwarded-Host`)
3. In Cloudflare DNS:
   - `yourtruths` → `CNAME` → your host target
   - Proxy on (orange cloud), SSL Full (strict)

### Later: Cloudflare Workers / OpenNext

Requires migrating `opinion-ai/data/` disk storage to **R2** (or another durable store). Do not ship OpenNext until uploads and queue jobs no longer depend on local `fs`.

### Portfolio links

Project cards and the contact CTA already point at:

`https://yourtruths.nebula-cascade.com`

Until that subdomain is live, visitors will see DNS/host downtime — ship a “coming soon” page on the host if needed.

---

## CI note

If Cloudflare **Workers Builds** fails while **Pages** succeeds, disable or ignore the unused Workers project. The portfolio only needs Pages.
