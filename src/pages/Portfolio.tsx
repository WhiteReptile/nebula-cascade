import { PortfolioBackground } from "@/components/portfolio/PortfolioBackground";
import { PortfolioNav } from "@/components/portfolio/PortfolioNav";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { AboutSection } from "@/components/portfolio/AboutSection";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { PROJECTS, studio } from "@/content/projects";

export default function Portfolio() {
  return (
    <div className="relative min-h-screen text-white">
      <PortfolioBackground />
      <PortfolioNav active="work" />
      <main>
        <PortfolioHero />

        <section id="work" className="scroll-mt-24 px-6 pb-8 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
                  Selected work
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-white sm:text-4xl">
                  Projects clients can open.
                </h2>
              </div>
              <p className="hidden max-w-xs text-right text-xs leading-relaxed text-slate-400 sm:block">
                UI/UX, product systems, and vibe-coded engineering — including AI-assisted builds.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-1">
              {PROJECTS.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        <AboutSection />
        <ContactSection />
      </main>

      <footer className="px-6 pb-10 pt-4 text-[11px] uppercase tracking-[0.28em] text-slate-500 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {studio.name}
          </span>
          <span className="normal-case tracking-normal text-slate-500">
            {studio.founder} · {studio.domain.replace("https://", "")}
          </span>
        </div>
      </footer>
    </div>
  );
}
