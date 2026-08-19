"use client";

interface VerdictActionsProps {
  verdictId: string;
  shareText: string;
}

export function VerdictActions({ verdictId, shareText }: VerdictActionsProps) {
  return (
    <div className="mt-12 flex flex-wrap gap-6 text-sm">
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(shareText)}
        className="nav-white"
      >
        Share
      </button>
      <a href={`/submit?revision=${verdictId}`} className="nav-white">
        Submit revision
      </a>
    </div>
  );
}
