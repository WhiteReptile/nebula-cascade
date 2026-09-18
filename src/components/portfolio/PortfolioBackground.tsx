export function PortfolioBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050510]" aria-hidden>
      <div
        className="portfolio-blob absolute -left-[12%] top-[8%] h-[520px] w-[520px] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(14,70,160,0.45) 0%, transparent 70%)" }}
      />
      <div
        className="portfolio-blob-delayed absolute -right-[8%] top-[35%] h-[480px] w-[480px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(0,160,180,0.28) 0%, transparent 70%)" }}
      />
      <div
        className="portfolio-blob absolute left-[30%] -bottom-[10%] h-[420px] w-[420px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(80,60,180,0.22) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,16,0.55)_55%,rgba(5,5,16,0.92)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
    </div>
  );
}
