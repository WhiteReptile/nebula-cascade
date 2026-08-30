"use client";

import Link from "next/link";
import { persistDraft } from "@/components/HeroDraft";

function readHomeDraft(): string {
  if (typeof document === "undefined") return "";
  const el = document.querySelector<HTMLTextAreaElement>(".hero-chat-input");
  return el?.value.trim() ?? "";
}

export function HomeSubmitLink() {
  return (
    <Link
      href="/submit"
      className="cosmic-cta inline-block text-sm px-10 py-3"
      onClick={() => {
        const text = readHomeDraft();
        if (text) persistDraft(text);
      }}
    >
      Submit
    </Link>
  );
}
