"use client";

import Link from "next/link";
import { BackArrow } from "@/components/BackArrow";
import { PricingNav } from "@/components/PricingNav";

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/15">
      <div className="flex items-center gap-5">
        <BackArrow />
        <Link href="/" className="cosmic-title text-sm font-medium tracking-[0.28em]">
          Opinion.ai
        </Link>
      </div>
      <nav className="flex items-center gap-8 text-sm">
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
