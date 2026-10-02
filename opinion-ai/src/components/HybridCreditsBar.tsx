"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPaidPack, PACK_CHANGED_EVENT } from "@/lib/storage";

export function HybridCreditsBar() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    function read() {
      const pack = getPaidPack();
      if (!pack) {
        setLabel(null);
        return;
      }
      const name = pack.tier === "hybrid-pro" ? "Hybrid PRO" : "Hybrid";
      setLabel(`${name} · ${pack.credits.toLocaleString()} credits`);
    }
    read();
    window.addEventListener(PACK_CHANGED_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(PACK_CHANGED_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  if (!label) return null;

  return (
    <Link href="/pricing" className="text-dynamic text-xs tracking-wide whitespace-nowrap">
      {label}
    </Link>
  );
}
