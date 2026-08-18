import Link from "next/link";
import { PRICING_PACKAGES, PRICING_PROMISE } from "@/lib/pricing";

function Paloma() {
  return (
    <svg className="pricing-paloma" viewBox="0 0 20 20" aria-hidden>
      <path
        d="M2.8 11.2c1.6-.2 3.2.4 4.4 1.6 1.6-3.2 4.2-6.2 8.8-8.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 9.6c1.1-.9 2.4-1.4 3.8-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 flex-1">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-dynamic text-sm leading-relaxed">
          <Paloma />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  const standard = PRICING_PACKAGES.filter((pkg) => pkg.id !== "extended");
  const extended = PRICING_PACKAGES.find((pkg) => pkg.id === "extended");

  return (
    <div className="pricing-stage px-6 py-16 sm:py-20 max-w-5xl mx-auto w-full">
      <div className="pricing-lights" aria-hidden>
        <span className="pricing-spot" />
        <span className="pricing-beam pricing-beam-a" />
        <span className="pricing-beam pricing-beam-b" />
        <span className="pricing-floor" />
      </div>

      <div className="max-w-3xl mx-auto text-center mb-14">
        <h1 className="cosmic-title pricing-title font-light">Pricing</h1>
        <div className="cosmic-divider w-40 mx-auto mt-6" />
        <p className="text-white text-sm sm:text-base mt-6 tracking-wide">
          Independent opinions. No yes-men. Real humans when it matters.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {standard.map((pkg) => (
          <article
            key={pkg.id}
            className={`cosmic-glass p-6 flex flex-col ${pkg.id === "human-ai" ? "pricing-card-hot" : ""}`}
          >
            <p className="label-white text-[10px]">{pkg.name}</p>
            <p className="cosmic-title text-3xl font-light mt-3">{pkg.price}</p>
            <p className="text-white text-sm mt-4">{pkg.headline}</p>
            <div className="mt-3 space-y-2">
              {pkg.description.map((line) => (
                <p key={line} className="text-dynamic text-sm leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
            <FeatureList features={pkg.features} />
            <Link href={pkg.cta.href} className="cosmic-cta text-sm text-center mt-8 px-6 py-2.5">
              {pkg.cta.label}
            </Link>
          </article>
        ))}
      </div>

      {extended && (
        <article className="cosmic-glass p-6 mt-4">
          <p className="label-white text-[10px]">{extended.name}</p>
          <p className="cosmic-title text-3xl font-light mt-3">{extended.price}</p>
          <p className="text-white text-sm mt-4">{extended.headline}</p>
          <div className="mt-3 space-y-2 max-w-3xl">
            {extended.description.map((line) => (
              <p key={line} className="text-dynamic text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          {"featuresLabel" in extended && extended.featuresLabel && (
            <p className="text-white text-sm mt-6 mb-1">{extended.featuresLabel}</p>
          )}
          <ul className="grid gap-2.5 sm:grid-cols-2 mt-4">
            {extended.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-dynamic text-sm leading-relaxed">
                <Paloma />
                <span>{feature}</span>
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
