import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { REFUND_POLICY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy · YourTruths",
  description: "Refund and cancellation policy for YourTruths.",
};

export default function RefundsPage() {
  return <LegalDocument doc={REFUND_POLICY} />;
}
