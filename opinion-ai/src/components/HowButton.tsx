"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HowButton() {
  const pathname = usePathname();
  if (pathname === "/how") return null;

  return (
    <Link href="/how" className="how-btn-red text-[10px] sm:text-xs px-3 py-1.5">
      How does it work
    </Link>
  );
}
