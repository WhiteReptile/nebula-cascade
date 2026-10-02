"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOOTER_LINKS } from "@/lib/legal";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="site-footer relative z-10 mt-auto">
      <div className="site-footer-inner">
        <p className="site-footer-copy">© 2026 YourTruths. All rights reserved.</p>
        <nav className="site-footer-nav" aria-label="Legal">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="site-footer-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
