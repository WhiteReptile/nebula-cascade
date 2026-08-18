import { Suspense } from "react";
import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <h1 className="cosmic-title text-xl font-light">Evaluate</h1>
        <p className="text-dynamic mt-2 text-sm">
          Pick a category. Paste the work. Add context so we know what “good” means here.
        </p>
      </div>
      <Suspense fallback={<p className="text-dynamic text-sm text-center">Loading…</p>}>
        <SubmitForm />
      </Suspense>
    </div>
  );
}
