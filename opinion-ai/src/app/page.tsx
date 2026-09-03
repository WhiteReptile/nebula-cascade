import { ExampleCard } from "@/components/ExampleCard";
import { HomeHero } from "@/components/HomeHero";
import { ScoreScale } from "@/components/ScoreScale";
import { MOCK_VERDICTS } from "@/lib/mock-verdicts";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-6 py-20 sm:py-28">
      <HomeHero />

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
