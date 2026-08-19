"use client";

import { useEffect, useState } from "react";

export function OpinionLaunchCount({ count }: { count: number }) {
  const [shown, setShown] = useState(Math.min(110, count));

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(count);
      return;
    }
    const frame = requestAnimationFrame(() => setShown(count));
    return () => cancelAnimationFrame(frame);
  }, [count]);

  const width = Math.max(3, String(Math.max(count, 110)).length);
  const digits = String(shown).padStart(width, "0").split("").map(Number);

  return (
    <div className="mt-8 mb-2" aria-label={`${count} opinions given`}>
      <div className="launch-board">
        {digits.map((digit, index) => (
          <span key={`${width}-${index}`} className="launch-digit" aria-hidden>
            <span className="launch-digit-strip" style={{ transform: `translateY(-${digit * 10}%)` }}>
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </div>
      <p className="label-white text-[10px] mt-3">Opinions given</p>
    </div>
  );
}
