"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QueueWait } from "@/components/QueueWait";
import { VerdictView } from "@/components/VerdictView";
import { getVerdict, saveVerdict } from "@/lib/storage";
import type { Verdict } from "@/lib/types";

export function ResultClient({ id }: { id: string }) {
  const [verdict, setVerdict] = useState<Verdict | null>(() => getVerdict(id));
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(() => Boolean(getVerdict(id)));

  useEffect(() => {
    if (getVerdict(id)) return;

    let stop = false;
    fetch(`/api/verdict/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { verdict?: Verdict } | null) => {
        if (stop) return;
        if (data?.verdict) {
          saveVerdict(data.verdict);
          setVerdict(data.verdict);
          setLoaded(true);
          return;
        }
        return fetch(`/api/queue/${id}`)
          .then((res) => res.json())
          .then((queueData: { status?: string; verdict?: Verdict }) => {
            if (stop) return;
            if (queueData.status === "done" && queueData.verdict) {
              saveVerdict(queueData.verdict);
              setVerdict(queueData.verdict);
            } else if (queueData.status === "pending") {
              setPending(true);
            }
            setLoaded(true);
          });
      })
      .catch(() => {
        if (!stop) setLoaded(true);
      });

    return () => {
      stop = true;
    };
  }, [id]);

  if (!loaded) {
    return <p className="text-dynamic text-sm text-center py-24">Scanning…</p>;
  }

  if (pending) {
    return (
      <div className="px-6 py-16 sm:py-20">
        <QueueWait jobId={id} />
      </div>
    );
  }

  if (!verdict) {
    return (
      <div className="text-center py-24 px-6">
        <p className="text-dynamic text-sm mb-4">Verdict not found in local history.</p>
        <Link href="/submit" className="nav-white text-sm">
          Submit something new
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 sm:py-20">
      <VerdictView verdict={verdict} />
    </div>
  );
}
