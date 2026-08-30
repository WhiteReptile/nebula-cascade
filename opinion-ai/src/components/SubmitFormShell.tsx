import Link from "next/link";
import { BackArrow } from "@/components/BackArrow";
import {
  QUEUE_CATEGORY_IDS,
  SUBMIT_SLOTS,
  submitTabHref,
} from "@/lib/submit-form-slots";
import type { SubmitCategoryId } from "@/lib/submit-categories";
import type { ExaminerModel } from "@/lib/queue-shared";

const EXAMINER_MODELS: { id: ExaminerModel; label: string }[] = [
  { id: "pro-examiner-v1", label: "Pro Examiner V1" },
  { id: "pro-examiner-v2", label: "Pro Examiner V2" },
];

export function SubmitFormShell({
  category,
  revisionOf,
  queuedId,
}: {
  category: SubmitCategoryId;
  revisionOf?: string;
  queuedId?: string;
}) {
  if (queuedId) {
    return (
      <div className="max-w-xl mx-auto w-full">
        <div className="mb-8">
          <BackArrow href="/submit" hideOnHome={false} />
        </div>
        <div className="cosmic-glass p-8 text-center">
          <div className="work-spin" aria-hidden />
          <p className="label-white text-[10px] mt-4 mb-8">Loading</p>
          <p className="text-white text-base leading-relaxed mb-4">A person will look at your file.</p>
          <p className="text-dynamic text-sm leading-relaxed mb-4">
            They write how they feel, then we turn that into a short public opinion.
          </p>
          <p className="text-dynamic text-sm leading-relaxed mb-6">This is not instant like text.</p>
          <p className="warning-red sentence text-xs sm:text-sm">A review can take 5 to 10 minutes.</p>
          <p className="text-dynamic text-xs mt-6">
            <Link href={`/result/${queuedId}`} className="nav-white">
              Check status
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const slot = SUBMIT_SLOTS.find((s) => s.id === category);
  const queueSelected = QUEUE_CATEGORY_IDS.includes(category);
  const textSelected = category === "text";

  return (
    <form
      id="submit-form"
      method="POST"
      action={textSelected ? "/api/submit-text" : "/api/queue-submit"}
      encType={textSelected ? "multipart/form-data" : "multipart/form-data"}
      className="max-w-xl mx-auto w-full"
    >
      {revisionOf && (
        <p className="text-dynamic text-sm mb-4">Revising a previous submission.</p>
      )}

      <div className="hud-row mb-3" role="listbox" aria-label="Category">
        {SUBMIT_SLOTS.map((s) => {
          const on = category === s.id;
          return (
            <Link
              key={s.id}
              href={submitTabHref(s.id, revisionOf)}
              role="option"
              aria-selected={on}
              className={`hud-slot ${on ? "hud-slot-on" : ""}`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {queueSelected && (
        <p className="warning-red sentence text-xs sm:text-sm mb-4">
          Music, images, video, and physical appearance need a human, so a review can take 5 to 10 minutes. Uploaded files (including tracks) are not kept — only the final opinion and score.
        </p>
      )}

      {slot && (
        <div className="cosmic-glass p-5 mb-4">
          <p className="text-dynamic text-sm leading-relaxed">{slot.note}</p>
        </div>
      )}

      {queueSelected && (
        <>
          <input type="hidden" name="category" value={category} />
          <div className="file-pick mb-4">
            <input
              id="submit-file"
              name="file"
              type="file"
              accept={slot?.fileAccept}
              className="sr-only"
            />
            <label htmlFor="submit-file" className="file-pick-btn">
              Choose file
            </label>
            <span className="file-pick-name" id="submit-file-name">
              No file chosen
            </span>
          </div>
        </>
      )}

      <div className="cosmic-glass p-1 mb-4">
        <textarea
          name={textSelected ? "content" : "context"}
          defaultValue=""
          placeholder={
            category === "text"
              ? "Paste a poem, essay, homework, report, or screenplay…"
              : category === "physical_appearance"
                ? "Hair loss, a procedure, what you want judged…"
                : category === "images"
                  ? "What should we look at? Poster, ad, artwork, photo…"
                  : "Context for the human reviewer…"
          }
          rows={14}
          className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none resize-y"
        />
        {revisionOf && <input type="hidden" name="revisionOf" value={revisionOf} />}
      </div>

      {textSelected && (
        <div className="file-pick mb-4">
          <input
            id="submit-pdf"
            name="pdf"
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
          />
          <label htmlFor="submit-pdf" className="file-pick-btn">
            Or upload PDF
          </label>
          <span className="file-pick-name" id="submit-pdf-name">
            No PDF chosen
          </span>
        </div>
      )}

      <div className="cosmic-glass p-4 mb-4">
        <label htmlFor="model-select" className="label-white text-[10px] block mb-2">
          Model
        </label>
        <select
          id="model-select"
          name="model"
          defaultValue="pro-examiner-v2"
          className="w-full bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:outline-none"
        >
          {EXAMINER_MODELS.map((item) => (
            <option key={item.id} value={item.id} className="bg-[#060814] text-white">
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex items-start justify-between">
        <div className="flex flex-col items-start gap-2">
          {textSelected ? (
            <span className="text-dynamic text-xs tracking-wide">Free · no credits needed</span>
          ) : (
            <span className="text-dynamic text-xs tracking-wide">Human review · credits may apply</span>
          )}
        </div>
        <button type="submit" className="cosmic-cta text-sm px-8 py-2.5">
          Submit
        </button>
      </div>

      <p id="submit-form-error" className="mt-4 text-sm warning-red sentence hidden" />
    </form>
  );
}
