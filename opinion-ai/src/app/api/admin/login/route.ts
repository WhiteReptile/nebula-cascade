import { NextResponse } from "next/server";
import { passwordMatches, setAdminCookie } from "@/lib/admin-auth";
import { publicRedirect } from "@/lib/public-origin";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return fail(request, "Admin is not configured.", 500);
  }

  try {
    const password = await readPassword(request);
    if (!passwordMatches(password)) {
      return fail(request, "Wrong password.", 401);
    }
    const wantsJson = request.headers.get("accept")?.includes("application/json") && !isForm(request);
    if (wantsJson) {
      const res = NextResponse.json({ ok: true });
      setAdminCookie(res, request);
      return res;
    }
    const res = publicRedirect(request, "/admin", 303);
    setAdminCookie(res, request);
    return res;
  } catch {
    return fail(request, "Login failed.", 500);
  }
}

function isForm(request: Request): boolean {
  const type = request.headers.get("content-type") ?? "";
  return type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
}

async function readPassword(request: Request): Promise<string> {
  if (isForm(request)) {
    const form = await request.formData();
    const value = form.get("password");
    return typeof value === "string" ? value : "";
  }
  const body = await request.json();
  return typeof body.password === "string" ? body.password : "";
}

function fail(request: Request, message: string, status: number) {
  if (isForm(request) || !request.headers.get("accept")?.includes("application/json")) {
    const params = new URLSearchParams({ error: message === "Wrong password." ? "wrong" : "failed" });
    return publicRedirect(request, `/admin?${params.toString()}`, 303);
  }
  return NextResponse.json({ error: message }, { status });
}
