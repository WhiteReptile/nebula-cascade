import { LEGAL_EFFECTIVE_DATE, type LegalDoc } from "@/lib/legal";

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className="px-6 py-16 sm:py-20 max-w-2xl mx-auto w-full">
      <header className="mb-10 text-center">
        <h1 className="cosmic-title font-light text-[1.5625rem] sm:text-[1.75rem]">{doc.title}</h1>
        <p className="text-dynamic text-xs mt-4 opacity-80">Effective date: {LEGAL_EFFECTIVE_DATE}</p>
      </header>

      <p className="text-dynamic text-sm leading-relaxed mb-10">{doc.intro}</p>

      <div className="space-y-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="label-white text-[10px] mb-3">{section.heading}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph, i) => (
                <p key={`${section.heading}-p-${i}`} className="text-dynamic text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {section.bullets.map((item, i) => (
                    <li key={`${section.heading}-b-${i}`} className="text-dynamic text-sm leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
