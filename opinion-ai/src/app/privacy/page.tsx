import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { PRIVACY_POLICY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy · YourTruths",
  description: "Privacy Policy for YourTruths.",
};

export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY_POLICY} />;
}
