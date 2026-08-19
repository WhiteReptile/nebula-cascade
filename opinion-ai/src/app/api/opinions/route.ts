import { NextResponse } from "next/server";
import { getOpinionTotal } from "@/lib/opinion-count";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const count = await getOpinionTotal();
  return NextResponse.json({ count });
}
