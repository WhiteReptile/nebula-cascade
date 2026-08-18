import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
      <Link href="/" className="cosmic-title text-sm font-medium tracking-[0.2em] uppercase">
        Opinion.ai
      </Link>
      <nav className="flex items-center gap-8 text-sm text-violet-200/60">
        <Link href="/submit" className="hover:text-[#66ffee] transition-colors duration-300">
          Evaluate
        </Link>
        <Link href="/history" className="hover:text-[#66ffee] transition-colors duration-300">
          History
        </Link>
      </nav>
    </header>
  );
}
