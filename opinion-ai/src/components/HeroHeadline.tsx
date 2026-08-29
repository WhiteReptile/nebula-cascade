"use client";

const ROTATING_WORDS = ["Documents", "Poetry", "Artwork", "Scripts"] as const;

export function HeroHeadline() {
  const loop = [...ROTATING_WORDS, ROTATING_WORDS[0]];

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-label={ROTATING_WORDS.join(", ")}>
        <span className="hero-rotate-track" aria-hidden>
          {loop.map((word, i) => (
            <span key={`${word}-${i}`} className="hero-rotate-item">
              {word}
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
