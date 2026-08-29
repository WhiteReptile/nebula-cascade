"use client";

import { useEffect, useState } from "react";

const ROTATING_WORDS = ["Documents", "Poetry", "Artwork", "Scripts"] as const;
const WORD_MS = 2600;
const FADE_MS = 420;

export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = setInterval(() => {
      setVisible(false);
      fadeTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, FADE_MS);
    }, WORD_MS);

    return () => {
      clearInterval(cycle);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-live="polite">
        <span className={`hero-rotate-word${visible ? " is-visible" : ""}`}>{ROTATING_WORDS[index]}</span>
      </span>
    </h1>
  );
}
