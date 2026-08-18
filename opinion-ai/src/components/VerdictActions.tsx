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
        className="text-[#66ffee]/60 hover:text-[#66ffee] transition-colors"
      >
        Share
      </button>
      <a
        href={`/submit?revision=${verdictId}`}
        className="text-violet-300/60 hover:text-violet-200 transition-colors"
      >
        Submit revision
      </a>
    </div>
  );
}
