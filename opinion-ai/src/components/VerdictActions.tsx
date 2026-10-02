"use client";

interface VerdictActionsProps {
  verdictId: string;
  shareText: string;
}

export function VerdictActions({ verdictId, shareText }: VerdictActionsProps) {
  const mailto = `mailto:?subject=${encodeURIComponent("YourTruths opinion")}&body=${encodeURIComponent(shareText)}`;

  return (
    <div className="mt-12 flex flex-wrap gap-6 text-sm">
      <a href={mailto} className="nav-white">
        Share
      </a>
      <a href={`/submit?revision=${verdictId}`} className="nav-white">
        Submit revision
      </a>
    </div>
  );
}
