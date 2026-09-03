import { studio } from "@/content/projects";

export function PortfolioHero() {
  return (
    <section className="relative px-6 pt-10 pb-16 sm:px-10 lg:px-16 sm:pt-16 sm:pb-24">
      <div className="max-w-4xl">
        <p className="mb-5 text-[11px] uppercase tracking-[0.4em] text-cyan-300/80 animate-fade-up">
          {studio.founder}
        </p>
        <h1 className="font-display text-[2.6rem] leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl animate-fade-up delay-1">
          Product, UI/UX, and{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300">
            vibe-coded
          </span>{" "}
          builds.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg animate-fade-up delay-2">
          Selected work in AI products, games, and film — designed and shipped solo,
          accelerated with AI pair programming. Clients: see the craft, the systems,
          and the live demos.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-3">
          <a href="#work" className="portfolio-cta">
            View work
          </a>
          <a href="#contact" className="portfolio-cta-ghost">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
