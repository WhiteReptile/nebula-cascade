# YourTruths — Product Bible

**Scope:** YourTruths only. Absolute.  
**Code:** `opinion-ai/` (Next.js). Repo nickname Opinion.ai.  
**Status:** Studio-ready locally. Not production-launch ready (see Launch blockers).

---

## 1. What it is

**YourTruths** gives honest, independent opinions on creative and professional work.

- **Free AI** for text, PDFs, images, and physical appearance (5/day claimed).
- **Human + AI** for music and video only: a real person listens or watches; Pro Examiner rewrites their notes into a clear opinion.

**Pitch:** An AI engine for unbiased, real opinions — not cheerleading.  
**Line:** “No yes-men. Just opinions.”  
**Meta:** “An AI designed to give unbiased, real opinions of your work.”

### The YourTruths Promise

- FREE = AI on text, PDFs, images, physical appearance. 5 every day.
- HUMAN + AI = music and video only. 5 credits. A real person listens or watches.
- HUMAN + AI PRO = 10 music/video credits, priority queue, best reviewers. Private.
- No fake humans. No simulated feedback. No telling you what you want to hear.
- Just an independent opinion.

---

## 2. Pages

| Route | Job |
|-------|-----|
| `/` | Landing, signal samples, score scale |
| `/submit` | Submit work (category tabs) |
| `/result/[id]` | Verdict |
| `/history` | Past opinions |
| `/pricing` | Packs + promise |
| `/how` | How it works |
| `/admin` | Reviewer login + queue + AI usage tank |
| `/admin/[id]` | Listen/watch upload + write review |

Submit query helpers: `?category=`, `?revision=`, `?queued=`, `?pack=`, `?error=`.

Public nav: Submit · History · Pricing (+ How). Admin is not in public nav; robots disallow `/admin`.

---

## 3. What you can submit

| Category | Mode | What happens |
|----------|------|----------------|
| **Text** | Free AI | Paste or PDF → instant Pro Examiner V2 |
| **Images** | Free AI | Notes + optional image → instant AI |
| **Physical appearance** | Free AI | Same pattern → instant AI |
| **Music** | Human + AI | File upload → admin queue → human notes → AI rewrite → file deleted |
| **Video** | Human + AI | Same; over 2 minutes needs PRO / `PRO_LONG_VIDEO=1` |

Broader frameworks exist in code (homework, business, landing, pitch, etc.) for prompts/classification — **not** as submit tabs.

---

## 4. Pricing (copy live; checkout not real yet)

| Pack | Price | Gets |
|------|-------|------|
| **FREE** | $0 | 5 AI opinions/day — text, PDFs, images, appearance. No music/video. Score, strengths/weaknesses, verdict, 8 sentences. |
| **HUMAN + AI** | $5 | 5 music/video human opinions → 8-sentence AI rewrite. Anonymous. Share on/off. |
| **HUMAN + AI PRO** | $10 | 10 music/video, priority, best reviewers, longer clips, private. |
| **EXTENDED PREMIUM** | Contact | Volume, SLA, multi-reviewer, custom criteria, confidential. |

**Gap:** `?pack=` does not yet mint real server credits. Queue API does not check payment. localStorage pack helpers exist but are not a real checkout.

---

## 5. Admin (music & video control panel)

Password: `ADMIN_PASSWORD` → cookie (30 days).

- List jobs (awaiting human first)
- Open job: **audio/video player**, image/PDF preview, download
- Write notes, optional 0–100 score, strength/weakness tags
- Submit → Pro Examiner rewrite → save opinion → **delete upload**
- Live **AI usage tank** (requests/min, /day, evaluate vs human_review vs demo)
- Logout

User wait copy: a review can take 5–10 minutes.

---

## 6. AI — Pro Examiner

| | Detail |
|--|--------|
| Default provider shape | Groq OpenAI-compatible (`LLM_BASE_URL`, `LLM_API_KEY`) |
| Default model | `openai/gpt-oss-20b` (override with `LLM_MODEL`) |
| Fallback | `OPENAI_API_KEY` / `OPENAI_MODEL` |
| **Pro Examiner V1** | Opinion ≤ 6 sentences |
| **Pro Examiner V2** | Exactly 8 sentences (default) |
| Free path | One-pass JSON: score, opinion, strengths/weaknesses |
| Human path | Rewrite human notes only; keep human score if given |
| Languages | EN / ES / ZH supported in prompts |

### Demo mode (no `LLM_API_KEY`)

- Returns a hash-based fake verdict (`buildDemoVerdict`)
- Submit shows: “Demo mode — add an LLM API key in .env to enable Pro Examiner V2.”
- Usage logged as `demo`
- Turning Groq on + setting the key = live AI

---

## 7. Upload job lifecycle

```
UPLOADED → PROCESSING → HUMAN_REVIEW → FINALIZING → COMPLETED → FILE_DELETED
```

Kept long-term: score, opinion, strengths/weaknesses, metadata.  
**Not kept:** music/video/image files after the opinion is saved.

