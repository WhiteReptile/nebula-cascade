"use client";

import { usePathname } from "next/navigation";
import { CosmicBackground } from "@/components/CosmicBackground";
import { Header } from "@/components/Header";
import { HowButton } from "@/components/HowButton";

export function PublicShell() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <CosmicBackground />
      <Header />
      <HowButton />
    </>
  );
}
