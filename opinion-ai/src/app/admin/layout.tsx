import type { Metadata } from "next";
import { BackArrow } from "@/components/BackArrow";

export const metadata: Metadata = {
  title: { absolute: "Review" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative z-10 px-6 pt-6">
        <BackArrow fallback="/" hideOnHome={false} />
      </div>
      {children}
    </>
  );
}
