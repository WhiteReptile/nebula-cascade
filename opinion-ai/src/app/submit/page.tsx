import { Suspense } from "react";
import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="max-w-xl mx-auto mb-12 text-center">
        <h1 className="cosmic-title text-xl font-light tracking-wide">Submit</h1>
        <p className="mt-2 text-sm text-violet-200/40">
          Paste text. Category auto-detected.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-violet-300/40 text-center">Loading…</p>}>
        <SubmitForm />
      </Suspense>
    </div>
  );
}
