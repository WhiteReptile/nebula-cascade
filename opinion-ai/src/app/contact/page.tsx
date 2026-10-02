import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_PAGE, LEGAL_CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact · YourTruths",
  description: "Contact YourTruths for support, privacy, copyright, and legal requests.",
};

const COPYRIGHT_MAILTO = `mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(
  "YourTruths copyright notice",
)}&body=${encodeURIComponent(
  [
    "Copyright notice — please fill in:",
    "",
    "1. Your name and email:",
    "2. Description of the copyrighted work:",
    "3. Location / URL / job or result ID (if known):",
    "4. Statement of good-faith belief that the use is not authorized:",
    "5. Statement that the information is accurate and that you are the owner or authorized to act:",
    "6. Full name (electronic signature):",
    "",
  ].join("\n"),
)}`;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const params = await searchParams;
  const copyrightFocus = params.topic === "copyright";

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

      <section
        id="copyright"
        className={`cosmic-glass p-5 mb-8 ${copyrightFocus ? "ring-1 ring-[#4ec4ff]/50" : ""}`}
      >
        <p className="label-white text-[10px] mb-3">Copyright reports</p>
        <p className="text-dynamic text-sm leading-relaxed mb-4">
          To report alleged copyright infringement, email us with the details listed in the{" "}
          <Link href="/content-policy" className="nav-white">
            User Content &amp; Copyright Policy
          </Link>
          . You can start with a pre-filled message:
        </p>
        <a href={COPYRIGHT_MAILTO} className="cosmic-cta-ghost inline-block text-sm px-6 py-2.5">
          Report copyright concern
        </a>
      </section>

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
