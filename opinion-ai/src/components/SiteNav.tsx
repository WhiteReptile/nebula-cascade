"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRICING_NAV_COPY } from "@/lib/pricing";

const ITEMS = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/submit", label: "Submit", match: (path: string) => path.startsWith("/submit") },
  { href: "/history", label: "History", match: (path: string) => path.startsWith("/history") },
  {
    href: "/pricing",
    label: "Pricing",
    match: (path: string) => path.startsWith("/pricing"),
    hover: true,
  },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Main">
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        const link = (
          <Link
            href={item.href}
            className={`site-nav-link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );

        if ("hover" in item && item.hover && !active) {
          return (
            <div key={item.href} className="how-wrap relative">
              {link}
              <div className="how-popout how-popout-end" role="tooltip">
                {PRICING_NAV_COPY.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          );
        }

        return (
          <span key={item.href} className="site-nav-item">
            {link}
          </span>
        );
      })}
    </nav>
  );
}
