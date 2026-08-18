"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VerdictView } from "@/components/VerdictView";
import { getVerdict } from "@/lib/storage";
import type { Verdict } from "@/lib/types";

export function ResultClient({ id }: { id: string }) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setVerdict(getVerdict(id));
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return <p className="text-sm text-violet-300/40 text-center py-24">Scanning…</p>;
  }

  if (!verdict) {
    return (
      <div className="text-center py-24 px-6">
        <p className="text-sm text-violet-200/50 mb-4">Verdict not found in local history.</p>
        <Link href="/submit" className="text-sm text-[#66ffee]/70 hover:text-[#66ffee]">
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
