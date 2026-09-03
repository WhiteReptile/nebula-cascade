import { NextResponse } from "next/server";

export function publicOrigin(request: Request): string {
  const configured = process.env.PUBLIC_ORIGIN?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost?.split(",")[0]?.trim() || request.headers.get("host");
  if (!host) return new URL(request.url).origin;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto?.split(",")[0]?.trim() || new URL(request.url).protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function publicRedirect(request: Request, path: string, status = 307) {
  return NextResponse.redirect(new URL(path, publicOrigin(request)), status);
}
