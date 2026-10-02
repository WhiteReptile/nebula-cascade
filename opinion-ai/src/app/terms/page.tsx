import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { TERMS_OF_SERVICE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service · YourTruths",
  description: "Terms of Service for YourTruths.",
};

export default function TermsPage() {
  return <LegalDocument doc={TERMS_OF_SERVICE} />;
}
