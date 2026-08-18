import type { Verdict } from "./types";

const BASE = "2026-08-17T12:00:00.000Z";

export const MOCK_VERDICTS: Verdict[] = [
  {
    id: "example-business",
    category: "business_idea",
    categoryLabel: "Business Idea",
    scoreContext: "for early-stage startup viability",
    score: 58,
    strengths: [
      "Clear pain point in restaurant inventory waste",
      "Founder has domain experience in food service ops",
      "Simple SaaS pricing model is easy to understand",
    ],
    weaknesses: [
      "Market crowded with Toast, MarketMan, and 20+ incumbents",
      "No stated wedge beyond 'AI-powered' — feature, not differentiation",
      "Unit economics assume $200/mo ARPU with no churn data",
    ],
    originality: "Familiar category. AI forecasting is a positioning claim, not a proven moat.",
    execution: "Concept is buildable, but GTM plan is absent. No channel strategy stated.",
    appeal: "Restaurants with tight margins may care, but switching costs from existing POS integrations are high.",
    competition: "Weaker than incumbents on integrations and brand trust.",
    potential: "Could improve with a narrow wedge — e.g., single-location ethnic restaurants ignored by enterprise vendors.",
    biggestProblem: "Differentiation is generic. 'AI inventory' without proof of accuracy vs existing tools.",
    biggestOpportunity: "Pick one underserved micro-segment and show 30-day waste reduction data before scaling.",
    verdict:
      "Viable problem, undifferentiated solution. As written, this reads like a feature pitch to an existing platform, not a standalone company.",
    confidence: 72,
    analyst: {
      observations: [
        "Submission claims 30% food waste reduction without citing methodology",
        "Target market stated as 'all restaurants' — no ICP segmentation",
        "Revenue model: $200/mo per location, no freemium path",
        "Competitors mentioned: none, despite obvious category leaders",
      ],
      contradictions: [
        "Claims 'no direct competitors' while describing standard inventory SaaS",
        "Assumes rapid adoption but doesn't address POS integration requirements",
      ],
      comparableReferences: ["MarketMan", "Toast inventory modules", "Afresh"],
    },
    steelman: {
      caseFor: [
        "Restaurant waste is a real, measurable cost center",
        "Founder domain knowledge could produce better UX than horizontal tools",
        "AI demand forecasting could outperform manual par sheets if proven",
      ],
      caseAgainst: [
        "Incumbents already adding AI features to existing integrations",
        "Restaurants are slow adopters with high sales friction",
        "Without integration moat, churn will be brutal after trial",
      ],
    },
    submissionPreview: "AI-powered inventory management for restaurants...",
    createdAt: BASE,
  },
  {
    id: "example-landing",
    category: "landing_page",
    categoryLabel: "Landing Page",
    scoreContext: "for conversion-focused SaaS landing pages",
    score: 74,
    strengths: [
      "Headline clearly states outcome: 'Ship docs 10x faster'",
      "Social proof includes 3 named logos and a specific metric",
      "Single primary CTA above the fold — no decision paralysis",
    ],
    weaknesses: [
      "Subhead buries the how — 'AI-powered platform' is vague",
      "No pricing or trial terms visible without scrolling",
      "Feature section lists 8 items — too many for above-fold clarity",
    ],
    originality: "Copy structure follows standard SaaS template. Competent, not distinctive.",
    execution: "Readable hierarchy and scannable bullets. Minor jargon weakens trust.",
    appeal: "Developer docs teams would understand the value quickly.",
    competition: "Comparable to mid-tier devtool landing pages — below Stripe/Notion polish.",
    potential: "Tightening subhead + adding one concrete before/after example could push this to 85+.",
    biggestProblem: "Value prop explains what, not why you over alternatives.",
    biggestOpportunity: "Add a 15-second product demo GIF or one customer quote with a specific metric.",
    verdict: "Solid B-tier landing page. Would convert curious devs but leave skeptical buyers wanting proof.",
    confidence: 81,
    analyst: {
      observations: [
        "Headline: 'Ship docs 10x faster' — outcome-focused, quantified",
        "Subhead mentions AI but no mechanism or differentiation",
        "CTA: 'Start free trial' — no credit card mention visible",
        "Feature grid: 8 items including API, SSO, analytics",
      ],
      contradictions: [
        "Claims '10x faster' but no benchmark or customer evidence on page",
        "Enterprise features listed (SSO) but tone targets indie developers",
      ],
      comparableReferences: ["Typical indie devtool landing", "Notion docs marketing page"],
    },
    steelman: {
      caseFor: [
        "Clear outcome headline reduces bounce for intent-matched visitors",
        "Logo bar provides instant credibility signal",
        "Feature completeness suggests mature product",
      ],
      caseAgainst: [
        "Quantified claim without evidence triggers skepticism",
        "Feature overload dilutes the core value proposition",
        "Missing pricing creates friction for comparison shoppers",
      ],
    },
    submissionPreview: "Headline: Ship docs 10x faster...",
    createdAt: BASE,
  },
  {
    id: "example-pitch",
    category: "pitch_pdf",
    categoryLabel: "Pitch Deck",
    scoreContext: "for seed-stage investor readiness",
    score: 41,
    strengths: [
      "Problem slide cites a real regulatory shift driving demand",
      "Team slide shows one relevant exit in the space",
      "TAM calculation methodology is shown, not just asserted",
    ],
    weaknesses: [
      "Traction slide shows vanity metrics (downloads) not revenue or retention",
      "Competitive slide dismisses incumbents without addressing their advantages",
      "Ask ($3M) exceeds typical seed for this traction level",
    ],
    originality: "Regulatory angle is interesting but not fully developed into a moat narrative.",
    execution: "Deck structure follows standard template. Several slides are text-heavy.",
    appeal: "Regulatory-driven markets can attract investors, but proof of pull is missing.",
    competition: "Incumbents named but not positioned — reads as 'we're better' without evidence.",
    potential: "Could improve significantly with 3 paying pilots and revised ask aligned to milestones.",
    biggestProblem: "No revenue, no retention data, no clear why-now beyond regulation.",
    biggestOpportunity: "Replace download metrics with pilot LOIs or signed design partners.",
    verdict: "Not investor-ready at seed. The regulatory hook is worth exploring, but traction and ask are misaligned.",
    confidence: 78,
    analyst: {
      observations: [
        "Problem: new EU compliance requirement effective Q1 2027",
        "Traction: 12,000 app downloads, 400 weekly active users, $0 revenue",
        "Ask: $3M seed at $12M pre-money",
        "Competition slide lists 4 incumbents with 'legacy' label only",
      ],
      contradictions: [
        "Claims 'strong product-market fit' with zero paying customers",
        "Regulatory urgency (2027) doesn't justify $3M burn rate without GTM proof",
      ],
      comparableReferences: ["Typical pre-seed compliance startup deck"],
    },
    steelman: {
      caseFor: [
        "Regulatory mandates create non-discretionary budget lines",
        "Team has domain credibility from prior exit",
        "Market timing aligns with compliance deadline",
      ],
      caseAgainst: [
        "Downloads ≠ revenue; investors will discount vanity metrics",
        "Incumbents can add compliance modules faster than startup can build distribution",
        "$3M ask implies 18-month runway without clear milestone plan",
      ],
    },
    submissionPreview: "Slide 1: ComplianceOS — automated regulatory reporting...",
    createdAt: BASE,
  },
];

export function getMockVerdict(id: string): Verdict | undefined {
  return MOCK_VERDICTS.find((v) => v.id === id);
}
