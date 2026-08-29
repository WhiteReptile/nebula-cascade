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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout>;

    const timer = setInterval(() => {
      setVisible(false);
      swapTimer = setTimeout(() => {
        setWord((current) => nextWord(current));
        setVisible(true);
      }, 450);
    }, 2800);

    return () => {
      clearInterval(timer);
      clearTimeout(swapTimer);
    };
  }, []);

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-live="polite">
        <span className={`hero-rotate-word${visible ? " is-visible" : ""}`}>{word}</span>
      </span>
    </h1>
  );
}
