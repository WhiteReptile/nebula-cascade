# Opinion.ai

Independent evaluation product: honest AI opinions on text, plus human + AI review for music, video, documents, and physical appearance.

Lives in the **nebula-cascade** monorepo as a sibling of the Nebula Cascade game. This app is a standalone Next.js project — it does not share the game’s Supabase backend.

## Status

See [STATUS.md](./STATUS.md) for the full readiness diagnosis.

**Studio-ready today:** local demo of free text opinions + human file queue.  
**Not launch-ready:** no Stripe, no user accounts, no durable cloud storage.

## Quick start

```bash
cd opinion-ai
npm ci
cp .env.example .env.local   # then fill LLM_API_KEY and ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `LLM_API_KEY` | For real AI | Groq (or set OpenAI vars instead) |
| `LLM_BASE_URL` | No | Default `https://api.groq.com/openai/v1` |
| `LLM_MODEL` | No | Default `openai/gpt-oss-20b` |
| `OPENAI_API_KEY` | Optional | Fallback if `LLM_API_KEY` empty |
| `ADMIN_PASSWORD` | For `/admin` | Shared password for the human review queue |
| `PRO_LONG_VIDEO` | No | Set `1` to allow video uploads over 2 minutes |

Without an LLM key the evaluate path still returns a **demo** verdict (hash-based). Submit does not surface that in the UI yet.

## Product surfaces

| Route | What it does |
|-------|----------------|
| `/` | Landing + mock signal samples |
| `/submit` | Text (instant AI) or file slots (human queue) |
| `/result/[id]` | Verdict view |
| `/history` | Client history + server review sync |
| `/pricing` | Free / $5 / $10 / Extended copy (no checkout yet) |
| `/how` | How-it-works copy |
| `/admin` | Human review login + job queue |

## Architecture (local)

```
Browser
  ├── POST /api/evaluate     → Groq (text) → localStorage history
  └── POST /api/queue        → data/uploads/<id> + data/jobs.json
        └── /admin review    → Groq rewrite of human notes
              └── COMPLETED → delete upload → FILE_DELETED
```

**Lifecycle for uploads:**  
`UPLOADED → PROCESSING → HUMAN_REVIEW → FINALIZING → COMPLETED → FILE_DELETED`

Only score, opinion, metadata, and history are kept long-term. Music/video/images/documents are deleted after the final result is saved.

Local data lives under `data/` (gitignored). That path does **not** survive serverless deploys (e.g. default Vercel).

## Launch blockers (summary)

1. **Payments** — Pricing CTAs grant fake localStorage credits via `?pack=`
2. **Accounts** — No auth; history and free-tier limits are browser-only
3. **Durable storage** — Need Postgres + blob storage before cloud deploy
4. **Server enforcement** — Free daily limit and credits are client-side only
5. **Privacy** — `GET /api/reviews` is a public shared feed without user scoping

## Repo layout

```
opinion-ai/
├── src/app/          # App Router pages + API routes
├── src/components/   # UI
├── src/lib/          # Queue, lifecycle, Groq pipeline, storage
├── public/           # Static assets
├── .env.example
├── STATUS.md         # Readiness diagnosis
└── README.md
```
