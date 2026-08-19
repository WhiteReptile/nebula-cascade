import { NextResponse } from "next/server";
import { jobToVerdict } from "@/lib/job-verdict";
import { getJob, isJobId } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isJobId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (job.status !== "done") {
    return NextResponse.json({ status: "pending" });
  }

  const verdict = jobToVerdict(job);
  if (!verdict) {
    return NextResponse.json({ status: "pending" });
  }

  return NextResponse.json({ status: "done", verdict });
}
