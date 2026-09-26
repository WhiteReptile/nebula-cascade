import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { CONTENT_POLICY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "User Content & Copyright Policy · YourTruths",
  description: "User content and copyright policy for YourTruths.",
};

export default function ContentPolicyPage() {
  return <LegalDocument doc={CONTENT_POLICY} />;
}
