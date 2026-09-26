import type { Metadata } from "next";
import { CONTACT_PAGE, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact · YourTruths",
  description: "Contact YourTruths for support, privacy, and legal requests.",
};

export default function ContactPage() {
  return (
    <article className="px-6 py-16 sm:py-20 max-w-2xl mx-auto w-full">
      <header className="mb-10 text-center">
        <h1 className="cosmic-title font-light text-[1.5625rem] sm:text-[1.75rem]">{CONTACT_PAGE.title}</h1>
        <p className="text-dynamic text-xs mt-4 opacity-80">Updated: {LEGAL_EFFECTIVE_DATE}</p>
      </header>

      <p className="text-dynamic text-sm leading-relaxed mb-8">{CONTACT_PAGE.intro}</p>

      <div className="cosmic-glass p-5 mb-8">
        <p className="label-white text-[10px] mb-3">Email</p>
        <a href={`mailto:${CONTACT_PAGE.email}`} className="nav-white text-sm break-all">
          {CONTACT_PAGE.email}
        </a>
      </div>

      <ul className="space-y-3 list-disc pl-5">
        {CONTACT_PAGE.notes.map((note) => (
          <li key={note} className="text-dynamic text-sm leading-relaxed">
            {note}
          </li>
        ))}
      </ul>
    </article>
  );
}
