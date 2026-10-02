"use client";

import { BrandMark } from "@/components/BrandMark";
import { HeroChat } from "@/components/HeroChat";
import { HeroHeadline } from "@/components/HeroHeadline";
import { HomeSubmitLink } from "@/components/HomeSubmitLink";

export function HomeHero() {
  return (
    <div className="max-w-3xl w-full text-center mb-20">
        <p className="mb-8">
          <BrandMark size="hero" />
        </p>
        <HeroHeadline />
        <p className="text-dynamic text-sm mb-3">No yes-men. Just opinions.</p>
        <div className="cosmic-divider w-32 mx-auto my-8" />
        <HeroChat />
        <HomeSubmitLink />
        <p className="warning-red text-xs sm:text-sm mt-10 mb-0 font-bold">
          Humans will look at your work too
        </p>
      </div>
  );
}
