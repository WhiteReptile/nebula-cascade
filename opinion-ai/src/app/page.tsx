import Link from "next/link";
import { ExampleCard } from "@/components/ExampleCard";
import { HeroChat } from "@/components/HeroChat";
import { ScoreScale } from "@/components/ScoreScale";
import { MOCK_VERDICTS } from "@/lib/mock-verdicts";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-6 py-20 sm:py-28">
      <div className="max-w-2xl w-full text-center mb-20">
        <p className="brand-wordmark text-4xl sm:text-5xl mb-8" aria-label="YourTruths">
          <span className="brand-your">Your</span>
          <span className="brand-truths">Truths</span>
        </p>
        <p className="label-white text-[10px] sm:text-xs mb-6 max-w-md mx-auto leading-relaxed">
          An AI designed to give unbiased, real opinions of your work
        </p>
        <h1 className="cosmic-title text-3xl sm:text-4xl font-light mb-4">
          Ask what we really think.
        </h1>
        <p className="text-dynamic text-sm mb-3">No yes-men. Just opinions.</p>
        <div className="cosmic-divider w-32 mx-auto my-8" />
        <HeroChat />
        <Link href="/submit" className="cosmic-cta inline-block text-sm px-10 py-3">
          Submit
        </Link>
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
