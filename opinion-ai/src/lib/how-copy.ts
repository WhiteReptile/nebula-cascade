/** Compact hover blurb on the home “How does it work” control. */
export const HOW_HOVER_LINES = [
  "Honest, focused feedback on your work — ideas, writing, art, music, video, and more.",
  "Music, video, and images use a human + AI hybrid. Real people give a raw take in 3–4 sentences. Anonymous.",
  "YourTruths AI turns that into a clear structured evaluation — same judgment, sharper form.",
  "Real human perspective. Advanced AI evaluation. One focused opinion.",
] as const;

export type HowPart = string | { key: string };

export type HowBlock =
  | { type: "p"; parts: readonly HowPart[] }
  | { type: "tagline"; parts: readonly HowPart[] };

/** Full /how page copy — key phrases marked for highlight. */
export const HOW_PAGE = {
  title: "How YourTruths Works",
  blocks: [
    {
      type: "p",
      parts: [
        "YourTruths is designed to provide ",
        { key: "honest, focused feedback on your work" },
        " — whether it’s an idea, business plan, writing, artwork, music, video, or something else.",
      ],
    },
    {
      type: "p",
      parts: [
        "For ",
        { key: "music, video, and images" },
        ", YourTruths uses a ",
        { key: "human-AI hybrid evaluation system" },
        ". Real people independently listen to or watch your work and give their immediate, genuine opinion based on what they experienced.",
      ],
    },
    {
      type: "p",
      parts: [
        "They don’t write a long review or spend time trying to sound professional. They simply tell us what they thought — usually in ",
        { key: "3–4 sentences" },
        ".",
      ],
    },
    {
      type: "p",
      parts: ["Their identity remains anonymous."],
    },
    {
      type: "p",
      parts: [
        "YourTruths AI then processes that raw human perspective and turns it into a ",
        { key: "clear, structured evaluation" },
        ", preserving the reviewer’s actual opinion while providing additional analysis and context.",
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
