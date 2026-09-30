"use client";

import { persistDraft } from "@/components/HeroDraft";
import { countWords, MAX_CONTENT_CHARS, MAX_CONTENT_WORDS } from "@/lib/content-limits";
import { useEffect, useRef, useState } from "react";

export function HeroChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [words, setWords] = useState(0);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("opinion-ai-draft")?.trim() ?? "";
      if (saved && inputRef.current && !inputRef.current.value) {
        inputRef.current.value = saved;
        setWords(countWords(saved));
      }
    } catch {
      /* private mode */
    }
  }, []);

  return (
    <div
      className="hero-chat cosmic-glass w-full max-w-2xl mx-auto mb-8"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <div className="hero-chat-shell">
        <textarea
          ref={inputRef}
          defaultValue=""
          onChange={(e) => {
            persistDraft(e.target.value);
            setWords(countWords(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          rows={8}
          maxLength={MAX_CONTENT_CHARS}
          className="hero-chat-input"
          aria-label="Message"
        />
      </div>
      <p className="hero-chat-count">
        {words.toLocaleString()} / {MAX_CONTENT_WORDS.toLocaleString()} words
      </p>
    </div>
  );
}
