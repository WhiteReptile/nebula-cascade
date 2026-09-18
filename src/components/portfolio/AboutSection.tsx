import { studio } from "@/content/projects";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">About</p>
          <h2 className="mt-4 font-display text-3xl tracking-tight text-white sm:text-4xl">
            Built to look intentional — and ship.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-slate-300">
          <p>
            I design and build product surfaces end-to-end: brand-first heroes,
            interaction systems, and the engineering that makes them real. Recent work
            spans AI evaluation products, cinematic film landings, and web games.
          </p>
          <p>
            A lot of this portfolio was vibe-coded — clear product taste, fast iteration,
            and AI as a pair programmer — without losing craft on typography, motion,
            and hierarchy.
          </p>
          <p className="text-sm text-slate-400">
            Studio: {studio.name}. Based online at {studio.domain.replace("https://", "")}.
          </p>
        </div>
      </div>
    </section>
  );
}
