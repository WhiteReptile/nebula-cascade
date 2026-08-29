"use client";

import Link from "next/link";

function saveHeroDraft() {
  try {
    const el = document.querySelector<HTMLTextAreaElement>(".hero-chat-input");
    const text = el?.value.trim() ?? "";
    if (text) sessionStorage.setItem("opinion-ai-draft", text);
    else sessionStorage.removeItem("opinion-ai-draft");
  } catch {
    /* private mode */
  }
}

export function HomeSubmitLink() {
  return (
    <Link
      href="/submit"
      onClick={saveHeroDraft}
      className="cosmic-cta inline-block text-sm px-10 py-3"
    >
      Submit
    </Link>
  );
}
