import type { ReactNode } from "react";
import type { HowPart } from "@/lib/how-copy";

export function HowParts({ parts }: { parts: readonly HowPart[] }): ReactNode {
  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <strong key={i} className="how-key">
        {part.key}
      </strong>
    ),
  );
}
