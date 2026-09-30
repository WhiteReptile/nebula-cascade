"use client";

import { flashPdfPick, MAX_CONTENT_WORDS } from "@/lib/content-limits";

export function PdfNeedModal({
  open,
  onClose,
  variant,
}: {
  open: boolean;
  onClose: () => void;
  variant: "home" | "submit";
}) {
  if (!open) return null;

  function pickPdfOnTab() {
    onClose();
    flashPdfPick();
    const input = document.getElementById("submit-pdf") as HTMLInputElement | null;
    input?.click();
  }

  return (
    <div className="pdf-need-overlay" role="dialog" aria-modal="true" aria-labelledby="pdf-need-title">
      <div className="pdf-need-card cosmic-glass">
        <p id="pdf-need-title" className="label-white text-[10px] mb-3">
          Over {MAX_CONTENT_WORDS.toLocaleString()} words
        </p>
        <p className="text-white text-sm leading-relaxed mb-3">
          Instant AI can&apos;t take more than {MAX_CONTENT_WORDS.toLocaleString()} pasted words.
        </p>
        <p className="text-dynamic text-sm leading-relaxed mb-6">
          {variant === "home"
            ? "Open Submit → Text and upload a PDF on that tab. A reviewer can open the file in Admin."
            : "Add a PDF on this Text tab. A reviewer will open the file in Admin."}
        </p>
        <div className="flex justify-end gap-3">
          {variant === "home" ? (
            <a href="/submit?category=text" className="cosmic-cta text-sm px-8 py-2.5" onClick={onClose}>
              Go to Text + PDF
            </a>
          ) : (
            <button type="button" className="cosmic-cta text-sm px-8 py-2.5" onClick={pickPdfOnTab}>
              Add PDF on this tab
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
