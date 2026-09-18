"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="cosmic-cta-ghost text-sm px-4 py-1.5">
      Log out
    </button>
  );
}
