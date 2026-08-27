import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const STEPS = [
  {
    n: "01",
    title: "You submit",
    body: "Paste text, a landing page, a pitch, or an idea. No chat. One shot.",
  },
  {
    n: "02",
    title: "Analyst",
    body: "A neutral pass extracts evidence only — what is actually in the work, not whether it is good.",
  },
  {
    n: "03",
    title: "Steelman",
    body: "The strongest case for the work, then the strongest case against it. Taste is not the verdict.",
  },
  {
    n: "04",
    title: "Opinion",
    body: "A structured score and verdict: strengths, weaknesses, biggest problem, biggest opportunity.",
  },
  {
    n: "05",
    title: "Humans",
    body: "AI is the first pass. Humans can review the same submission independently. You will not know who.",
  },
];

export default function HowPage() {
  return (
    <div className="px-6 py-16 sm:py-20 max-w-xl mx-auto w-full">
      <h1 className="cosmic-title text-xl font-light mb-4">How does it work</h1>
      <p className="text-dynamic text-sm mb-10">
        <BrandMark size="inline" /> is an evaluation system, not a chatbot with an attitude.
      </p>

      <ol className="space-y-4">
        {STEPS.map((step) => (
          <li key={step.n} className="cosmic-glass p-5">
            <p className="label-white text-[10px] mb-2">
              {step.n} · {step.title}
            </p>
            <p className="text-dynamic text-sm leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="warning-red text-xs sm:text-sm text-center mt-10 font-bold">
        Humans will look at your work too
      </p>

      <div className="mt-10 text-center">
        <Link href="/submit" className="cosmic-cta inline-block text-sm px-10 py-3">
          Submit
        </Link>
      </div>
    </div>
  );
}
