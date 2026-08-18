import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/15">
      <Link href="/" className="cosmic-title text-sm font-medium tracking-[0.28em]">
        Opinion.ai
      </Link>
      <nav className="flex items-center gap-8 text-sm">
        <Link href="/submit" className="nav-white">
          Evaluate
        </Link>
        <Link href="/history" className="nav-white">
          History
        </Link>
        <Link href="/pricing" className="nav-white">
          Pricing
        </Link>
      </nav>
    </header>
  );
}
