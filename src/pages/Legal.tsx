import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full font-mono overflow-auto" style={{ backgroundColor: '#050510' }}>
      <SEO
        title="NEBULA CASCADE — Terms"
        description="Terms of Service & Risk Disclosure"
        path="/legal"
      />

      <div className="max-w-4xl mx-auto px-4 py-12 md:px-8 text-slate-200">
        <h1 className="text-3xl font-bold mb-6">NEBULA CASCADE – TERMS OF SERVICE & RISK DISCLOSURE</h1>

        <section className="mb-4">
          <h2 className="font-semibold">1. ACCEPTANCE OF TERMS</h2>
          <p>
            By accessing or using Nebula Cascade (the "Platform"), you agree to be bound by these Terms of
            Service. If you do not agree, you must immediately cease all use of the Platform.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="font-semibold">2. ELIGIBILITY & JURISDICTION</h2>
          <p>
            You affirm that you are of legal age in your jurisdiction to enter into this agreement. These
            Terms and any disputes arising from your use of the Platform shall be governed exclusively by the
            laws of <strong>Mexico City, Mexico</strong>, without regard to conflict of law principles. You agree to
            submit to the personal jurisdiction of the courts located in Mexico City for any legal actions.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="font-semibold">3. NATURE OF SERVICE & NO FINANCIAL ADVICE</h2>
          <p>
            Nebula Cascade is an entertainment and digital collectible platform. All virtual assets, cards, or tokens
            used within the Platform are for entertainment purposes only. The Platform does not provide financial,
            investment, tax, or legal advice. Nothing on this Platform should be construed as an offer or solicitation
            to invest.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="font-semibold">4. ASSUMPTION OF RISK (DIGITAL ASSETS & VOLATILITY)</h2>
          <p>You explicitly acknowledge and agree that:</p>
          <ul className="list-disc list-inside ml-4">
            <li>
              Participating in platforms involving digital assets, collectibles, or blockchain technology carries
              inherent technological and financial risks.
            </li>
            <li>The value of digital assets can be extremely volatile and may drop to zero.</li>
            <li>
              You are entirely responsible for managing your own funds, digital wallets, and security. You
              participate at your own risk.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="font-semibold">5. LIMITATION OF LIABILITY & "AS-IS" SERVICE</h2>
          <p>
            The Platform is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either
            express or implied. To the maximum extent permitted by law, the developers, owners, and operators of
            Nebula Cascade shall not be liable for any direct, indirect, incidental, special, or consequential
            damages, including but not limited to loss of profits, data, use, or digital assets, resulting from your
            use or inability to use the Platform.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="font-semibold">6. INDEMNIFICATION</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Nebula Cascade, its creators, and affiliates from and
            against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with
            your access to or use of the Platform.
          </p>
        </section>

        <section className="mb-4">
          <p>
            <strong>Questions?</strong>
          </p>
        </section>

        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="menu-item-glow uppercase tracking-[0.2em] text-sm md:text-base bg-transparent border-none cursor-pointer px-4 py-2"
            style={{ color: '#66ffee' }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Legal;
