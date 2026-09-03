import type { CategoryFramework, CategoryId } from "./types";

export const LAUNCH_CATEGORIES: CategoryFramework[] = [
  {
    id: "text",
    label: "Text",
    blurb: "Writing, copy, essays, scripts, and PDFs. Paste text or upload a PDF — we judge clarity, voice, and whether it holds together.",
    placeholder: "Paste your writing, or upload a PDF below…",
    contextHint: "Who is this for? What’s the goal? Draft or final?",
    scoreContext: "for written work",
    dimensions: [
      { name: "Clarity", weight: 25 },
      { name: "Voice", weight: 20 },
      { name: "Structure", weight: 20 },
      { name: "Originality", weight: 20 },
      { name: "Impact", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this text. Note structure, claims, tone, audience signals, and gaps. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this writing. Be accurate, not mean. Framework: Clarity 25%, Voice 20%, Structure 20%, Originality 20%, Impact 15%. Taste is subjective — say so when it is.`,
    acceptsFile: true,
    fileAccept: ".pdf,application/pdf",
  },
  {
    id: "homework",
    label: "Homework",
    blurb: "School work. We check if you answered the prompt, if the thinking is clear, and if it would pass — not if a teacher would like you.",
    placeholder: "Paste the assignment answer or essay…",
    contextHint: "Paste the teacher’s prompt, the class, grade level, and any rubric.",
    scoreContext: "for school assignments",
    dimensions: [
      { name: "Prompt fit", weight: 30 },
      { name: "Reasoning", weight: 25 },
      { name: "Evidence", weight: 20 },
      { name: "Clarity", weight: 15 },
      { name: "Completeness", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations about this homework. Note whether the prompt is addressed, evidence used, structure, and missing parts. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this homework against the prompt and rubric in the context. Framework: Prompt fit 30%, Reasoning 25%, Evidence 20%, Clarity 15%, Completeness 10%. It is still an opinion.`,
  },
  {
    id: "images",
    label: "Images",
    blurb: "Posters, ads, artwork, and photos — work meant to be seen. A person looks at the image and judges composition, clarity, and impact.",
    placeholder: "What should we look at in this image?",
    contextHint: "What is this for? Who is the audience? What should we focus on?",
    scoreContext: "for visual work",
    acceptsFile: true,
    fileAccept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
    dimensions: [
      { name: "Composition", weight: 25 },
      { name: "Clarity", weight: 25 },
      { name: "Impact", weight: 20 },
      { name: "Originality", weight: 15 },
      { name: "Polish", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this image submission from the file or notes. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this visual work. Framework: Composition 25%, Clarity 25%, Impact 20%, Originality 15%, Polish 15%. Taste is subjective — say so when it is.`,
  },
  {
    id: "documents",
    label: "Documents",
    blurb: "Legacy category — use Text for PDFs and Images for visual work.",
    placeholder: "Paste the document text, or describe what’s in the file…",
    contextHint: "What’s this document for? Who reads it? What decision should it drive?",
    scoreContext: "for professional documents",
    acceptsFile: true,
    fileAccept: ".pdf,.doc,.docx",
    dimensions: [
      { name: "Structure", weight: 25 },
      { name: "Clarity", weight: 25 },
      { name: "Evidence", weight: 20 },
      { name: "Usefulness", weight: 20 },
      { name: "Polish", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations about this document. Note sections, claims, evidence, audience, and missing pieces. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this document for a working reader. Framework: Structure 25%, Clarity 25%, Evidence 20%, Usefulness 20%, Polish 10%.`,
  },
  {
    id: "audio",
    label: "Audio",
    blurb: "Podcasts, voice notes, spoken pieces. We judge content and delivery from what you share — a file, a link, or a description.",
    placeholder: "Paste a link, transcript, or describe the audio…",
    contextHint: "What’s the show or purpose? Who’s the listener? What should we focus on — ideas or delivery?",
    scoreContext: "for spoken audio",
    acceptsFile: true,
    fileAccept: "audio/*",
    dimensions: [
      { name: "Content", weight: 25 },
      { name: "Clarity", weight: 20 },
      { name: "Pacing", weight: 20 },
      { name: "Delivery", weight: 20 },
      { name: "Hook", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this audio submission from the transcript, link, or description. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this audio work. Note that without hearing it, confidence is lower. Framework: Content 25%, Clarity 20%, Pacing 20%, Delivery 20%, Hook 15%. Subjective.`,
  },
  {
    id: "music",
    label: "Music",
    blurb: "Songs and tracks. Taste is personal. We still judge craft: hook, structure, lyrics, production — and say when it’s just taste.",
    placeholder: "Paste lyrics, a link, or describe the song…",
    contextHint: "Genre? References? Demo or finished mix? What do you want judged — songwriting or production?",
    scoreContext: "for a song or track",
    acceptsFile: true,
    fileAccept: "audio/*,.mp3,.wav,.m4a,.flac",
    dimensions: [
      { name: "Hook", weight: 20 },
      { name: "Songwriting", weight: 20 },
      { name: "Structure", weight: 15 },
      { name: "Production", weight: 20 },
      { name: "Originality", weight: 15 },
      { name: "Emotional impact", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations about this music from lyrics, description, or notes. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this music. Be usefully honest. Separate craft from taste. Framework: Hook 20%, Songwriting 20%, Structure 15%, Production 20%, Originality 15%, Emotional impact 10%.`,
  },
  {
    id: "video",
    label: "Video",
    blurb: "Film, clips, shorts.",
    placeholder: "Paste a link or describe the video…",
    contextHint: "",
    scoreContext: "for video",
    acceptsFile: true,
    fileAccept: "video/*",
    dimensions: [
      { name: "Story", weight: 20 },
      { name: "Visual execution", weight: 20 },
      { name: "Pacing", weight: 15 },
      { name: "Sound", weight: 15 },
      { name: "Originality", weight: 15 },
      { name: "Emotional impact", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this video from the description, link, or notes. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this video. Separate craft from taste. Story 20%, Visual 20%, Pacing 15%, Sound 15%, Originality 15%, Emotional impact 15%.`,
  },
  {
    id: "physical_appearance",
    label: "Physical appearance",
    blurb: "Hair, face, a procedure. A person looks at the photo or video, then we give a subjective opinion.",
    placeholder: "Hair loss, a procedure, what you want judged…",
    contextHint: "What should we look at? Hair, a surgery, before and after?",
    scoreContext: "for physical appearance",
    acceptsFile: true,
    fileAccept: "image/*,video/*",
    dimensions: [
      { name: "What’s visible", weight: 25 },
      { name: "Severity", weight: 25 },
      { name: "Evenness", weight: 15 },
      { name: "Natural result", weight: 20 },
      { name: "Overall impression", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this physical appearance submission from the photo, video, or notes. Do not judge — only observe.`,
    opinionPrompt: `Give a subjective, useful opinion of this physical appearance. Hair loss, residual baldness, and plastic surgery are in scope. Be honest. Taste is subjective — say so when it is.`,
  },
  {
    id: "business_idea",
    label: "Business",
    blurb: "Startup or product ideas. Market, money, and whether it’s actually different.",
    placeholder: "Describe the business idea…",
    contextHint: "Stage, customer, and what you want pressure-tested.",
    scoreContext: "for early-stage startup viability",
    dimensions: [
      { name: "Market", weight: 20 },
      { name: "Differentiation", weight: 20 },
      { name: "Economics", weight: 20 },
      { name: "Competition", weight: 15 },
      { name: "Execution difficulty", weight: 10 },
      { name: "Growth potential", weight: 15 },
    ],
    analystPrompt: `Extract neutral observations about this business idea. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this business idea. Market 20%, Differentiation 20%, Economics 20%, Competition 15%, Execution 10%, Growth 15%.`,
  },
  {
    id: "landing_page",
    label: "Landing page",
    blurb: "Page copy and layout notes. Would a stranger understand and act?",
    placeholder: "Paste the landing page copy…",
    contextHint: "Product, audience, and what the page is supposed to sell.",
    scoreContext: "for conversion-focused landing pages",
    dimensions: [
      { name: "Value proposition clarity", weight: 25 },
      { name: "Copy quality", weight: 20 },
      { name: "Visual hierarchy", weight: 15 },
      { name: "Trust signals", weight: 15 },
      { name: "CTA effectiveness", weight: 15 },
      { name: "Differentiation", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations about this landing page copy. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this landing page for conversion. Value 25%, Copy 20%, Hierarchy 15%, Trust 15%, CTA 15%, Differentiation 10%.`,
  },
  {
    id: "pitch_pdf",
    label: "Pitch",
    blurb: "Investor or client pitches. Would a skeptical reader keep going?",
    placeholder: "Paste the pitch or deck text…",
    contextHint: "Seed? Client pitch? What ask are you making?",
    scoreContext: "for pitch readiness",
    acceptsFile: true,
    fileAccept: ".pdf,.ppt,.pptx",
    dimensions: [
      { name: "Problem clarity", weight: 20 },
      { name: "Solution fit", weight: 15 },
      { name: "Market opportunity", weight: 20 },
      { name: "Traction evidence", weight: 15 },
      { name: "Team credibility", weight: 10 },
      { name: "Ask & use of funds", weight: 10 },
      { name: "Competitive moat", weight: 10 },
    ],
    analystPrompt: `Extract neutral observations from this pitch. Do not judge — only observe.`,
    opinionPrompt: `Evaluate this pitch. Problem 20%, Solution 15%, Market 20%, Traction 15%, Team 10%, Ask 10%, Moat 10%.`,
  },
];

export function getCategory(id: CategoryId): CategoryFramework {
  const cat = LAUNCH_CATEGORIES.find((c) => c.id === id);
  if (!cat) throw new Error(`Unknown category: ${id}`);
  return cat;
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && LAUNCH_CATEGORIES.some((c) => c.id === value);
}

export function classifyCategory(content: string): CategoryId {
  const lower = content.toLowerCase();
  const score = (signals: string[]) =>
    signals.reduce((n, s) => (lower.includes(s) ? n + 1 : n), 0);
  if (score(["homework", "rubric", "assignment", "teacher"]) > 0) return "homework";
  if (score(["lyrics", "chorus", "verse", "bpm", "track"]) > 0) return "music";
  if (score(["podcast", "episode", "voiceover", "transcript"]) > 0) return "audio";
  if (score(["pitch deck", "seed round", "investor", "traction"]) > 0) return "pitch_pdf";
  if (score(["landing page", "sign up", "headline", "cta"]) > 0) return "landing_page";
  if (score(["startup", "market size", "tam", "revenue"]) > 0) return "business_idea";
  if (score(["memo", "report", "pdf", "document"]) > 0) return "text";
  if (score(["poster", "artwork", "photo", "image", "ad", "stills"]) > 0) return "images";
  return "text";
}
