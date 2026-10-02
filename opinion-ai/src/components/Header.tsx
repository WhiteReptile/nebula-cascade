"use client";

import Link from "next/link";
import { BackArrow } from "@/components/BackArrow";
import { BrandMark } from "@/components/BrandMark";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { HybridCreditsBar } from "@/components/HybridCreditsBar";
import { SiteNav } from "@/components/SiteNav";

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/15">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <BackArrow />
        <Link href="/" className="inline-flex items-center shrink-0">
          <BrandMark size="nav" />
        </Link>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
        <SiteNav />
        <HybridCreditsBar />
        <GoogleSignInButton />
      </div>
    </header>
  );
}
