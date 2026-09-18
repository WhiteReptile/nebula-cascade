import { Link } from "react-router-dom";
import { studio } from "@/content/projects";

export function PortfolioNav({ active }: { active?: "work" | "about" | "contact" }) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-16">
      <Link to="/" className="group inline-flex flex-col">
        <span className="font-display text-sm tracking-[0.28em] uppercase text-white">
          {studio.name}
        </span>
        <span className="text-[10px] tracking-[0.22em] uppercase text-cyan-200/50 transition group-hover:text-cyan-200/80">
          Studio · {studio.founder}
        </span>
      </Link>
      <nav className="flex items-center gap-5 sm:gap-8 text-[11px] uppercase tracking-[0.28em] text-slate-300">
        <a
          href="/#work"
          className={active === "work" ? "text-cyan-300" : "hover:text-white transition"}
        >
          Work
        </a>
        <a
          href="/#about"
          className={active === "about" ? "text-cyan-300" : "hover:text-white transition"}
        >
          About
        </a>
        <a
          href="/#contact"
          className={active === "contact" ? "text-cyan-300" : "hover:text-white transition"}
        >
          Contact
        </a>
        <Link to="/film" className="hidden sm:inline hover:text-white transition">
          Film
        </Link>
      </nav>
    </header>
  );
}
