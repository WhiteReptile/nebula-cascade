import Link from "next/link";
import { HowParts } from "@/components/HowParts";
import { HOW_PAGE } from "@/lib/how-copy";

export default function HowPage() {
  return (
    <div className="px-6 py-16 sm:py-20 max-w-xl mx-auto w-full">
      <div className="space-y-6">
        {HOW_PAGE.blocks.map((block, i) =>
          block.type === "tagline" ? (
            <p key={i} className="how-tagline text-center mt-10">
              <HowParts parts={block.parts} />
            </p>
          ) : (
            <p key={i} className="text-dynamic text-sm leading-relaxed">
              <HowParts parts={block.parts} />
            </p>
          ),
        )}
      </div>

      <div className="cosmic-divider w-24 mx-auto my-12" />

      <div className="text-center">
        <Link href="/submit" className="cosmic-cta inline-block text-sm px-10 py-3">
          Submit
        </Link>
      </div>
    </div>
  );
}
