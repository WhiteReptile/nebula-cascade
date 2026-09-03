# Opinion.ai — Status & diagnosis

**Updated:** 2026-08-26  
**Branch:** `cursor/opinion-ai-cosmic-ui-fa7b`  
**Verdict:** **Studio-ready local product. Not production-launch ready.**

---

## Overall diagnosis

Opinion.ai is a working Next.js 16 app for unbiased evaluations:

- Free **text** opinions via Groq (or silent demo mode without a key)
- **Human + AI** queue for music, video, images, physical appearance
- Temporary uploads with a safe delete-after-result lifecycle
- Cosmic UI, pricing copy, history, admin review tools

It sits beside Nebula Cascade in the same git repo but is **not** wired to Nebula’s Supabase backend. Think of it as a sibling product, not a feature of the game.

| Layer | Today | For launch |
|-------|--------|------------|
| App UI | Solid | Polish copy/how vs real pipeline |
| AI (Groq) | Works when keyed | Rate limits + cost controls |
| Human queue | Works on one machine | Multi-reviewer + durable jobs |
| Storage | Local `data/` JSON + files | Postgres + ephemeral blob |
| Auth | Admin password only | User accounts |
| Payments | Simulated credits | Stripe (or similar) |
| Deploy | Local / long-lived Node | Vercel alone is not enough as-is |

---

## What works now (studio)

- [x] Landing, submit, result, history, pricing, how
- [x] Text → `/api/evaluate` → verdict
- [x] File upload → queue → admin listen/watch → opinion → file deleted
- [x] Job lifecycle: `UPLOADED → … → FILE_DELETED`
- [x] Pro Examiner V1/V2 selector (prompt sentence length)
- [x] Production `npm run build` passes
- [x] Admin gate via `ADMIN_PASSWORD`

## What does not work for public launch

| Blocker | Severity | Detail |
|---------|----------|--------|
| No Stripe / real checkout | Critical | `?pack=human-ai` invents credits in localStorage |
| No user accounts | Critical | History and free limits are per-browser |
| Local disk storage | Critical | `data/jobs.json` + uploads won’t persist on serverless |
| Client-only free limit | Critical | `5/day` in localStorage; API is open |
| Client-only credits | Critical | Queue API does not check payment |
| Public reviews feed | High | `/api/reviews` exposes shareable jobs without auth |
| Demo LLM mode silent | Medium | Missing key → fake verdict; UI doesn’t warn |
| Human capacity | Ops | File reviews need a real person (~minutes each) |

---

## Capacity (when free tiers start to hurt)

Rough order of what breaks first:

1. **Groq free tier** (~1k req/day on current model) ≈ hundreds of free text users/day
2. **Human reviewers** for music/files ≈ tens of reviews/day per person
3. **Hosting** (Vercel Hobby → Pro) for commercial traffic
4. **Database size** last — opinion rows are tiny; Supabase free DB would hold a huge number of results

See prior product notes: store results in Postgres; do **not** keep media long-term.

---

## Recommended next build order

1. **Env + secrets** — Groq key + strong `ADMIN_PASSWORD` in production secrets
2. **Durable jobs** — Postgres (e.g. Supabase) for jobs/results; blob with TTL for uploads
3. **Auth** — Google + email magic link; bind history and quotas to `userId`
4. **Stripe** — Real packs; webhooks mint credits server-side
5. **Server rate limits** — Enforce free 5/day and paid credits on the API
6. **Tighten `/api/reviews`** — Only the user’s jobs + explicitly public feed
7. **Deploy** — Long-lived Node or Vercel + external storage (not local `data/`)

---

## Local revive checklist

```bash
cd opinion-ai
npm ci
cp .env.example .env.local
# set LLM_API_KEY and ADMIN_PASSWORD
npm run build
npm run dev
```

Smoke:

- Open `/` and `/submit`
- Submit short text → `/result/...`
- Upload a small audio file → `/admin` → review → confirm upload gone from `data/uploads/`
- Confirm job remains in `data/jobs.json` with `FILE_DELETED`

---

## Monorepo note

| Path | Product |
|------|---------|
| `/` (repo root) | Nebula Cascade — Vite + Phaser game + Supabase |
| `/opinion-ai` | Opinion.ai — Next.js evaluation product |

Deploy and operate them separately unless you deliberately share auth/billing.
