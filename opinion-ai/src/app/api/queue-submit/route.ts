import { addJob, isExaminerModel, isHumanJobCategory, longVideoAllowed, MAX_QUEUE_FILE_BYTES, VIDEO_CAP_SECONDS, type QueueJob } from "@/lib/queue";
import { publicRedirect } from "@/lib/public-origin";

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
      return publicRedirect(request, "/submit?error=category");
    }
    const context = typeof contextRaw === "string" ? contextRaw.trim() : "";
    if (!context) {
      return publicRedirect(request, "/submit?error=empty");
    }
    if (!(fileRaw instanceof File) || fileRaw.size === 0) {
      return publicRedirect(request, "/submit?error=file");
    }
    if (fileRaw.size > MAX_QUEUE_FILE_BYTES) {
      return publicRedirect(request, "/submit?error=filesize");
    }

    const durationSeconds = parseDuration(form.get("durationSeconds"));
    const isVideo = categoryRaw === "video" || (fileRaw.type || "").startsWith("video/");
    if (isVideo && durationSeconds != null && durationSeconds > VIDEO_CAP_SECONDS && !longVideoAllowed()) {
      return publicRedirect(request, "/submit?error=longvideo");
    }

    const examinerModel = isExaminerModel(modelRaw) ? modelRaw : "pro-examiner-v2";
    const buffer = Buffer.from(await fileRaw.arrayBuffer());
    const job: QueueJob = {
      id: crypto.randomUUID(),
      category: categoryRaw,
      filename: fileRaw.name || "upload",
      mimeType: fileRaw.type || "application/octet-stream",
      size: fileRaw.size,
      context,
      status: "UPLOADED",
      createdAt: new Date().toISOString(),
      share: form.get("share") === "1",
      examinerModel,
      ...(durationSeconds != null ? { durationSeconds } : {}),
    };

    await addJob(job, buffer);
    return publicRedirect(request, `/submit?queued=${job.id}`);
  } catch {
    return publicRedirect(request, "/submit?error=failed");
  }
}
