"use client";

import { useEffect, useRef, useState } from "react";

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
  const [current, setCurrent] = useState(WORDS[0]);
  const [next, setNext] = useState(() => nextWord(WORDS[0]));
  const [raised, setRaised] = useState(false);
  const [snap, setSnap] = useState(false);
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    let swapTimer: ReturnType<typeof setTimeout>;

    const timer = setInterval(() => {
      setRaised(true);
      swapTimer = setTimeout(() => {
        const landed = nextRef.current;
        setSnap(true);
        setCurrent(landed);
        setNext(nextWord(landed));
        setRaised(false);
        requestAnimationFrame(() => setSnap(false));
      }, 500);
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
        <span className={`hero-rotate-track${raised ? " is-raised" : ""}${snap ? " is-snap" : ""}`}>
          <span className="hero-rotate-item">{current}</span>
          <span className="hero-rotate-item">{next}</span>
        </span>
      </span>
    </h1>
  );
}
