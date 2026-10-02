import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/LegalDocument";
import { CONTENT_POLICY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "User Content & Copyright Policy · YourTruths",
  description: "User content and copyright policy for YourTruths.",
};

export default function ContentPolicyPage() {
  return (
    <>
      <LegalDocument doc={CONTENT_POLICY} />
      <div className="px-6 pb-16 max-w-2xl mx-auto w-full text-center">
        <Link href="/contact?topic=copyright#copyright" className="cosmic-cta-ghost inline-block text-sm px-8 py-2.5">
          Report a copyright concern
        </Link>
      </div>
    </>
  );
}
