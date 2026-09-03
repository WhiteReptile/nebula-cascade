"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveVerdict } from "@/lib/storage";
import type { Verdict } from "@/lib/types";

export function QueueStatusPoller({ jobId }: { jobId: string }) {
  const router = useRouter();

  useEffect(() => {
    let stop = false;

    async function tick() {
      try {
        const res = await fetch(`/api/queue/${jobId}`);
        const data = (await res.json()) as { status?: string; verdict?: Verdict };
        if (stop) return;
        if (data.status === "done" && data.verdict) {
          saveVerdict(data.verdict);
          router.replace(`/result/${data.verdict.id}`);
        }
      } catch {
        /* keep waiting */
      }
    }

    tick();
    const timer = setInterval(tick, 4000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [jobId, router]);

  return null;
}
