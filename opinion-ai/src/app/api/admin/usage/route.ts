import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getUsageOutlook } from "@/lib/llm-usage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const outlook = await getUsageOutlook();
  return NextResponse.json(outlook);
}
