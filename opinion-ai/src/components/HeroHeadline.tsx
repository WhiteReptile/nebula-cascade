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
const SLIDE_MS = 500;

function pickRandom(exclude: string): string {
  const pool = ROTATING_WORDS.filter((word) => word !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? ROTATING_WORDS[0];
}

export function HeroHeadline() {
  const trackRef = useRef<HTMLSpanElement>(null);
  const pairRef = useRef<[string, string]>([ROTATING_WORDS[0], pickRandom(ROTATING_WORDS[0])]);
  const [pair, setPair] = useState<[string, string]>(pairRef.current);

  useEffect(() => {
    let alive = true;
    const timers = new Set<number>();

    const later = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const slide = async () => {
      while (alive) {
        await later(HOLD_MS);
        if (!alive) break;

        const track = trackRef.current;
        if (!track) continue;

        const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!motion) {
          try {
            await track.animate(
              [{ transform: "translateY(0)" }, { transform: "translateY(-50%)" }],
              { duration: SLIDE_MS, easing: "ease", fill: "forwards" },
            ).finished;
          } catch {
            /* cancelled */
          }
        }

        if (!alive) break;

        const [, next] = pairRef.current;
        const updated: [string, string] = [next, pickRandom(next)];
        pairRef.current = updated;
        setPair(updated);

        track.style.transform = "translateY(0)";
        track.getAnimations().forEach((anim) => anim.cancel());

        await later(0);
      }
    };

    void slide();

    return () => {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
      trackRef.current?.getAnimations().forEach((anim) => anim.cancel());
    };
  }, []);

  return (
    <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
      An AI Engine designed to give unbiased, real opinions of your{" "}
      <span className="hero-rotate-slot" aria-live="polite">
        <span ref={trackRef} className="hero-rotate-track">
          <span className="hero-rotate-item">{pair[0]}</span>
          <span className="hero-rotate-item">{pair[1]}</span>
        </span>
      </span>
    </h1>
  );
}
