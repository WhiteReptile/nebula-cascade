export function OpinionLaunchCount({ count }: { count: number }) {
  const n = Number.isFinite(count) ? Math.max(0, Math.round(count)) : 0;
  const digits = String(n).split("");

  return (
    <div className="text-right shrink-0" aria-label={`${n} opinions given`}>
      <div className="launch-board">
        {digits.map((digit, index) => (
          <span key={`${n}-${index}`} className="launch-digit">
            <span className="launch-digit-face">{digit}</span>
          </span>
        ))}
      </div>
      <p className="label-white text-[10px] mt-2">Opinions given</p>
    </div>
  );
}
