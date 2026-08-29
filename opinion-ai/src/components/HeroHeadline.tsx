"use client";

import { useCallback, useMemo, useState } from "react";

const ROTATING_WORDS = [
  "Documents",
  "Poetry",
  "Artwork",
  "Scripts",
  "Marketing plan",
  "Texts",
  "Contracts",
] as const;

const WORD_HOLD_S = 2.4;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random order; when continuing a loop, keep the visible word first so the track does not jump. */
function shuffleWords(mustStart?: string): string[] {
  if (!mustStart) return shuffle([...ROTATING_WORDS]);

  const rest = shuffle(ROTATING_WORDS.filter((word) => word !== mustStart));
  return [mustStart, ...rest];
}

function buildKeyframes(count: number): string {
  const step = 100 / count;
  const hold = step * 0.82;
  const lines: string[] = ["@keyframes heroWordShuffle {"];

  for (let i = 0; i < count; i++) {
    const start = step * i;
    const end = Math.min(start + hold, 100);
    const offset = (i * 100) / count;
    lines.push(`  ${start.toFixed(2)}%, ${end.toFixed(2)}% { transform: translateY(-${offset.toFixed(4)}%); }`);
  }

  lines.push("  100% { transform: translateY(0); }");
  lines.push("}");
  return lines.join("\n");
}

export function HeroHeadline() {
  const [sequence, setSequence] = useState<string[]>(() => shuffleWords());
  const [cycle, setCycle] = useState(0);

  const loop = useMemo(() => [...sequence, sequence[0]], [sequence]);
  const count = loop.length;
  const duration = count * WORD_HOLD_S;
  const keyframes = useMemo(() => buildKeyframes(count), [count]);

  const onCycleEnd = useCallback(() => {
    setSequence((prev) => shuffleWords(prev[0]));
    setCycle((n) => n + 1);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <h1 className="hero-headline cosmic-title text-2xl sm:text-[1.85rem] lg:text-3xl font-light mb-4 w-full mx-auto leading-snug px-1">
        An AI Engine designed to give unbiased, real opinions of your{" "}
        <span className="hero-rotate-slot" aria-live="polite">
          <span
            key={cycle}
            className="hero-rotate-track"
            style={{ animationDuration: `${duration}s` }}
            onAnimationIteration={onCycleEnd}
          >
            {loop.map((word, index) => (
              <span key={`${cycle}-${index}-${word}`} className="hero-rotate-item">
                {word}
              </span>
            ))}
          </span>
        </span>
      </h1>
    </>
  );
}
