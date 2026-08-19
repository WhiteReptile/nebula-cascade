import type { Metadata } from "next";
import { Inter, Orbitron, Space_Grotesk } from "next/font/google";
import { PublicShell } from "@/components/PublicShell";
import { getOpinionTotal } from "@/lib/opinion-count";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "Opinion.ai",
  description: "An AI designed to give unbiased, real opinions of your work.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const opinionCount = await getOpinionTotal();

  return (
    <html lang="en" className={`${inter.variable} ${space.variable} ${orbitron.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <PublicShell opinionCount={opinionCount} />
        <main className="relative z-10 flex-1">{children}</main>
      </body>
    </html>
  );
}
