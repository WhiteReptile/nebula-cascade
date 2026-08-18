import Link from "next/link";
import { ExampleCard } from "@/components/ExampleCard";
import { MOCK_VERDICTS } from "@/lib/mock-verdicts";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-6 py-20 sm:py-28">
      <div className="max-w-2xl w-full text-center mb-20">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#66ffee]/40 mb-6">
          Independent evaluation
        </p>
        <h1 className="cosmic-title text-3xl sm:text-4xl font-light tracking-tight mb-4">
          Ask what we really think.
        </h1>
        <p className="text-sm text-violet-200/45 mb-3">No yes-men. Just opinions.</p>
        <div className="cosmic-divider w-32 mx-auto my-8" />
        <Link href="/submit" className="cosmic-cta inline-block text-sm px-10 py-3">
          Evaluate
        </Link>
      </div>

      <div className="max-w-4xl w-full">
        <p className="text-[10px] uppercase tracking-[0.35em] text-violet-300/35 mb-6 text-center">
          Signal samples
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {MOCK_VERDICTS.map((v) => (
            <ExampleCard key={v.id} verdict={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
