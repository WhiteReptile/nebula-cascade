import { NextResponse } from "next/server";
import {
  addJob,
  isExaminerModel,
  isHumanJobCategory,
  longVideoAllowed,
  MAX_QUEUE_FILE_BYTES,
  normalizeQueueCategory,
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
    const modelRaw = form.get("model");

    if (!isHumanJobCategory(categoryRaw)) {
      return NextResponse.json({ error: "Choose a slot that takes a file." }, { status: 400 });
    }
    const category = categoryRaw === "text" ? "text" : normalizeQueueCategory(categoryRaw);
    if (!category || category === "text") {
      return NextResponse.json({ error: "Choose a slot that takes a file." }, { status: 400 });
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
    const isVideo = category === "video" || (fileRaw.type || "").startsWith("video/");
    if (isVideo) {
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

    const share = form.get("share") === "1";
    const examinerModel = isExaminerModel(modelRaw) ? modelRaw : "pro-examiner-v2";

    const buffer = Buffer.from(await fileRaw.arrayBuffer());
    const job: QueueJob = {
      id: crypto.randomUUID(),
      category,
      filename: fileRaw.name || "upload",
      mimeType: fileRaw.type || "application/octet-stream",
      size: fileRaw.size,
      context,
      status: "UPLOADED",
      createdAt: new Date().toISOString(),
      share,
      examinerModel,
      ...(durationSeconds != null ? { durationSeconds } : {}),
    };

    await addJob(job, buffer);
    return NextResponse.json({ id: job.id });
  } catch (err) {
    console.error("queue POST", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
