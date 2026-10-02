"use client";

import { useEffect, useState } from "react";
import { isPrivatePack } from "@/lib/share-policy";
import { getPaidPack, PACK_CHANGED_EVENT } from "@/lib/storage";

export function HybridSubmitHint({ packFromUrl }: { packFromUrl?: string }) {
  const [privateForced, setPrivateForced] = useState(() => isPrivatePack(packFromUrl));

  useEffect(() => {
    function read() {
      const paid = getPaidPack();
      setPrivateForced(isPrivatePack(packFromUrl) || isPrivatePack(paid?.tier));
    }
    read();
    window.addEventListener(PACK_CHANGED_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(PACK_CHANGED_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [packFromUrl]);

  if (privateForced) {
    return (
      <span className="text-dynamic text-xs tracking-wide">Human review · private PRO · 20 credits/min</span>
    );
  }
  return (
    <span className="text-dynamic text-xs tracking-wide">
      Human review · 20 credits/min · 5-minute blocks
    </span>
  );
}
