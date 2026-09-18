export const PRICING_PACKAGES = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    cardTone: "yellow",
    headline: "5 AI opinions every day",
    description: [
      "Instant AI opinions on text, PDFs, images, artwork, physical appearance, ideas, and other short-form work.",
      "No human reviewer. No credits. Music and video are not included.",
    ],
    features: [
      "5 AI opinions every day",
      "Text, PDFs, images, and physical appearance",
      "YourTruths scoring system",
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
    headline: "5 music & video human opinions",
    description: [
      "Premium is for music and video only — work that needs a real listener or viewer.",
      "A person listens or watches, then we rewrite their notes into an 8-sentence review.",
      "Use the 5 credits when you want. Everything else on Submit stays free AI.",
    ],
    features: [
      "5 music & video human opinions",
      "Real human listener / viewer",
      "8-sentence review (human notes, AI rewritten)",
      "Anonymous reviewers",
      "Share on or off at Submit",
      "YourTruths score + ranking",
    ],
    cta: { label: "Get 5 Music & Video Reviews", href: "/submit?pack=human-ai" },
  },
  {
    id: "human-ai-pro",
    name: "HUMAN + AI PRO",
    price: "$10",
    cardTone: "red",
    headline: "10 music & video reviews · priority",
    description: [
      "More music and video evaluations, with priority in the queue and our best reviewers.",
      "Includes longer clips (over 2 minutes) and the same human + AI rewrite format.",
      "Use the 10 credits when you want. Text, images, and appearance stay free.",
    ],
    features: [
      "10 music & video human opinions",
      "Priority processing",
      "Our best reviewers",
      "Longer music and video supported",
      "8-sentence review (human notes, AI rewritten)",
      "YourTruths score + ranking",
    ],
    privateLabel: "Private use",
    privateFeatures: ["Your opinion is not shared"],
    cta: { label: "Get Priority Reviews", href: "/submit?pack=human-ai-pro" },
  },
  {
    id: "extended",
    name: "EXTENDED PREMIUM",
    price: "Contact Sales",
    headline: "Need more than the standard packages?",
    description: [
      "Custom plans for studios, labels, agencies, and teams that need volume music and video review — or specialized criteria.",
    ],
    featuresLabel: "Plans can include:",
    features: [
      "High-volume music and video reviews",
      "Dedicated senior reviewers",
      "Priority / SLA processing",
      "Multiple independent human reviewers",
      "Custom evaluation criteria",
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
    "FREE = AI opinions on text, PDFs, images, and physical appearance. 5 every day.",
    "HUMAN + AI = music and video only. 5 credits. A real person listens or watches.",
    "HUMAN + AI PRO = 10 music/video credits, priority queue, and our best reviewers. Private.",
    "No fake humans. No simulated feedback. No telling you what you want to hear.",
    "Just an independent opinion.",
  ],
} as const;

export const PRICING_NAV_COPY = [
  "FREE — $0. 5 AI opinions/day on text, images, PDFs, and appearance.",
  "HUMAN + AI — $5. 5 music & video human reviews.",
  "HUMAN + AI PRO — $10. 10 music & video reviews. Priority + best reviewers. Private.",
  "EXTENDED PREMIUM — Contact Sales.",
] as const;
