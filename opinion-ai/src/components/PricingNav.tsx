"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRICING_SECTIONS } from "@/lib/pricing";

export function PricingNav() {
  const pathname = usePathname();

  return (
    <div className="how-wrap relative inline-block">
      <Link href="/pricing" className="nav-white">
        Pricing
      </Link>
      {pathname !== "/pricing" && (
        <div className="how-popout how-popout-end" role="tooltip">
          {PRICING_SECTIONS.map((section) => (
            <p key={section.n}>{section.body}</p>
          ))}
        </div>
      )}
    </div>
  );
}
