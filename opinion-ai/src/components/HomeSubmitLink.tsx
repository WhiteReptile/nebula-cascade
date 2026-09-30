"use client";

import Link from "next/link";
import { persistDraft } from "@/components/HeroDraft";
import { dispatchNeedPdf, isOverWordLimit } from "@/lib/content-limits";

function readHomeDraft(): string {
  if (typeof document === "undefined") return "";
  const el = document.querySelector<HTMLTextAreaElement>(".hero-chat-input");
  return el?.value.trim() ?? "";
}

export function HomeSubmitLink() {
  return (
    <Link
      href="/submit?category=text"
      className="cosmic-cta inline-block text-sm px-10 py-3"
      onClick={(e) => {
        const text = readHomeDraft();
        if (text) persistDraft(text);
        if (isOverWordLimit(text)) {
          e.preventDefault();
          dispatchNeedPdf();
        }
      }}
    >
      Submit
    </Link>
  );
}
