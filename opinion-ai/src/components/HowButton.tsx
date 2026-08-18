"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HowButton() {
  const pathname = usePathname();
  if (pathname === "/how") return null;

  return (
    <div className="relative z-10 px-6 pt-8 pb-2">
      <Link href="/how" className="how-btn-red inline-block text-[10px] sm:text-xs px-3 py-1.5">
        How does it work
      </Link>
    </div>
  );
}
