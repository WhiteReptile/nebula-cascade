import { Link } from "react-router-dom";
import type { Project } from "@/content/projects";

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  preview: "Demo soon",
  gated: "Private access",
};

export function ProjectCard({ project }: { project: Project }) {
  const live = project.liveHref ? (
    project.liveExternal ? (
      <a
        href={project.liveHref}
        target="_blank"
        rel="noreferrer"
        className="portfolio-cta text-[11px] px-5 py-2"
      >
        Live demo
      </a>
    ) : (
      <Link to={project.liveHref} className="portfolio-cta text-[11px] px-5 py-2">
        Open
      </Link>
    )
  ) : null;

  return (
    <article className="portfolio-glass group overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={project.image}
          alt={project.imageAlt}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/35 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-cyan-100/90 backdrop-blur">
          {statusLabel[project.status]}
        </span>
      </div>
      <div className="space-y-4 p-6 sm:p-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-300/70">
            {project.eyebrow}
          </p>
          <h3 className="mt-2 font-display text-2xl tracking-tight text-white">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{project.pitch}</p>
        </div>
        <p className="text-xs text-slate-400">
          <span className="text-slate-500 uppercase tracking-[0.18em]">Role · </span>
          {project.role}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] tracking-wide text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {live}
          <Link to={project.caseHref} className="portfolio-cta-ghost text-[11px] px-5 py-2">
            Case study
          </Link>
        </div>
      </div>
    </article>
  );
}
