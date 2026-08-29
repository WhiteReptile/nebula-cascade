"use client";

import { persistDraft } from "@/components/HeroDraft";
import { useEffect, useRef } from "react";

export function HeroChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("opinion-ai-draft")?.trim() ?? "";
      if (saved && inputRef.current && !inputRef.current.value) {
        inputRef.current.value = saved;
      }
    } catch {
      /* private mode */
    }
  }, []);

  return (
    <div
      className="hero-chat cosmic-glass w-full max-w-sm mx-auto mb-8"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <div className="hero-chat-shell">
        <textarea
          ref={inputRef}
          defaultValue=""
          onChange={(e) => persistDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          rows={3}
          maxLength={500}
          className="hero-chat-input"
          aria-label="Message"
        />
      </div>
    </div>
  );
}
