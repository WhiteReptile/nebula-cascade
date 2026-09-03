export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Project = {
  id: string;
  title: string;
  eyebrow: string;
  pitch: string;
  role: string;
  stack: string[];
  highlights: string[];
  image: string;
  imageAlt: string;
  liveHref?: string;
  liveExternal?: boolean;
  caseHref: string;
  status: "live" | "preview" | "gated";
};

export const studio = {
  name: "Nebula Cascade",
  founder: "Enrique Catalan",
  tagline: "Product, UI/UX, and full-stack builds — solo and in pair with AI.",
  email: "enrique.catalan.hoeflich@gmail.com",
  domain: "https://nebula-cascade.com",
  yourtruthsUrl: "https://yourtruths.nebula-cascade.com",
};

export const PROJECTS: Project[] = [
  {
    id: "yourtruths",
    title: "YourTruths",
    eyebrow: "AI product",
    pitch:
      "Honest AI opinions on writing and PDFs — plus human + AI review for music, video, and images. No yes-men.",
    role: "Product design, UI/UX, full-stack (Next.js)",
    stack: ["Next.js 16", "React 19", "Tailwind", "Groq LLM", "PDF extract"],
    highlights: [
      "Instant AI for text and PDF uploads",
      "Human review queue for music, video, and images",
      "Cosmic dark UI with SSR-safe submit flows",
      "Built with vibe coding + AI pair programming",
    ],
    image: "/poster.png",
    imageAlt: "YourTruths cosmic product surface",
    liveHref: "https://yourtruths.nebula-cascade.com",
    liveExternal: true,
    caseHref: "/work/yourtruths",
    status: "preview",
  },
  {
    id: "nebula-film",
    title: "Nebula Cascade — Film",
    eyebrow: "Film landing",
    pitch:
      "Cinematic promo site for the Nebula Cascade film — full-bleed poster, trailer, synopsis, and credits.",
    role: "Direction, design, front-end",
    stack: ["React", "Vite", "Tailwind", "YouTube embed"],
    highlights: [
      "Edge-to-edge poster hero",
      "Trailer, synopsis, and credits sections",
      "Private game gate for playtesters",
    ],
    image: "/poster.png",
    imageAlt: "Nebula Cascade film poster",
    liveHref: "/film",
    caseHref: "/work/nebula-cascade",
    status: "live",
  },
  {
    id: "nebula-game",
    title: "Nebula Cascade — Game",
    eyebrow: "Puzzle game",
    pitch:
      "Phaser puzzle game with marketplace, leaderboard, and NFT identity — gated behind a private passphrase.",
    role: "Game design, UI systems, web3 surfaces",
    stack: ["Phaser 3", "React", "Supabase", "Base / Thirdweb"],
    highlights: [
      "Session-gated playtest access",
      "Marketplace and rewards flows",
      "Cosmic cyber-retro visual language",
    ],
    image: "/poster.png",
    imageAlt: "Nebula Cascade game world",
    liveHref: "/film",
    caseHref: "/work/nebula-cascade",
    status: "gated",
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
