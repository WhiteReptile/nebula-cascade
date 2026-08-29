import { Suspense } from "react";
import { SubmitForm } from "@/components/SubmitForm";
import { getLlmConfig } from "@/lib/evaluate/pipeline";

export default function SubmitPage() {
  const demoMode = !getLlmConfig();

  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="max-w-xl mx-auto mb-12 text-center">
        <h1 className="cosmic-title font-light text-[1.796875rem]">Submit</h1>
        {demoMode && (
          <p className="warning-red sentence text-xs sm:text-sm mt-4">
            Demo mode — add a Groq API key in .env to enable real AI opinions.
          </p>
        )}
      </div>
      <Suspense fallback={<p className="text-dynamic text-sm text-center">Loading…</p>}>
        <SubmitForm longVideoAllowed={process.env.PRO_LONG_VIDEO === "1"} />
      </Suspense>
    </div>
  );
}
