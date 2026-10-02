"use client";

import { persistDraft } from "@/components/HeroDraft";
import { PdfNeedModal } from "@/components/PdfNeedModal";
import {
  countWords,
  dispatchNeedPdf,
  isOverWordLimit,
  MAX_CONTENT_CHARS,
  MAX_CONTENT_WORDS,
  NEED_PDF_EVENT,
} from "@/lib/content-limits";
import { useEffect, useRef, useState } from "react";

export function HeroChat() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [words, setWords] = useState(0);
  const [needPdf, setNeedPdf] = useState(false);
  const wasOver = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("opinion-ai-draft")?.trim() ?? "";
      if (saved && inputRef.current && !inputRef.current.value) {
        inputRef.current.value = saved;
        const next = countWords(saved);
        setWords(next);
        wasOver.current = isOverWordLimit(saved);
      }
    } catch {
      /* private mode */
    }

    function onNeed() {
      setNeedPdf(true);
    }
    window.addEventListener(NEED_PDF_EVENT, onNeed);
    return () => window.removeEventListener(NEED_PDF_EVENT, onNeed);
  }, []);

  return (
    <>
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
              const next = countWords(e.target.value);
              setWords(next);
              const over = isOverWordLimit(e.target.value);
              if (over && !wasOver.current) {
                dispatchNeedPdf();
              }
              wasOver.current = over;
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
      <PdfNeedModal open={needPdf} onClose={() => setNeedPdf(false)} variant="home" />
    </>
  );
}
