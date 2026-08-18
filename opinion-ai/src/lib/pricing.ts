export const PRICING_PACKAGES = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    headline: "5 AI opinions every day",
    description: [
      "Get straightforward, objective opinions on text, images, artwork, ideas, social posts, and other short-form content.",
    ],
    features: [
      "5 evaluations every day",
      "Opinion.ai scoring system",
      "Strengths and weaknesses",
      "Clear final verdict",
      "6 sentences or less",
      "No credits required",
    ],
    cta: { label: "Start free", href: "/submit" },
  },
  {
    id: "human-ai",
    name: "HUMAN + AI",
    price: "$5",
    headline: "5 Premium Opinions",
    description: [
      "For music, video, documents, artwork, and other supported creative work.",
      "Every submission goes through two filters: our premium AI opinion system and a real, trained human reviewer.",
      "Your human reviewer actually watches, listens to, or reads your work and gives their genuine opinion. Our AI then organizes and compacts the evaluation into a clear final response.",
    ],
    features: [
      "5 AI + human evaluations",
      "Human review included",
      "Anonymous reviewers",
      "Objective evaluation",
      "Opinion.ai score + ranking",
      "6 sentences or less",
    ],
    cta: { label: "Get 5 Premium Opinions", href: "/submit" },
  },
  {
    id: "human-ai-pro",
    name: "HUMAN + AI PRO",
    price: "$10",
    headline: "10 Premium Opinions",
    description: [
      "For users who need more evaluations or are working with larger and longer creative projects, including music and video over 2 minutes.",
    ],
    features: [
      "10 AI + human evaluations",
      "Real human reviewers",
      "Premium AI evaluation",
      "Longer submissions supported",
      "Anonymous human feedback",
      "Opinion.ai score + ranking",
      "6 sentences or less",
    ],
    cta: { label: "Get 10 Premium Opinions", href: "/submit" },
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
    "FREE = AI opinions.",
    "PREMIUM = AI + real human opinions.",
    "No fake humans. No simulated feedback. No telling you what you want to hear.",
    "Just an independent opinion.",
  ],
} as const;

export const PRICING_NAV_COPY = [
  "FREE — $0. 5 AI opinions every day.",
  "HUMAN + AI — $5. 5 Premium Opinions.",
  "HUMAN + AI PRO — $10. 10 Premium Opinions.",
  "EXTENDED PREMIUM — Contact Sales.",
] as const;
