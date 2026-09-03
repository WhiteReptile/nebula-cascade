"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BackArrow({
  fallback = "/",
  hideOnHome = true,
  href,
}: {
  fallback?: string;
  hideOnHome?: boolean;
  href?: string;
}) {
  const pathname = usePathname();
  if (hideOnHome && pathname === "/" && !href) return null;

  return (
    <Link
      href={href ?? fallback}
      className="nav-white inline-flex items-center gap-2 text-sm"
      aria-label="Go back"
    >
      <span aria-hidden>←</span>
      Back
    </Link>
  );
}
