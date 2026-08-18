import { NextResponse } from "next/server";
import {
  addJob,
  isQueueCategory,
  longVideoAllowed,
  MAX_QUEUE_FILE_BYTES,
  VIDEO_CAP_SECONDS,
  type QueueJob,
} from "@/lib/queue";

export const runtime = "nodejs";

function parseDuration(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const categoryRaw = form.get("category");
    const contextRaw = form.get("context");
    const fileRaw = form.get("file");

    if (!isQueueCategory(categoryRaw)) {
      return NextResponse.json({ error: "Choose Music, Documents, or Video." }, { status: 400 });
    }
    const context = typeof contextRaw === "string" ? contextRaw.trim() : "";
    if (!context) {
      return NextResponse.json({ error: "Add a little context." }, { status: 400 });
    }
    if (context.length > 8000) {
      return NextResponse.json({ error: "Context is too long." }, { status: 400 });
    }
    if (!(fileRaw instanceof File) || fileRaw.size === 0) {
      return NextResponse.json({ error: "Choose a file." }, { status: 400 });
    }
    if (fileRaw.size > MAX_QUEUE_FILE_BYTES) {
      return NextResponse.json({ error: "File is too large." }, { status: 400 });
    }

    const durationSeconds = parseDuration(form.get("durationSeconds"));
    if (categoryRaw === "video") {
      if (durationSeconds == null) {
        return NextResponse.json({ error: "Could not read video length." }, { status: 400 });
      }
      if (durationSeconds > VIDEO_CAP_SECONDS && !longVideoAllowed()) {
        return NextResponse.json(
          { error: "Video over 2 minutes needs HUMAN + AI PRO." },
          { status: 400 },
        );
      }
    }

    const buffer = Buffer.from(await fileRaw.arrayBuffer());
    const job: QueueJob = {
      id: crypto.randomUUID(),
      category: categoryRaw,
      filename: fileRaw.name || "upload",
      mimeType: fileRaw.type || "application/octet-stream",
      size: fileRaw.size,
      context,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...(durationSeconds != null ? { durationSeconds } : {}),
    };

    await addJob(job, buffer);
    return NextResponse.json({ id: job.id });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
