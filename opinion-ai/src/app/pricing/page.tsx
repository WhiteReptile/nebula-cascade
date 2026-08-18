import Link from "next/link";
import { PRICING_SECTIONS } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <div className="px-6 py-16 sm:py-20 max-w-xl mx-auto w-full">
      <h1 className="cosmic-title text-xl font-light mb-4">Pricing</h1>
      <p className="text-dynamic text-sm mb-10">
        How pricing works: free text, paid credits for files.
      </p>

      <ol className="space-y-4">
        {PRICING_SECTIONS.map((section) => (
          <li key={section.n} className="cosmic-glass p-5">
            <p className="label-white text-[10px] mb-2">
              {section.n} · {section.title}
            </p>
            <p className="text-dynamic text-sm leading-relaxed">{section.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <Link href="/submit" className="cosmic-cta inline-block text-sm px-10 py-3">
          Evaluate
        </Link>
      </div>
    </div>
  );
}
