/** Compact hover blurb on the home “How does it work” control. */
export const HOW_HOVER_LINES = [
  "YourTruths is an AI evaluation engine built to generate independent, structured opinions on ideas, content, and creative work.",
  "It analyzes what you submit, identifies strengths, weaknesses, inconsistencies, and potential issues, and converts them into a clear 0–100 evaluation with a focused verdict.",
  "For music, video, and selected visual work, YourTruths can incorporate anonymous human reactions as an additional data signal. Real people provide their immediate perspective, and the AI processes those reactions into a consistent, structured evaluation.",
  "The result is not generic praise or simulated feedback.",
  "It is an independent opinion generated through AI analysis and, where applicable, real human perspective.",
  "YourTruths: An AI engine for objective, independent evaluation.",
] as const;

export type HowPart = string | { key: string };

export type HowBlock =
  | { type: "p"; parts: readonly HowPart[] }
  | { type: "tagline"; parts: readonly HowPart[] };

/** Full /how page copy — key phrases marked for highlight. */
export const HOW_PAGE = {
  blocks: [
    {
      type: "p",
      parts: [
        "YourTruths is an ",
        {
          key: "AI system designed to generate objective, independent opinions about creative work, ideas, and decisions",
        },
        ".",
      ],
    },
    {
      type: "p",
      parts: [
        "Instead of simply telling you what sounds good, YourTruths analyzes what you submit and produces a structured evaluation based on defined criteria, identifying strengths, weaknesses, potential issues, and the overall impression of the work.",
      ],
    },
    {
      type: "p",
      parts: [
        "The goal is simple: ",
        { key: "reduce bias, remove yes-men, and give you an independent perspective." },
      ],
    },
    {
      type: "p",
      parts: [
        "YourTruths can evaluate ",
        { key: "ideas, business concepts, writing, artwork, images, music, video, and more" },
        ".",
      ],
    },
    {
      type: "p",
      parts: [
        "For music and video, YourTruths can also incorporate ",
        { key: "real human perspectives" },
        ". Independent reviewers experience the work and provide their immediate, genuine reactions. Their feedback remains anonymous and is then processed by the YourTruths AI system.",
      ],
    },
    {
      type: "p",
      parts: [
        "The AI transforms these raw perspectives into a consistent, structured evaluation, separating personal reaction from broader analysis while preserving what the reviewer actually experienced.",
      ],
    },
    {
      type: "p",
      parts: [
        "YourTruths is not designed to tell you what you want to hear. It is designed to tell you what the work communicates.",
      ],
    },
    {
      type: "tagline",
      parts: [
        { key: "Real human perspective." },
        " ",
        { key: "Advanced AI evaluation." },
        " ",
        { key: "One focused opinion." },
      ],
    },
  ] as const satisfies readonly HowBlock[],
};
