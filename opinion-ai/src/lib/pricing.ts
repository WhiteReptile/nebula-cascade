export const PRICING_PACKAGES = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    cardTone: "yellow",
    headline: "20 AI opinions every day",
    description: [
      "AI opinions on text: social posts, marketing plans, job descriptions, and artwork that lives in words — poetry, screenplays, and other writing.",
      "No images, video, or music. No human reviewer. No credits. No share switch.",
    ],
    features: [
      "20 AI opinions every day",
      "Text only — including poetry and screenplays",
      "Social posts, marketing plans, job descriptions",
      "YourTruths scoring system",
      "Strengths and weaknesses",
      "Clear final verdict",
      "8 sentences",
    ],
    cta: { label: "Start free", href: "/submit" },
  },
  {
    id: "human-ai",
    name: "HYBRID",
    price: "$15",
    cardTone: "blue",
    headline: "5 AI-enhanced human evaluations.",
    description: [
      "Submit music, video, images, or other creative work. A real reviewer independently experiences your work and provides their raw perspective. YourTruths AI then transforms that human input into a concise, structured 8-sentence evaluation.",
      "Real perspective. AI evaluation. One focused opinion.",
    ],
    features: [
      "5 evaluation credits",
      "Real human perspective",
      "AI-powered analysis & rewrite",
      "Anonymous reviewers",
      "0–100 YourTruths Score",
      "Strengths & weaknesses",
      "Structured verdict",
      "Share results on or off",
      "Use your credits whenever you want",
    ],
    cta: { label: "Get 5 Hybrid evaluations", href: "/submit?pack=human-ai" },
  },
  {
    id: "human-ai-pro",
    name: "HYBRID PRO",
    price: "$35",
    cardTone: "red",
    headline: "10 AI-enhanced human evaluations.",
    description: [
      "More evaluations, and longer work, including music and video over 2 minutes.",
      "Same Hybrid review: a real person experiences the work, then YourTruths AI writes the 8-sentence evaluation.",
      "Use the 10 credits when you want.",
    ],
    features: [
      "10 evaluation credits",
      "Real human perspective",
      "AI-powered analysis & rewrite",
      "Anonymous reviewers",
      "0–100 YourTruths Score",
      "Strengths & weaknesses",
      "Structured verdict",
      "Longer submissions supported",
    ],
    privateLabel: "Private use",
    privateFeatures: ["Your opinion is not shared"],
    cta: { label: "Get 10 Hybrid evaluations", href: "/submit?pack=human-ai-pro" },
  },
  {
    id: "extended",
    name: "EXTENDED PREMIUM",
    price: "Contact Sales",
    headline: "Need more than the standard packages?",
    description: [
      "YourTruths offers custom plans for businesses, studios, agencies, creators, researchers, and organizations requiring large-scale or specialized evaluations.",
    ],
    featuresLabel: "Plans can include:",
    features: [
      "High-volume AI + human reviews",
      "Extended music and video evaluations",
      "Multiple independent human reviewers",
      "Custom evaluation criteria",
      "Specialized scoring systems",
      "Priority processing",
      "Confidential submissions",
      "Custom reports and analytics",
    ],
    footer:
      "Tell us what you need, how much content you have, and how frequently you need evaluations. We'll build a custom YourTruths plan for you.",
    cta: {
      label: "Contact Sales",
      href: "mailto:?subject=YourTruths%20Extended%20Premium",
    },
  },
] as const;

export const PRICING_PROMISE = {
  title: "The YourTruths Promise",
  lines: [
    "FREE = AI opinions on text. 20 every day. 8 sentences. No share switch. No images, video, or music.",
    "HYBRID = 5 credits. A real person experiences the work. AI rewrites that into 8 sentences. Share on or off at Submit.",
    "HYBRID PRO = 10 credits. Use them when you want. Human notes rewritten into 8 sentences. Private. Your opinion is not shared.",
    "No fake humans. No simulated feedback. No telling you what you want to hear.",
    "Just an independent opinion.",
  ],
} as const;

export const PRICING_NAV_COPY = [
  "FREE — $0. 20 AI opinions every day on text.",
  "HYBRID — $15. 5 AI-enhanced human evaluations. Share on or off.",
  "HYBRID PRO — $35. 10 AI-enhanced human evaluations. Private — your opinion is not shared.",
  "EXTENDED PREMIUM — Contact Sales.",
] as const;
