"use client";

import { useEffect } from "react";
import { packCredits, parsePackTier } from "@/lib/share-policy";
import { setPaidPack } from "@/lib/storage";

/** Apply ?pack= from Pricing CTAs into local credit pack (until Stripe is live). */
export function PackBootstrap({ pack }: { pack?: string }) {
  useEffect(() => {
    const tier = parsePackTier(pack);
    if (!tier) return;
    setPaidPack({ tier, credits: packCredits(tier) });
  }, [pack]);

  return null;
}
