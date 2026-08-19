import { VerdictView } from "@/components/VerdictView";
import { getMockVerdict } from "@/lib/mock-verdicts";
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

  return <ResultClient id={id} />;
}
