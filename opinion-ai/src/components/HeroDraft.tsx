"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const DRAFT_KEY = "opinion-ai-draft";

type HeroDraftContextValue = {
  draft: string;
  setDraft: (value: string) => void;
};

const HeroDraftContext = createContext<HeroDraftContextValue>({
  draft: "",
  setDraft: () => {},
});

export function persistDraft(value: string) {
  try {
    if (value.trim()) sessionStorage.setItem(DRAFT_KEY, value.trim());
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private mode */
  }
}

export function loadDraft(): string {
  try {
    return sessionStorage.getItem(DRAFT_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function HeroDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState("");

  return (
    <HeroDraftContext.Provider
      value={{
        draft,
        setDraft: (value) => {
          setDraft(value);
          persistDraft(value);
        },
      }}
    >
      {children}
    </HeroDraftContext.Provider>
  );
}

export function useHeroDraft() {
  return useContext(HeroDraftContext);
}
