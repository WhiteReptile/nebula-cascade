import { Link, Navigate, useParams } from "react-router-dom";
import { PortfolioBackground } from "@/components/portfolio/PortfolioBackground";
import { PortfolioNav } from "@/components/portfolio/PortfolioNav";
import { getProject, studio } from "@/content/projects";

const CASE_COPY: Record<
  string,
  { problem: string; approach: string; outcome: string; sections: { title: string; body: string }[] }
> = {
  yourtruths: {
    problem:
      "Creators need an honest take on their work — not flattery. Writing and PDFs should be instant; music, video, and images need a real human eye.",
    approach:
      "Designed a cosmic dark product surface with clear category tabs. Text and PDFs go through instant AI evaluation. Visual and audio work enter a human review queue; AI rewrites reviewer notes into a public opinion.",
    outcome:
      "A coherent product story: readable work → Text, visual work → Images. SSR-safe submit flows so the UI works even when JavaScript is slow or blocked.",
    sections: [
      {
        title: "Product split",
        body: "Text accepts paste or PDF upload with server-side extraction. Images replaced the old Documents tab so posters and ads aren’t confused with manuscripts.",
      },
      {
        title: "UI / UX",
        body: "Brand-first hero, glass panels, nebula atmosphere, and category tabs as real links — not dead client-only controls.",
      },
      {
        title: "Vibe coding",
        body: "Shipped with AI pair programming: pipeline, queue, admin review, and Cloudflare preview hardening — with human taste on hierarchy and copy.",
      },
    ],
  },
  "nebula-cascade": {
    problem:
      "Nebula Cascade needed a public film presence and a private path into the game for playtesters — without mixing marketing and gated systems.",
    approach:
      "Built a full-bleed film landing with poster, trailer, synopsis, and credits. Game access sits behind a passphrase gate so the public site stays cinematic.",
    outcome:
      "A clean split: film marketing for everyone, game systems for authorized sessions — now linked from the studio portfolio hub.",
    sections: [
      {
        title: "Film landing",
        body: "Edge-to-edge poster hero, trailer embed, synopsis and credits — designed as one composition, not a dashboard.",
      },
      {
        title: "Game systems",
        body: "Puzzle play, marketplace, leaderboard, and rewards live behind the gate — cyber-retro UI aligned with the Nebula world.",
      },
      {
        title: "Studio hub",
        body: "The portfolio homepage now introduces both film and game as related work under Nebula Cascade.",
      },
    ],
  },
};

export default function WorkCase() {
  const { slug } = useParams<{ slug: string }>();
  const project =
    slug === "nebula-cascade"
      ? getProject("nebula-film")
      : slug
        ? getProject(slug)
        : undefined;
  const copy = slug ? CASE_COPY[slug] : undefined;

  if (!project || !copy) {
    return <Navigate to="/" replace />;
  }

  const live = project.liveHref ? (
    project.liveExternal ? (
      <a
        href={project.liveHref}
        target="_blank"
        rel="noreferrer"
        className="portfolio-cta"
      >
        Open live demo
      </a>
    ) : (
      <Link to={project.liveHref} className="portfolio-cta">
        Open project
      </Link>
    )
  ) : null;

  return (
    <div className="relative min-h-screen text-white">
      <PortfolioBackground />
      <PortfolioNav />
      <main className="px-6 pb-20 pt-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/#work"
            className="text-[11px] uppercase tracking-[0.28em] text-slate-400 hover:text-white transition"
          >
            ← Work
          </Link>
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-cyan-300/80">
            {project.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-5xl">
            {slug === "nebula-cascade" ? "Nebula Cascade" : project.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300">{project.pitch}</p>
          <div className="mt-6 flex flex-wrap gap-3">{live}</div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
            <img
              src={project.image}
              alt={project.imageAlt}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              ["Problem", copy.problem],
              ["Approach", copy.approach],
              ["Outcome", copy.outcome],
            ].map(([label, body]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">{label}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 space-y-10">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Role: {project.role}. Questions?{" "}
            <a className="text-cyan-300 hover:underline" href={`mailto:${studio.email}`}>
              {studio.email}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
