"use client";

import { useEffect, useRef, useState } from "react";

const ROTATING_WORDS = [
  "Documents",
  "Poetry",
  "Artwork",
  "Scripts",
  "Marketing plan",
  "Texts",
  "Contracts",
] as const;

const HOLD_MS = 2400;
const ANIM_MS = 450;

function pickNextWord(current: string): string {
  const pool = ROTATING_WORDS.filter((word) => word !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function HeroHeadline() {
  const [displayWord, setDisplayWord] = useState<string>(ROTATING_WORDS[0]);
  const [leaving, setLeaving] = useState(false);
  const wordRef = useRef(displayWord);

  wordRef.current = displayWord;

  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = setInterval(() => {
      setLeaving(true);
      swapTimer = setTimeout(() => {
        setDisplayWord(pickNextWord(wordRef.current));
        setLeaving(false);
      }, ANIM_MS);
    }, HOLD_MS + ANIM_MS);

    return () => {
      clearInterval(cycle);
      if (swapTimer) clearTimeout(swapTimer);
    };
  }, []);

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-live="polite">
        <span key={displayWord} className={`hero-rotate-word${leaving ? " is-leaving" : ""}`}>
          {displayWord}
        </span>
      </span>
    </h1>
  );
}
