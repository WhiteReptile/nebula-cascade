"use client";

import { useEffect, useState } from "react";

export function OpinionLaunchCount() {
  const [count, setCount] = useState(110);
  const [shown, setShown] = useState(110);

  useEffect(() => {
    let stop = false;
    let frame = 0;

    fetch("/api/opinions")
      .then((res) => res.json())
      .then((data: { count?: number }) => {
        if (stop || typeof data.count !== "number" || !Number.isFinite(data.count)) return;
        const next = Math.max(0, Math.round(data.count));
        setCount(next);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
          setShown(next);
          return;
        }
        frame = requestAnimationFrame(() => {
          if (!stop) setShown(next);
        });
      })
      .catch(() => {
        /* keep the seed */
      });

    return () => {
      stop = true;
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const width = Math.max(3, String(Math.max(count, 110)).length);
  const digits = String(shown).padStart(width, "0").split("").map(Number);

  return (
    <div className="text-right" aria-label={`${count} opinions given`}>
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
      <p className="label-white text-[10px] mt-2">Opinions given</p>
    </div>
  );
}
