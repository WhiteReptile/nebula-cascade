"use client";

import { useState } from "react";
import type { AnalystOutput, SteelmanOutput } from "@/lib/types";

export function WhyPanel({ analyst, steelman }: { analyst: AnalystOutput; steelman: SteelmanOutput }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/[0.06] pt-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-[#66ffee]/70 hover:text-[#66ffee] transition-colors tracking-wide"
      >
        {open ? "▾ Hide why" : "▸ Why?"}
      </button>

      {open && (
        <div className="mt-8 space-y-8 text-sm text-violet-100/65">
          <Section title="Analyst observations" items={analyst.observations} />
          {analyst.contradictions.length > 0 && (
            <Section title="Contradictions" items={analyst.contradictions} />
          )}
          <Section title="Steelman — case for" items={steelman.caseFor} />
          <Section title="Steelman — case against" items={steelman.caseAgainst} />
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.25em] text-violet-300/45 mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed pl-3 border-l border-[#66ffee]/15">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
