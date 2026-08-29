"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveVerdict } from "@/lib/storage";

function heroText() {
  const el = document.querySelector<HTMLTextAreaElement>(".hero-chat-input");
  return el?.value.trim() ?? "";
}

export function HomeSubmitLink() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const text = heroText();
    if (!text) return;

    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, category: "text" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Evaluation failed");

      try {
        sessionStorage.removeItem("opinion-ai-draft");
      } catch {
        /* private mode */
      }

      saveVerdict(data.verdict);
      router.push(`/result/${data.verdict.id}`);
    } catch {
      try {
        sessionStorage.setItem("opinion-ai-draft", text);
      } catch {
        /* private mode */
      }
      router.push("/submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <a
      href="/submit"
      onClick={handleClick}
      className="cosmic-cta inline-block text-sm px-10 py-3"
      aria-busy={loading}
    >
      {loading ? "Submitting…" : "Submit"}
    </a>
  );
}
