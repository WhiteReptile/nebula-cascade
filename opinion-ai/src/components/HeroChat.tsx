"use client";

import { useEffect, useRef, useState } from "react";

function saveDraft(value: string) {
  try {
    if (value.trim()) sessionStorage.setItem("opinion-ai-draft", value.trim());
    else sessionStorage.removeItem("opinion-ai-draft");
  } catch {
    /* private mode */
  }
}

export function HeroChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

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
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            saveDraft(next);
          }}
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
