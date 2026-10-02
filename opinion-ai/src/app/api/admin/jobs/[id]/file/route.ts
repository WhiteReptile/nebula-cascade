import { readFile, stat } from "fs/promises";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { jobHasUploadFile } from "@/lib/job-lifecycle";
import { getJob, isJobId, uploadPath } from "@/lib/queue";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!isJobId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!jobHasUploadFile(job)) {
    return NextResponse.json(
      { error: "Upload file was deleted after the opinion was saved." },
      { status: 404 },
    );
  }

  const filePath = uploadPath(job.id);
  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ error: "File missing." }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const body = await readFile(filePath);
  const headers = new Headers();
  headers.set("Content-Type", job.mimeType || "application/octet-stream");
  headers.set("Content-Length", String(body.length));
  const disposition = download ? "attachment" : "inline";
  const safeName = job.filename.replace(/[\r\n"]/g, "_");
  headers.set("Content-Disposition", `${disposition}; filename="${safeName}"`);
  headers.set("Cache-Control", "private, no-store");

  return new NextResponse(new Uint8Array(body), { status: 200, headers });
}
