import { studio } from "@/content/projects";

export function ContactSection() {
  const mail = `mailto:${studio.email}?subject=${encodeURIComponent("Project inquiry — Nebula Cascade")}`;

  return (
    <section id="contact" className="scroll-mt-24 px-6 py-20 sm:px-10 lg:px-16">
      <div className="portfolio-glass mx-auto max-w-5xl overflow-hidden px-8 py-12 sm:px-12 sm:py-14">
        <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">Contact</p>
        <h2 className="mt-4 max-w-xl font-display text-3xl tracking-tight text-white sm:text-4xl">
          Have a product, film, or brand that needs a sharp build?
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
          Tell me what you&apos;re shipping. I&apos;ll reply with availability and a clear
          next step.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href={mail} className="portfolio-cta">
            Email {studio.founder.split(" ")[0]}
          </a>
          <a
            href={studio.yourtruthsUrl}
            target="_blank"
            rel="noreferrer"
            className="portfolio-cta-ghost"
          >
            Visit YourTruths
          </a>
        </div>
      </div>
    </section>
  );
}
