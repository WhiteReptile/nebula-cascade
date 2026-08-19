"use client";

import { useState } from "react";
import type { AnalystOutput, SteelmanOutput } from "@/lib/types";

export function WhyPanel({ analyst, steelman }: { analyst: AnalystOutput; steelman: SteelmanOutput }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/15 pt-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="nav-white text-sm tracking-wide"
      >
        {open ? "▾ Hide why" : "▸ Why?"}
      </button>

      {open && (
        <div className="mt-8 space-y-8 text-sm">
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
      <h3 className="label-white text-[10px] mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="text-dynamic leading-relaxed pl-3 border-l border-[#4ec4ff]/30">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
