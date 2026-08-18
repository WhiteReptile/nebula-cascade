import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { CosmicBackground } from "@/components/CosmicBackground";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Opinion.ai",
  description: "Ask what we really think. No yes-men. Just opinions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CosmicBackground />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
      </body>
    </html>
  );
}
