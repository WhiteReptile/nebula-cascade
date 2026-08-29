import { VerdictView } from "@/components/VerdictView";
import { jobToVerdict } from "@/lib/job-verdict";
import { isJobComplete } from "@/lib/job-lifecycle";
import { getMockVerdict } from "@/lib/mock-verdicts";
import { getJob } from "@/lib/queue";
import { isJobId } from "@/lib/queue-shared";
import { getVerdictRecord } from "@/lib/verdict-store";
import { ResultClient } from "./ResultClient";

export default async function ResultPage({ params }: PageProps<"/result/[id]">) {
  const { id } = await params;
  const example = getMockVerdict(id);

  if (example) {
    return (
      <div className="px-6 py-16 sm:py-20">
        <VerdictView verdict={example} showActions={false} />
      </div>
    );
  }

  const stored = await getVerdictRecord(id);
  if (stored) {
    return (
      <div className="px-6 py-16 sm:py-20">
        <VerdictView verdict={stored} />
      </div>
    );
  }

  if (isJobId(id)) {
    const job = await getJob(id);
    if (job && isJobComplete(job)) {
      const verdict = jobToVerdict(job);
      if (verdict) {
        return (
          <div className="px-6 py-16 sm:py-20">
            <VerdictView verdict={verdict} />
          </div>
        );
      }
    }
  }

  return <ResultClient id={id} />;
}
