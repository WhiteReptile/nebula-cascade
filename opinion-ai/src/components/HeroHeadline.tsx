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

const HOLD_MS = 2600;
const EXIT_MS = 500;

function pickRandom(exclude?: string): string {
  const pool = exclude ? ROTATING_WORDS.filter((word) => word !== exclude) : [...ROTATING_WORDS];
  return pool[Math.floor(Math.random() * pool.length)] ?? ROTATING_WORDS[0];
}

export function HeroHeadline() {
  const [word, setWord] = useState<string>(ROTATING_WORDS[0]);
  const [exiting, setExiting] = useState(false);
  const wordRef = useRef(word);
  wordRef.current = word;

  useEffect(() => {
    let alive = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const later = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (alive) fn();
      }, ms);
      timers.add(id);
    };

    const cycle = () => {
      later(HOLD_MS, () => {
        setExiting(true);
        later(EXIT_MS, () => {
          const next = pickRandom(wordRef.current);
          setExiting(false);
          setWord(next);
          cycle();
        });
      });
    };

    setWord((current) => pickRandom(current));
    cycle();

    return () => {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-live="polite">
        <span key={word} className={`hero-rotate-word${exiting ? " is-exiting" : ""}`}>
          {word}
        </span>
      </span>
    </h1>
  );
}
