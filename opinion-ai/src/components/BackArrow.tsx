"use client";

import { usePathname, useRouter } from "next/navigation";

export function BackArrow({
  fallback = "/",
  hideOnHome = true,
  onClick,
}: {
  fallback?: string;
  hideOnHome?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  if (hideOnHome && pathname === "/" && !onClick) return null;

  function go() {
    if (onClick) {
      onClick();
      return;
    }
    const ref = document.referrer;
    try {
      if (ref) {
        const url = new URL(ref);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          router.back();
          return;
        }
      }
    } catch {
      /* fall through */
    }
    router.push(fallback);
  }

  return (
    <button type="button" onClick={go} className="nav-white inline-flex items-center gap-2 text-sm" aria-label="Go back">
      <span aria-hidden>←</span>
      Back
    </button>
  );
}
