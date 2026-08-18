import type { CategoryFramework, CategoryId } from "./types";

export const LAUNCH_CATEGORIES: CategoryFramework[] = [
  {
    id: "business_idea",
    label: "Business Idea",
    scoreContext: "for early-stage startup viability",
    dimensions: [
      { name: "Market", weight: 20 },
      { name: "Differentiation", weight: 20 },
      { name: "Economics", weight: 20 },
      { name: "Competition", weight: 15 },
      { name: "Execution difficulty", weight: 10 },
      { name: "Growth potential", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this business idea. Note market size claims, differentiation claims, revenue model, target customer, competitive landscape mentions, and unrealistic assumptions. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this business idea using the framework: Market 20%, Differentiation 20%, Economics 20%, Competition 15%, Execution difficulty 10%, Growth potential 15%. Be accurate, not negative. Praise genuinely strong ideas.`,
  },
  {
    id: "landing_page",
    label: "Landing Page",
    scoreContext: "for conversion-focused SaaS landing pages",
    dimensions: [
      { name: "Value proposition clarity", weight: 25 },
      { name: "Copy quality", weight: 20 },
      { name: "Visual hierarchy", weight: 15 },
      { name: "Trust signals", weight: 15 },
      { name: "CTA effectiveness", weight: 15 },
      { name: "Differentiation", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations about this landing page copy. Note headline, subhead, CTA text, feature claims, social proof, pricing visibility, and target audience signals. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this landing page for conversion effectiveness. Framework: Value proposition 25%, Copy 20%, Visual hierarchy 15%, Trust 15%, CTA 15%, Differentiation 10%. Compare implicitly to typical indie SaaS landing pages.`,
  },
  {
    id: "pitch_pdf",
    label: "Pitch Deck",
    scoreContext: "for seed-stage investor readiness",
    dimensions: [
      { name: "Problem clarity", weight: 20 },
      { name: "Solution fit", weight: 15 },
      { name: "Market opportunity", weight: 20 },
      { name: "Traction evidence", weight: 15 },
      { name: "Team credibility", weight: 10 },
      { name: "Ask & use of funds", weight: 10 },
      { name: "Competitive moat", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations from this pitch content. Note problem statement, solution, market size, traction metrics, team background, funding ask, and competitive claims. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this pitch for seed-stage investor readiness. Be direct about gaps investors would probe. Framework weights: Problem 20%, Solution 15%, Market 20%, Traction 15%, Team 10%, Ask 10%, Moat 10%.`,
  },
];

export function getCategory(id: CategoryId): CategoryFramework {
  const cat = LAUNCH_CATEGORIES.find((c) => c.id === id);
  if (!cat) throw new Error(`Unknown category: ${id}`);
  return cat;
}

export function classifyCategory(content: string): CategoryId {
  const lower = content.toLowerCase();
  const pitchSignals = ["pitch deck", "seed round", "investor", "traction", "arr", "mrr", "use of funds"];
  const landingSignals = ["landing page", "sign up", "get started", "headline", "cta", "free trial"];
  const score = (signals: string[]) =>
    signals.reduce((n, s) => (lower.includes(s) ? n + 1 : n), 0);
  const pitchScore = score(pitchSignals);
  const landingScore = score(landingSignals);
  if (pitchScore >= landingScore && pitchScore > 0) return "pitch_pdf";
  if (landingScore > 0) return "landing_page";
  return "business_idea";
}
