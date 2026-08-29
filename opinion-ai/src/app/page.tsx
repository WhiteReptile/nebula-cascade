import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { ExampleCard } from "@/components/ExampleCard";
import { HeroChat } from "@/components/HeroChat";
import { HeroHeadline } from "@/components/HeroHeadline";
import { HomeSubmitLink } from "@/components/HomeSubmitLink";
import { ScoreScale } from "@/components/ScoreScale";
import { MOCK_VERDICTS } from "@/lib/mock-verdicts";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-6 py-20 sm:py-28">
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

      <div className="max-w-4xl w-full">
        <p className="label-white text-[10px] mb-6 text-center">Signal samples</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {MOCK_VERDICTS.map((v) => (
            <ExampleCard key={v.id} verdict={v} />
          ))}
        </div>
        <ScoreScale />
      </div>
    </div>
  );
}
