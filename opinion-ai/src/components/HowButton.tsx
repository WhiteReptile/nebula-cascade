"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpinionLaunchCount } from "@/components/OpinionLaunchCount";

const HOW_COPY = [
  "You send in your work. We look at what’s actually there — we don’t try to please you.",
  "First we list the facts, then we argue for it and against it, then we give a score.",
  "That score is an opinion, not a fact. Taste is subjective, so people can disagree.",
  "A real person will also look at your work, independently, and they won’t know who you are.",
];

export function HowButton({ opinionCount }: { opinionCount: number }) {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="relative z-20 px-6 pt-10 pb-3 flex items-start justify-between gap-4">
      <div className="how-wrap relative inline-block">
        <Link href="/how" className="how-btn-red inline-block text-[10px] sm:text-xs px-3 py-1.5">
          How does it work
        </Link>
        <div className="how-popout" role="tooltip">
          {HOW_COPY.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <OpinionLaunchCount count={opinionCount} />
    </div>
  );
}
