import type { AnalystOutput, CategoryId, SteelmanOutput, Verdict } from "../types";
import { classifyCategory, getCategory } from "../categories";

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

export function buildDemoVerdict(content: string, revisionOf?: string): Verdict {
  const category = classifyCategory(content);
  const framework = getCategory(category);
  const score = scoreFromContent(content, category);
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
  };
}

async function llmJson<T>(system: string, user: string): Promise<T | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.4,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as T;
}

export async function evaluateSubmission(content: string, revisionOf?: string): Promise<Verdict> {
  const category = classifyCategory(content);
  const framework = getCategory(category);

  const analyst =
    (await llmJson<AnalystOutput>(
      `${framework.analystPrompt} Return JSON: { "observations": string[], "contradictions": string[], "comparableReferences": string[] }`,
      content,
    )) ?? buildDemoAnalyst(content, category);

  const steelman =
    (await llmJson<SteelmanOutput>(
      'Construct the strongest case FOR and AGAINST. Return JSON: { "caseFor": string[], "caseAgainst": string[] }',
      `Submission:\n${content}\n\nAnalyst:\n${JSON.stringify(analyst)}`,
    )) ?? buildDemoSteelman(category);

  const opinion =
    (await llmJson<Omit<Verdict, "id" | "submissionPreview" | "createdAt" | "revisionOf" | "analyst" | "steelman">>(
      `${framework.opinionPrompt}

Anti-yes-man: search for weaknesses AND strengths. If genuinely excellent, say so.
Return JSON: categoryLabel, scoreContext, score, strengths, weaknesses, originality, execution, appeal, competition, potential, biggestProblem, biggestOpportunity, verdict, confidence.`,
      `Submission:\n${content}\n\nAnalyst:\n${JSON.stringify(analyst)}\n\nSteelman:\n${JSON.stringify(steelman)}`,
    )) ?? (() => {
      const demo = buildDemoVerdict(content);
      const { id, submissionPreview, createdAt, revisionOf: _r, ...rest } = demo;
      return rest;
    })();

  return {
    ...opinion,
    category,
    categoryLabel: framework.label,
    scoreContext: framework.scoreContext,
    analyst,
    steelman,
    id: crypto.randomUUID(),
    submissionPreview: preview(content),
    createdAt: new Date().toISOString(),
    revisionOf,
  };
}
