import type { AnalystOutput, CategoryId, SteelmanOutput, Verdict } from "../types";
import { getCategory } from "../categories";
import { rankingGuide } from "../ranking";

const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "openai/gpt-oss-20b";

type LlmConfig = { apiKey: string; baseUrl: string; model: string };

type SimpleOpinion = {
  score?: unknown;
  opinion?: unknown;
  strengths?: unknown;
  weaknesses?: unknown;
};

function preview(content: string, max = 120): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}

function hashContent(content: string): number {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = (h << 5) - h + content.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function phrases(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

function clampScore(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const scaled = n > 0 && n <= 10 ? n * 10 : n;
  return Math.min(100, Math.max(0, Math.round(scaled)));
}

export function getLlmConfig(): LlmConfig | null {
  const llmKey = process.env.LLM_API_KEY?.trim();
  if (llmKey) {
    return {
      apiKey: llmKey,
      baseUrl: (process.env.LLM_BASE_URL?.trim() || GROQ_BASE).replace(/\/$/, ""),
      model: process.env.LLM_MODEL?.trim() || GROQ_MODEL,
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      baseUrl: "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }

  return null;
}

function buildDemoAnalyst(content: string, category: CategoryId): AnalystOutput {
  const lines = content.split(/[\n.!?]+/).map((l) => l.trim()).filter(Boolean).slice(0, 5);
  return {
    observations: lines.length
      ? lines.map((l) => `Submission states: "${l.slice(0, 100)}${l.length > 100 ? "…" : ""}"`)
      : ["Submission is very short — limited evidence to analyze."],
    contradictions: ["Connect an AI API for deeper contradiction analysis."],
    comparableReferences: getCategory(category).dimensions.map((d) => `${d.name} benchmark`),
  };
}

function buildDemoSteelman(category: CategoryId): SteelmanOutput {
  const label = getCategory(category).label;
  return {
    caseFor: [
      `Core ${label.toLowerCase()} elements are present and addressable`,
      "Submission shows enough detail to evaluate at a surface level",
      "Revision and iteration could strengthen weak areas",
    ],
    caseAgainst: [
      "Demo mode cannot verify claims against real market data",
      "Some assertions may be optimistic without external validation",
      "Competitive positioning needs sharper articulation",
    ],
  };
}

function scoreFromContent(content: string, category: CategoryId): number {
  const h = hashContent(content + category);
  const len = content.trim().length;
  const base = 45 + (h % 35) + Math.min(15, Math.floor(len / 200));
  return Math.min(94, Math.max(32, base));
}

export function buildDemoVerdict(
  content: string,
  revisionOf: string | undefined,
  category: CategoryId,
  context?: string,
): Verdict {
  const framework = getCategory(category);
  const score = scoreFromContent(content + (context ?? ""), category);
  const isStrong = score >= 75;
  const isWeak = score < 55;

  return {
    id: crypto.randomUUID(),
    category,
    categoryLabel: framework.label,
    scoreContext: framework.scoreContext,
    score,
    strengths: isWeak
      ? ["Submission provides enough context to begin evaluation", "Core concept is understandable"]
      : ["Clear articulation of the core value proposition", "Specific details support evaluation", "Structure makes key points scannable"],
    weaknesses: isStrong
      ? ["Some claims would benefit from external validation", "Competitive positioning could be sharper"]
      : ["Differentiation from existing alternatives is underdeveloped", "Key metrics or proof points are missing", "Execution path is unclear"],
    originality: isStrong ? "Shows thoughtful positioning with some fresh angles." : "Familiar approach — needs a sharper wedge.",
    execution: isStrong ? "Well-structured submission with actionable detail." : "Concept is present but execution plan lacks specificity.",
    appeal: isStrong ? "Target audience would likely engage with the core idea." : "Appeal is limited until proof points are added.",
    competition: "Comparable to typical submissions in this category at similar stage.",
    potential: isWeak ? "Meaningful improvement possible with focused revision." : "Strong foundation — refinement could push this higher.",
    biggestProblem: isWeak ? "Insufficient differentiation and evidence to stand out." : "Proof points don't yet match the ambition of the claims.",
    biggestOpportunity: isWeak ? "Add one concrete metric, customer quote, or competitive comparison." : "Tighten positioning and add one undeniable proof point.",
    verdict: isStrong
      ? "Solid submission with clear strengths. Address the weaknesses above to strengthen further."
      : isWeak
        ? "Needs work before it's competitive. The core idea may have merit, but the submission doesn't yet prove it."
        : "Mixed — viable elements present, but key gaps hold it back. Revision recommended.",
    confidence: 65,
    analyst: buildDemoAnalyst(content, category),
    steelman: buildDemoSteelman(category),
    submissionPreview: preview(content),
    createdAt: new Date().toISOString(),
    revisionOf,
    context,
  };
}

function parseJsonContent<T>(raw: string): T | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function llmJson<T>(system: string, user: string, temperature: number): Promise<T | null> {
  const config = getLlmConfig();
  if (!config) return null;

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return null;
  return parseJsonContent<T>(raw);
}

const OPINION_SYSTEM = `You are Opinion.ai. Read the user's work and give a brutally honest opinion.
Do not flatter. Do not invent praise. Do not invent problems. If it is strong, say it is strong. If it is weak, say it is weak.
Use simple words. The opinion field must be 6 sentences or less.
The mix of strengths and weaknesses is free. Let the score decide:
- Great work can have many strengths (up to 5) and few or zero weaknesses.
- Mixed work can have both, in whatever split is true (for example 3 strengths and 2 weaknesses).
- Bad work can have many weaknesses (up to 5) and one or zero strengths.
Do not use the same counts every time. Vary the list. Get uneven when the work is uneven.

You MUST score with the Opinion.ai ranking system below. Choose the rank that is true, then pick an integer inside that band. This is how every real review is scored, not a display legend. Never use a 1-10 scale.

${rankingGuide()}

Write the opinion, strengths, and weaknesses in the same language as the submission. Handle English, Spanish, and Mandarin Chinese well. If the work is in Spanish, answer in Spanish. If it is in Mandarin, answer in Mandarin. If it is in English, answer in English.

Return JSON only with these keys:
- score: integer from 0 to 100 that matches the ranking system
- opinion: string, 6 sentences or less
- strengths: 0 to 5 short phrases. Use [] if there is no honest strength.
- weaknesses: 0 to 5 short phrases. Use [] if there is no honest weakness.`;

export async function evaluateSubmission(
  content: string,
  revisionOf: string | undefined,
  category: CategoryId,
  context?: string,
): Promise<Verdict> {
  const framework = getCategory(category);
  const packed = context?.trim()
    ? `${content}\n\nUser context:\n${context.trim()}`
    : content;

  const mixHints = [
    "This pass: if the work earns it, go heavy on strengths.",
    "This pass: if the work earns it, go heavy on weaknesses.",
    "This pass: keep the lists uneven. Do not balance them for symmetry.",
    "This pass: if it is excellent, weaknesses may be empty.",
    "This pass: if it is poor, strengths may be empty.",
  ];
  const hint = mixHints[Math.floor(Math.random() * mixHints.length)];

  const result = await llmJson<SimpleOpinion>(OPINION_SYSTEM, `${hint}\n\n${packed}`, 0.7 + Math.random() * 0.5);
  if (!result || typeof result.opinion !== "string" || !result.opinion.trim()) {
    return buildDemoVerdict(content, revisionOf, category, context);
  }

  const strengths = phrases(result.strengths, 5);
  const weaknesses = phrases(result.weaknesses, 5);
  const opinion = result.opinion.trim();

  return {
    id: crypto.randomUUID(),
    category,
    categoryLabel: framework.label,
    scoreContext: framework.scoreContext,
    score: clampScore(result.score, scoreFromContent(packed, category)),
    strengths,
    weaknesses,
    originality: "",
    execution: "",
    appeal: "",
    competition: "",
    potential: "",
    biggestProblem: weaknesses[0] ?? "",
    biggestOpportunity: strengths[0] ?? "",
    verdict: opinion,
    confidence: 70,
    analyst: {
      observations: ["One-pass opinion from the submission."],
      contradictions: [],
      comparableReferences: [],
    },
    steelman: {
      caseFor: strengths,
      caseAgainst: weaknesses,
    },
    submissionPreview: preview(content),
    createdAt: new Date().toISOString(),
    revisionOf,
    context: context?.trim() || undefined,
  };
}

const HUMAN_OPINION_SYSTEM = `You are Opinion.ai. A human reviewer already formed an opinion of this work. Their notes are the source. You only rewrite that opinion in simple words.

Do not invent a different take. Do not add praise or criticism that is not in the notes. Do not flatten or reverse their judgment.
The opinion field must be 6 sentences or less.
Write in the same language as the notes. Handle English, Spanish, and Mandarin Chinese well.

You MUST score with the Opinion.ai ranking system below. If the reviewer already gave a score, keep that exact score. If they did not, pick an integer that matches their notes — not a different opinion.

${rankingGuide()}

Return JSON only with these keys:
- score: integer from 0 to 100 that matches the ranking system
- opinion: string, 6 sentences or less
- strengths: 0 to 5 short phrases taken from the notes. Use [] if none.
- weaknesses: 0 to 5 short phrases taken from the notes. Use [] if none.`;

export type HumanOpinion = {
  score: number;
  opinion: string;
  strengths: string[];
  weaknesses: string[];
};

export async function opinionFromHumanNotes(input: {
  notes: string;
  score?: number;
  category: CategoryId;
  context: string;
  filename: string;
}): Promise<HumanOpinion> {
  const notes = input.notes.trim();
  const fallback: HumanOpinion = {
    score: input.score ?? 50,
    opinion: notes,
    strengths: [],
    weaknesses: [],
  };

  const scoreLine =
    typeof input.score === "number"
      ? `Human score (keep this number): ${input.score}`
      : "Human did not give a score. Pick one that matches the notes.";

  const user = [
    `Category: ${input.category}`,
    `Filename: ${input.filename}`,
    input.context.trim() ? `Submitter context:\n${input.context.trim()}` : "Submitter context: (none)",
    "",
    "Human reviewer notes:",
    notes,
    "",
    scoreLine,
  ].join("\n");

  const result = await llmJson<SimpleOpinion>(HUMAN_OPINION_SYSTEM, user, 0.2);
  if (!result || typeof result.opinion !== "string" || !result.opinion.trim()) {
    return fallback;
  }

  return {
    score: typeof input.score === "number" ? input.score : clampScore(result.score, fallback.score),
    opinion: result.opinion.trim(),
    strengths: phrases(result.strengths, 5),
    weaknesses: phrases(result.weaknesses, 5),
  };
}
