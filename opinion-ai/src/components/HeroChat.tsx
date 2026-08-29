"use client";

import { useHeroDraft, loadDraft } from "@/components/HeroDraft";
import { useEffect, useRef } from "react";

export function HeroChat() {
  const { draft, setDraft } = useHeroDraft();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadDraft();
    if (saved) setDraft(saved);
  }, [setDraft]);

  return (
    <div
      className="hero-chat cosmic-glass w-full max-w-sm mx-auto mb-8"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <div className="hero-chat-shell">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
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
