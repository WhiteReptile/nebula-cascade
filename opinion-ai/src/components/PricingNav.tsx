"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRICING_NAV_COPY } from "@/lib/pricing";

export function PricingNav() {
  const pathname = usePathname();

  return (
    <div className="how-wrap relative inline-block">
      <Link href="/pricing" className="nav-white">
        Pricing
      </Link>
      {pathname !== "/pricing" && (
        <div className="how-popout how-popout-end" role="tooltip">
          {PRICING_NAV_COPY.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
