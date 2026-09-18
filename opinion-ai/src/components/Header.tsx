"use client";

import Link from "next/link";
import { BackArrow } from "@/components/BackArrow";
import { BrandMark } from "@/components/BrandMark";
import { PricingNav } from "@/components/PricingNav";

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-5 border-b border-white/15">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <BackArrow />
        <Link href="/" className="inline-flex items-center shrink-0">
          <BrandMark size="nav" />
        </Link>
      </div>
      <nav className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm shrink-0">
        <Link href="/submit" className="nav-white">
          Submit
        </Link>
        <Link href="/history" className="nav-white">
          History
        </Link>
        <PricingNav />
      </nav>
    </header>
  );
}
