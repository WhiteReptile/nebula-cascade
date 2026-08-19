"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackArrow } from "@/components/BackArrow";
import { saveVerdict } from "@/lib/storage";
import type { Verdict } from "@/lib/types";

export function QueueWait({ jobId }: { jobId: string }) {
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

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="mb-8">
        <BackArrow onClick={() => router.push("/submit")} hideOnHome={false} />
      </div>
      <div className="cosmic-glass p-8 text-center">
        <div className="work-spin" aria-hidden />
        <p className="label-white text-[10px] mt-4 mb-8">Loading</p>
        <p className="text-white text-base leading-relaxed mb-4">A person will look at your file.</p>
        <p className="text-dynamic text-sm leading-relaxed mb-4">
          They write how they feel, then we turn that into a short public opinion.
        </p>
        <p className="text-dynamic text-sm leading-relaxed mb-6">This is not instant like text.</p>
        <p className="warning-red sentence text-xs sm:text-sm">A review can take 5 to 10 minutes.</p>
      </div>
    </div>
  );
}
