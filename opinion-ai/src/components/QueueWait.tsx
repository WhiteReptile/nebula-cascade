"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackArrow } from "@/components/BackArrow";
import { OpinionWorkingModal } from "@/components/OpinionWorkingModal";
import { saveVerdict } from "@/lib/storage";
import type { Verdict } from "@/lib/types";

export function QueueWait({ jobId }: { jobId: string }) {
  const router = useRouter();

  useEffect(() => {
    let stop = false;

    async function tick() {
      try {
        const res = await fetch(`/api/queue/${jobId}`);
        const data = (await res.json()) as {
          status?: string;
          verdict?: Verdict;
        };
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
        <BackArrow href="/submit" hideOnHome={false} />
      </div>
      <div className="cosmic-glass p-8 text-center">
        <p className="text-dynamic text-sm leading-relaxed mb-4">Your file is in the queue.</p>
        <p className="text-dynamic text-xs">
          <Link href={`/result/${jobId}`} className="nav-white">
            Check status
          </Link>
        </p>
      </div>
      <OpinionWorkingModal open />
    </div>
  );
}
