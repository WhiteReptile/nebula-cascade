import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { AI_DISCLAIMER } from "@/lib/legal";

export const metadata: Metadata = {
  title: "AI Disclaimer · YourTruths",
  description: "AI disclaimer for YourTruths evaluations.",
};

export default function AiDisclaimerPage() {
  return <LegalDocument doc={AI_DISCLAIMER} />;
}
