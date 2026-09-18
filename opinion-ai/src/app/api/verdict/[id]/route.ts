import { NextResponse } from "next/server";
import { getVerdictRecord } from "@/lib/verdict-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const verdict = await getVerdictRecord(id);
  if (!verdict) {
    return NextResponse.json({ error: "Verdict not found." }, { status: 404 });
  }
  return NextResponse.json({ verdict });
}
