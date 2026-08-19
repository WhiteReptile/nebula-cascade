export const PRICING_PACKAGES = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    cardTone: "yellow",
    headline: "5 AI opinions every day",
    description: [
      "Straightforward AI opinions on text, images, artwork, ideas, social posts, and other short-form content.",
      "No human reviewer. No credits. No share switch.",
    ],
    features: [
      "5 AI opinions every day",
      "Text and other short-form work",
      "Opinion.ai scoring system",
      "Strengths and weaknesses",
      "Clear final verdict",
      "8 sentences",
    ],
    cta: { label: "Start free", href: "/submit" },
  },
  {
    id: "human-ai",
    name: "HUMAN + AI",
    price: "$5",
    cardTone: "blue",
    headline: "5 AI + human opinions",
    description: [
      "For music, video, documents, artwork, and other supported files.",
      "A real person watches, listens to, or reads the work. Groq rewrites their notes into an 8-sentence review.",
      "Use the 5 credits when you want. On Submit, switch Human + AI on or off, and switch share on or off.",
    ],
    features: [
      "5 AI + human opinions",
      "Use a credit when you want (on/off at Submit)",
      "Share this opinion: on or off at Submit",
      "8-sentence review (human notes, AI rewritten)",
      "Human review included",
      "Anonymous reviewers",
      "Opinion.ai score + ranking",
    ],
    cta: { label: "Get 5 Premium Opinions", href: "/submit?pack=human-ai" },
  },
  {
    id: "human-ai-pro",
    name: "HUMAN + AI PRO",
    price: "$10",
    cardTone: "red",
    headline: "10 AI + human opinions",
    description: [
      "More evaluations, and longer work, including music and video over 2 minutes.",
      "Same human + AI review as the $5 tier, including the 8-sentence rewrite.",
      "Use the 10 credits when you want. On Submit, switch Human + AI on or off.",
    ],
    features: [
      "10 AI + human opinions",
      "Use a credit when you want (on/off at Submit)",
      "8-sentence review (human notes, AI rewritten)",
      "Real human reviewers",
      "Longer submissions supported",
      "Opinion.ai score + ranking",
    ],
    privateLabel: "Private use",
    privateFeatures: ["Your opinion is not shared"],
    cta: { label: "Get 10 Premium Opinions", href: "/submit?pack=human-ai-pro" },
  },
  {
    id: "extended",
    name: "EXTENDED PREMIUM",
    price: "Contact Sales",
    headline: "Need more than the standard packages?",
    description: [
      "Opinion.ai offers custom plans for businesses, studios, agencies, creators, researchers, and organizations requiring large-scale or specialized evaluations.",
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
      "Tell us what you need, how much content you have, and how frequently you need evaluations. We'll build a custom Opinion.ai plan for you.",
    cta: {
      label: "Contact Sales",
      href: "mailto:?subject=Opinion.ai%20Extended%20Premium",
    },
  },
] as const;

export const PRICING_PROMISE = {
  title: "The Opinion.ai Promise",
  lines: [
    "FREE = AI opinions. 5 every day. 8 sentences. No share switch.",
    "HUMAN + AI = 5 credits. Use them when you want. Human notes rewritten into 8 sentences. Share on or off at Submit.",
    "HUMAN + AI PRO = 10 credits. Use them when you want. Human notes rewritten into 8 sentences. Private. Your opinion is not shared.",
    "No fake humans. No simulated feedback. No telling you what you want to hear.",
    "Just an independent opinion.",
  ],
} as const;

export const PRICING_NAV_COPY = [
  "FREE — $0. 5 AI opinions every day.",
  "HUMAN + AI — $5. 5 AI + human opinions. Use when you want. Share on or off.",
  "HUMAN + AI PRO — $10. 10 AI + human opinions. Private — your opinion is not shared.",
  "EXTENDED PREMIUM — Contact Sales.",
] as const;
