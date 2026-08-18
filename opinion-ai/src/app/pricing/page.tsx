import Link from "next/link";
import { PRICING_PACKAGES, PRICING_PROMISE } from "@/lib/pricing";

export default function PricingPage() {
  const standard = PRICING_PACKAGES.filter((pkg) => pkg.id !== "extended");
  const extended = PRICING_PACKAGES.find((pkg) => pkg.id === "extended");

  return (
    <div className="px-6 py-16 sm:py-20 max-w-5xl mx-auto w-full">
      <div className="max-w-xl mx-auto text-center mb-10">
        <h1 className="cosmic-title text-xl font-light">Pricing</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {standard.map((pkg) => (
          <article key={pkg.id} className="cosmic-glass p-6 flex flex-col">
            <p className="label-white text-[10px]">{pkg.name}</p>
            <p className="cosmic-title text-2xl font-light mt-3">{pkg.price}</p>
            <p className="text-white text-sm mt-4">{pkg.headline}</p>
            <div className="mt-3 space-y-2">
              {pkg.description.map((line) => (
                <p key={line} className="text-dynamic text-sm leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
            <ul className="mt-5 space-y-2 flex-1">
              {pkg.features.map((feature) => (
                <li key={feature} className="text-dynamic text-sm leading-relaxed pl-3 border-l border-[#4ec4ff]/30">
                  {feature}
                </li>
              ))}
            </ul>
            <Link href={pkg.cta.href} className="cosmic-cta text-sm text-center mt-8 px-6 py-2.5">
              {pkg.cta.label}
            </Link>
          </article>
        ))}
      </div>

      {extended && (
        <article className="cosmic-glass p-6 mt-4">
          <p className="label-white text-[10px]">{extended.name}</p>
          <p className="cosmic-title text-2xl font-light mt-3">{extended.price}</p>
          <p className="text-white text-sm mt-4">{extended.headline}</p>
          <div className="mt-3 space-y-2 max-w-3xl">
            {extended.description.map((line) => (
              <p key={line} className="text-dynamic text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          {"featuresLabel" in extended && extended.featuresLabel && (
            <p className="text-white text-sm mt-6 mb-3">{extended.featuresLabel}</p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2">
            {extended.features.map((feature) => (
              <li key={feature} className="text-dynamic text-sm leading-relaxed pl-3 border-l border-[#4ec4ff]/30">
                {feature}
              </li>
            ))}
          </ul>
          {"footer" in extended && extended.footer && (
            <p className="text-dynamic text-sm leading-relaxed mt-6 max-w-3xl">{extended.footer}</p>
          )}
          <div className="mt-8">
            <Link href={extended.cta.href} className="cosmic-cta inline-block text-sm px-8 py-2.5">
              {extended.cta.label}
            </Link>
          </div>
        </article>
      )}

      <section className="cosmic-glass p-6 mt-4 text-center space-y-2">
        <p className="label-white text-[10px] mb-4">{PRICING_PROMISE.title}</p>
        {PRICING_PROMISE.lines.map((line) => (
          <p key={line} className="text-dynamic text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </section>
    </div>
  );
}
