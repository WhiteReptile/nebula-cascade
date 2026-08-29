"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "Documents",
  "Poetry",
  "Artwork",
  "Scripts",
  "Marketing plan",
  "Texts",
  "Contracts",
];

function nextWord(current: string) {
  const pool = WORDS.filter((w) => w !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function HeroHeadline() {
  const [word, setWord] = useState(WORDS[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWord((current) => nextWord(current));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-live="polite">
        <span key={word} className="hero-rotate-word">
          {word}
        </span>
      </span>
    </h1>
  );
}
