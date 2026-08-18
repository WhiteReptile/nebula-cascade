import Link from "next/link";

export function HowButton() {
  return (
    <Link
      href="/how"
      className="how-btn-red fixed top-4 right-4 z-30 text-[10px] sm:text-xs px-4 py-2.5"
    >
      How does it work
    </Link>
  );
}
