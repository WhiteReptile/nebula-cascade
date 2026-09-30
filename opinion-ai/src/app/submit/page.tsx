import { DraftHydrateScript } from "@/components/DraftHydrateScript";
import { PackBootstrap } from "@/components/PackBootstrap";
import { QueueStatusPoller } from "@/components/QueueStatusPoller";
import { SubmitFormEnhancer } from "@/components/SubmitFormEnhancer";
import { SubmitFormShell } from "@/components/SubmitFormShell";
import { getLlmConfig } from "@/lib/evaluate/pipeline";
import { isJobId } from "@/lib/queue-shared";
import { isPrivatePack, parsePackTier } from "@/lib/share-policy";
import { parseSubmitCategory } from "@/lib/submit-categories";

type SubmitSearchParams = {
  error?: string;
  category?: string;
  revision?: string;
  queued?: string;
  pack?: string;
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<SubmitSearchParams>;
}) {
  const params = await searchParams;
  const demoMode = !getLlmConfig();
  const category = parseSubmitCategory(params.category);
  const revisionOf = params.revision?.trim() || undefined;
  const queuedId = params.queued?.trim();
  const queued = Boolean(queuedId && isJobId(queuedId));
  const pack = parsePackTier(params.pack) ?? undefined;
  const errorMessage =
    params.error === "empty"
      ? "Paste your text first."
      : params.error === "needpdf"
        ? "Over 8,000 words — upload a PDF on the Text tab."
        : params.error === "long"
          ? "Submission too long (max 8,000 words)."
          : params.error === "file"
            ? "Choose a file first."
            : params.error === "filesize"
              ? "File is too large."
              : params.error === "longvideo"
                ? "Video over 2 minutes needs HUMAN + AI PRO."
                : params.error === "terms"
                  ? "Accept the Terms and Content Policy to continue."
                  : params.error === "failed"
                    ? "Submission failed. Try again."
                    : null;

  return (
    <div className="px-6 py-16 sm:py-20">
      <DraftHydrateScript />
      <PackBootstrap pack={pack} />
      <div className="max-w-xl mx-auto mb-12 text-center">
        <h1 className="cosmic-title font-light text-[1.796875rem]">Submit</h1>
        {demoMode && (
          <p className="warning-red sentence text-xs sm:text-sm mt-4">
            Demo mode — add an LLM API key in .env to enable Pro Examiner V2.
          </p>
        )}
        {pack && isPrivatePack(pack) && (
          <p className="text-dynamic text-xs sm:text-sm mt-4">
            PRO pack active — submissions stay private (not shared).
          </p>
        )}
        {errorMessage && (
          <p className="warning-red sentence text-xs sm:text-sm mt-4">{errorMessage}</p>
        )}
      </div>
      <SubmitFormShell
        category={category}
        revisionOf={revisionOf}
        queuedId={queued ? queuedId : undefined}
        pack={pack}
      />
      {queued && queuedId ? <QueueStatusPoller jobId={queuedId} /> : null}
      {!queued && (
        <SubmitFormEnhancer
          category={category}
          revisionOf={revisionOf}
          longVideoAllowed={process.env.PRO_LONG_VIDEO === "1" || isPrivatePack(pack)}
          pack={pack}
          initialNeedPdf={params.error === "needpdf"}
        />
      )}
    </div>
  );
}
