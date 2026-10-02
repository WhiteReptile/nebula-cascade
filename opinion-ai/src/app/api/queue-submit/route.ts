import { hasAcceptedTerms } from "@/lib/accept-terms";
import { addJob, isExaminerModel, isHumanJobCategory, longVideoAllowed, MAX_QUEUE_FILE_BYTES, normalizeQueueCategory, VIDEO_CAP_SECONDS, type QueueJob } from "@/lib/queue";
import { publicRedirect } from "@/lib/public-origin";
import { isPrivatePack, resolveShareFlag } from "@/lib/share-policy";
import { NextResponse } from "next/server";
import { attachGuestCookie, GUEST_COOKIE, guardHybridQueue } from "@/lib/rate-limit";

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
    const packRaw = typeof form.get("pack") === "string" ? String(form.get("pack")) : "";

    if (!hasAcceptedTerms(form.get("acceptTerms"))) {
      return publicRedirect(request, "/submit?error=terms");
    }

    const gate = await guardHybridQueue(request);
    if (gate instanceof NextResponse) {
      const data = (await gate.clone().json()) as { code?: string };
      const path = data.code === "queue_limit" ? "/submit?error=queuelimit" : "/submit?error=hybrid";
      const next = publicRedirect(request, path);
      const guest = gate.cookies.get(GUEST_COOKIE)?.value;
      if (guest) attachGuestCookie(next, guest, request);
      return next;
    }

    if (!isHumanJobCategory(categoryRaw)) {
      return publicRedirect(request, "/submit?error=category");
    }
    const category = categoryRaw === "text" ? null : normalizeQueueCategory(categoryRaw);
    if (!category) {
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
    const isVideo = category === "video" || (fileRaw.type || "").startsWith("video/");
    const proPack = isPrivatePack(packRaw);
    if (
      isVideo &&
      durationSeconds != null &&
      durationSeconds > VIDEO_CAP_SECONDS &&
      !longVideoAllowed() &&
      !proPack
    ) {
      return publicRedirect(request, "/submit?error=longvideo");
    }

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
      share: resolveShareFlag({ pack: packRaw, shareRaw: form.get("share") }),
      examinerModel,
      ...(durationSeconds != null ? { durationSeconds } : {}),
    };

    await addJob(job, buffer);
    const next = publicRedirect(request, `/submit?queued=${job.id}`);
    attachGuestCookie(next, gate.guestId, request);
    return next;
  } catch {
    return publicRedirect(request, "/submit?error=failed");
  }
}
