"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpinionLaunchCount } from "@/components/OpinionLaunchCount";
import { HOW_HOVER_LINES } from "@/lib/how-copy";

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
          {HOW_HOVER_LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <OpinionLaunchCount count={opinionCount} />
    </div>
  );
}
