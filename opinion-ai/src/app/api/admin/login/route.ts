import { NextResponse } from "next/server";
import { passwordMatches, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";
    if (!passwordMatches(password)) {
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    setAdminCookie(res);
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
