import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getDailyLimit } from "@/lib/constants";
import {
  hybridQueueOpen,
  llmDailyMaxCalls,
  publicOpen,
  queuePerHourLimit,
} from "@/lib/gates";
import { dataDir } from "@/lib/queue";

export const GUEST_COOKIE = "oa_guest";

type DayCount = { day: string; count: number };
type HourCount = { hour: string; count: number };

type RateStore = {
  guests: Record<string, DayCount>;
  ips: Record<string, DayCount>;
  llm: DayCount;
  queue: Record<string, HourCount>;
};

let writeChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hourKey(): string {
  return new Date().toISOString().slice(0, 13);
}

function storePath(): string {
  return `${dataDir()}/rate-limit.json`;
}

async function readStore(): Promise<RateStore> {
  await mkdir(dataDir(), { recursive: true });
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as RateStore;
    return {
      guests: parsed.guests && typeof parsed.guests === "object" ? parsed.guests : {},
      ips: parsed.ips && typeof parsed.ips === "object" ? parsed.ips : {},
      llm: parsed.llm?.day ? parsed.llm : { day: todayKey(), count: 0 },
      queue: parsed.queue && typeof parsed.queue === "object" ? parsed.queue : {},
    };
  } catch {
    return { guests: {}, ips: {}, llm: { day: todayKey(), count: 0 }, queue: {} };
  }
}

async function writeStore(store: RateStore): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(storePath(), `${JSON.stringify(store)}\n`, "utf8");
}

function bumpDay(entry: DayCount | undefined, day: string): DayCount {
  if (!entry || entry.day !== day) return { day, count: 1 };
  return { day, count: entry.count + 1 };
}

function readCookie(request: Request, name: string): string | undefined {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  const ip = forwarded || real || "local";
  return createHash("sha256").update(`${ip}:${todayKey()}`).digest("hex").slice(0, 24);
}

function guestId(request: Request): string {
  const existing = readCookie(request, GUEST_COOKIE)?.trim();
  if (existing && /^[0-9a-f-]{8,}$/i.test(existing)) return existing;
  return randomUUID();
}

export function attachGuestCookie(res: NextResponse, id: string, request?: Request): NextResponse {
  const proto = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const https = proto === "https" || process.env.NODE_ENV === "production";
  res.cookies.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    secure: https,
  });
  return res;
}

function jsonError(
  request: Request,
  guest: string,
  error: string,
  code: string,
  status: number,
): NextResponse {
  const res = NextResponse.json({ error, code }, { status });
  return attachGuestCookie(res, guest, request);
}

export async function guardFreeEvaluate(request: Request): Promise<NextResponse | { guestId: string }> {
  const guest = guestId(request);
  if (await isAdmin()) return { guestId: guest };
  if (!publicOpen()) {
    return jsonError(request, guest, "Free AI is closed right now.", "public_closed", 403);
  }

  const day = todayKey();
  const ip = clientIp(request);
  const limit = getDailyLimit();
  const llmMax = llmDailyMaxCalls();

  return enqueue(async () => {
    const store = await readStore();
    const guestCount = store.guests[guest]?.day === day ? store.guests[guest].count : 0;
    const ipCount = store.ips[ip]?.day === day ? store.ips[ip].count : 0;
    if (guestCount >= limit || ipCount >= limit) {
      return jsonError(
        request,
        guest,
        `Free limit is ${limit} AI opinions today. Come back tomorrow.`,
        "free_limit",
        429,
      );
    }
    const llmCount = store.llm.day === day ? store.llm.count : 0;
    if (llmCount >= llmMax) {
      return jsonError(
        request,
        guest,
        "AI is at today’s cap. Try again tomorrow.",
        "llm_cap",
        429,
      );
    }
    store.guests[guest] = bumpDay(store.guests[guest], day);
    store.ips[ip] = bumpDay(store.ips[ip], day);
    store.llm = bumpDay(store.llm, day);
    await writeStore(store);
    return { guestId: guest };
  });
}

export async function guardHybridQueue(request: Request): Promise<NextResponse | { guestId: string }> {
  const guest = guestId(request);
  if (await isAdmin()) return { guestId: guest };
  if (!hybridQueueOpen()) {
    return jsonError(
      request,
      guest,
      "Hybrid uploads are closed. Text AI is still open.",
      "hybrid_closed",
      403,
    );
  }

  const ip = clientIp(request);
  const hour = hourKey();
  const cap = queuePerHourLimit();

  return enqueue(async () => {
    const store = await readStore();
    const row = store.queue[ip];
    const count = row?.hour === hour ? row.count : 0;
    if (count >= cap) {
      return jsonError(
        request,
        guest,
        "Too many file uploads this hour. Try later.",
        "queue_limit",
        429,
      );
    }
    store.queue[ip] = { hour, count: count + 1 };
    await writeStore(store);
    return { guestId: guest };
  });
}