Local storage (dev): `data/jobs.json`, `data/uploads/`, `data/verdicts/`, `data/llm-usage.json`.  
This disk layout does **not** survive typical serverless deploys.

---

## 8. Score system (0–100)

Not a 1–10 scale. Bands are enforced in the LLM prompts.

| Score | Rank |
|-------|------|
| 0–19 | Catastrophic |
| 20–29 | Terrible |
| 30–39 | Very Weak |
| 40–49 | Weak |
| 50–57 | Below Average |
| 58–64 | Mediocre |
| 65–69 | Mediocre+ |
| 70–74 | Good |
| 75–79 | Very Good |
| 80–84 | Excellent |
| 85–89 | Outstanding |
| 90–94 | Exceptional |
| 95–99 | Extraordinary |
| 100 | Near-Perfect |

---

## 9. Capacity & limits

| Limit | Value |
|-------|--------|
| Claimed free AI / day | **5** (client localStorage today — API not enforced) |
| LLM tank (tracked) | **30/min**, **~1,000/day**, 8000 tokens/min |
| Safe early free AI load | ~**50–200 users/day** |
| Human reviews (solo admin) | ~**10–30/day** |
| Content max | 50,000 characters |
| Context max | 8,000 characters |
| Queue file max | **80 MB** |
| Video default cap | **120 seconds** |
| Text PDF max | 12 MB |
| History entries | 50 |

**Bottlenecks:** LLM daily cap, then your review time — not “concurrent browsers.”

---

## 10. Environment

| Variable | Need | Purpose |
|----------|------|---------|
| `LLM_API_KEY` | Live AI | Pro Examiner |
| `LLM_BASE_URL` | Optional | Default Groq OpenAI-compatible URL |
| `LLM_MODEL` | Optional | Model id |
| `OPENAI_API_KEY` | Optional | Fallback if LLM key empty |
| `OPENAI_MODEL` | Optional | Fallback model |
| `ADMIN_PASSWORD` | Admin | Shared queue password |
| `PRO_LONG_VIDEO` | Optional | `1` = allow video over 2 minutes |
| `PUBLIC_ORIGIN` | Prod recommended | Redirect base for form APIs |

---

## 11. Important APIs

| Method | Path | Role |
|--------|------|------|
| POST | `/api/evaluate` | Free AI JSON |
| POST | `/api/submit-free` | Free AI form → `/result/[id]` |
| POST | `/api/submit-text` | Text/PDF form path |
| POST | `/api/queue` | Music/video upload → `{id}` |
| POST | `/api/queue-submit` | Upload via redirect `?queued=` |
| GET | `/api/queue/[id]` | Poll pending / done |
| GET | `/api/verdict/[id]` | Stored free-AI verdict |
| GET | `/api/reviews` | Shared job feed (**public, no auth — tighten before launch**) |
| POST | `/api/admin/login` | Admin password |
| POST | `/api/admin/logout` | Clear cookie |
| GET | `/api/admin/usage` | LLM usage outlook |
| GET | `/api/admin/jobs/[id]/file` | Stream/download upload |
| POST | `/api/admin/jobs/[id]/review` | Human review → finalize |

---

## 12. Launch blockers

| Blocker | Severity |
|---------|----------|
| No Stripe / real checkout | Critical |
| No user accounts (history + free limit per browser) | Critical |
| Local `data/` disk (won’t persist on serverless) | Critical |
| Free 5/day + paid credits not enforced on API | Critical |
| Queue does not check payment | Critical |
| Public `/api/reviews` without user scoping | High |
| Demo mode if no LLM key | Medium (submit warns) |
| Human ops capacity | Ops |

**Recommended build order:** secrets → durable jobs (DB + blob TTL) → auth (e.g. Google) → Stripe → server rate limits → tighten reviews API → long-lived Node (or equivalent) deploy.

---

## 13. Local revive

```bash
cd opinion-ai
npm ci
cp .env.example .env.local
# set LLM_API_KEY and ADMIN_PASSWORD for live AI + admin
npm run dev
```

Smoke: `/` → `/submit` text → `/result/...` → upload short audio → `/admin` review → confirm file gone from `data/uploads/` and job kept with `FILE_DELETED`.

---

## 14. Key code map

| Area | Files |
|------|--------|
| Pricing / promise | `src/lib/pricing.ts` |
| How copy | `src/lib/how-copy.ts` |
| Categories / frameworks | `src/lib/categories.ts` |
| Submit tabs | `src/lib/submit-form-slots.ts`, `submit-categories.ts` |
| Queue / uploads | `src/lib/queue.ts`, `queue-shared.ts` |
| Lifecycle | `src/lib/job-lifecycle.ts` |
| AI pipeline | `src/lib/evaluate/pipeline.ts` |
| Ranking | `src/lib/ranking.ts` |
| LLM usage tank | `src/lib/llm-usage.ts` |
| Admin auth | `src/lib/admin-auth.ts` |
| Client history / packs | `src/lib/storage.ts` |
| Admin UI | `src/app/admin/`, `AdminReviewForm`, `AdminUsagePanel` |

---

*This bible is the absolute YourTruths source of truth. Update it when product behavior or launch status changes.*
