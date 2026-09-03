type BrandMarkProps = {
  className?: string;
  size?: "nav" | "hero" | "inline";
};

const SIZE: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  nav: "brand-wordmark text-sm font-medium",
  hero: "brand-wordmark text-4xl sm:text-5xl",
  inline: "brand-wordmark text-[0.95em] font-medium inline",
};

/** Visible brand: Your (white) + Truths (red). */
export function BrandMark({ className = "", size = "nav" }: BrandMarkProps) {
  return (
    <span className={`${SIZE[size]} ${className}`.trim()} aria-label="YourTruths">
      <span className="brand-your">Your</span>
      <span className="brand-truths">Truths</span>
    </span>
  );
}

export const BRAND_NAME = "YourTruths";
