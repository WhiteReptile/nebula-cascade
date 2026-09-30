"use client";

import { useEffect, useState } from "react";
import { isPrivatePack } from "@/lib/share-policy";
import { getPaidPack, PACK_CHANGED_EVENT } from "@/lib/storage";

export function ShareControls({ packFromUrl }: { packFromUrl?: string }) {
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
      <>
        <input type="hidden" name="share" value="0" />
        <p className="label-white text-[10px] mb-2">Sharing</p>
        <p className="text-dynamic text-sm leading-relaxed">
          Hybrid PRO is private. Your opinion is not shared on the public feed.
        </p>
      </>
    );
  }

  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        id="share-toggle"
        name="share"
        type="checkbox"
        value="1"
        defaultChecked
        className="mt-1 accent-[#4ec4ff]"
      />
      <span>
        <span className="label-white text-[10px] block mb-1">Share opinion</span>
        <span className="text-dynamic text-sm leading-relaxed">
          Allow this completed opinion on the public shared feed. Turn off to keep it private.
        </span>
      </span>
    </label>
  );
}
