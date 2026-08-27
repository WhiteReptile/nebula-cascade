"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HeroChat() {
  const router = useRouter();
  const [draft, setDraft] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (text) {
      try {
        sessionStorage.setItem("opinion-ai-draft", text);
      } catch {
        /* private mode */
      }
    }
    router.push("/submit");
  }

  return (
    <div className="hero-chat cosmic-glass w-full max-w-md mx-auto text-left mb-8">
      <div className="hero-chat-thread px-4 pt-4 pb-3 space-y-3">
        <p className="hero-chat-msg hero-chat-msg-in">Tell me the truth about this.</p>
        <p className="hero-chat-msg hero-chat-msg-out">We don’t soften it.</p>
      </div>
      <form onSubmit={onSubmit} className="hero-chat-composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste a line…"
          aria-label="Start an opinion"
          className="hero-chat-input"
          maxLength={500}
        />
        <button type="submit" className="hero-chat-send" aria-label="Continue to submit">
          Ask
        </button>
      </form>
    </div>
  );
}
