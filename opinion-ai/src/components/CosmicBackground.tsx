"use client";

import { useEffect, useState } from "react";

const STAR_COUNT = 120;

function makeStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() > 0.85 ? 2 : 1,
    delay: `${Math.random() * 5}s`,
    duration: `${2 + Math.random() * 4}s`,
    opacity: 0.2 + Math.random() * 0.6,
  }));
}

export function CosmicBackground() {
  const [stars, setStars] = useState<ReturnType<typeof makeStars>>([]);

  useEffect(() => {
    setStars(makeStars(STAR_COUNT));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020510]" aria-hidden>
      {/* Nebula clouds */}
      <div
        className="nebula-blob absolute -left-[10%] top-[15%] h-[520px] w-[520px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(34,0,102,0.55) 0%, transparent 70%)" }}
      />
      <div
        className="nebula-blob-delayed absolute -right-[5%] top-[40%] h-[480px] w-[480px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(0,51,102,0.45) 0%, transparent 70%)" }}
      />
      <div
        className="nebula-blob absolute left-[35%] -top-[8%] h-[400px] w-[400px] rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(102,0,51,0.35) 0%, transparent 70%)" }}
      />
      <div
        className="nebula-blob-delayed absolute bottom-[5%] left-[20%] h-[360px] w-[360px] rounded-full blur-[85px]"
        style={{ background: "radial-gradient(circle, rgba(136,102,204,0.3) 0%, transparent 70%)" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,5,16,0.4)_60%,rgba(2,5,16,0.85)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020510] via-transparent to-[#020510]/60" />

      {/* Stars */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `starTwinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
