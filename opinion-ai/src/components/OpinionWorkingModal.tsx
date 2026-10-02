"use client";

export const WORKING_COPY =
  "We are generating a real opinion about your work. This process can take a minute. Feel free to grab a coffee or relax while we work on your project";

export function OpinionWorkingModal({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div
      className="pdf-need-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opinion-working-title"
    >
      <div className="pdf-need-card cosmic-glass text-center">
        <div className="work-spin mx-auto" aria-hidden />
        <p id="opinion-working-title" className="label-white text-[10px] mt-4 mb-6">
          Working
        </p>
        <p className="text-white text-sm leading-relaxed">{WORKING_COPY}</p>
      </div>
    </div>
  );
}
