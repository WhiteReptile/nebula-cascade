"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackArrow } from "@/components/BackArrow";
import { saveVerdict } from "@/lib/storage";
import { queueWaitLine } from "@/lib/queue-wait-copy";
import type { Verdict } from "@/lib/types";

export function QueueWait({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState<string | undefined>();

  useEffect(() => {
    let stop = false;

    async function tick() {
      try {
        const res = await fetch(`/api/queue/${jobId}`);
        const data = (await res.json()) as {
          status?: string;
          category?: string;
          verdict?: Verdict;
        };
        if (stop) return;
        if (data.category) setCategory(data.category);
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
        <BackArrow href="/submit" hideOnHome={false} />
      </div>
      <div className="cosmic-glass p-8 text-center">
        <div className="work-spin" aria-hidden />
        <p className="label-white text-[10px] mt-4 mb-8">Loading</p>
        <p className="text-white text-base leading-relaxed mb-4">A person will look at your file.</p>
        <p className="text-dynamic text-sm leading-relaxed mb-4">
          They write how they feel, then we turn that into a short opinion.
        </p>
        <p className="text-dynamic text-sm leading-relaxed mb-6">This is not instant like text.</p>
        <p className="warning-red sentence text-xs sm:text-sm">{queueWaitLine(category)}</p>
        <p className="text-dynamic text-xs mt-6">
          <Link href={`/result/${jobId}`} className="nav-white">
            Check status
          </Link>
        </p>
      </div>
    </div>
  );
}
