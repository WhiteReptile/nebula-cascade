"use client";

import { useEffect, useState } from "react";
import type { UsageOutlook } from "@/lib/llm-usage";

const LEVEL_COPY: Record<UsageOutlook["level"], string> = {
  calm: "Calm — lots of room",
  busy: "Busy — getting warmer",
  hot: "Hot — almost full",
  over: "Over — tank empty / rate limited",
};

export function AdminUsagePanel({ initial }: { initial: UsageOutlook }) {
  const [data, setData] = useState<UsageOutlook>(initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;

    async function tick() {
      try {
        const res = await fetch("/api/admin/usage", { cache: "no-store" });
        const json = (await res.json()) as UsageOutlook & { error?: string };
        if (stop) return;
        if (!res.ok) throw new Error(json.error ?? "Could not load usage");
        setData(json);
        setError(null);
      } catch (err) {
        if (!stop) setError(err instanceof Error ? err.message : "Could not load usage");
      }
    }

    const timer = setInterval(tick, 4000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);

  const maxBar = Math.max(1, ...data.hourChart.map((b) => b.count), 5);

  return (
    <div className="space-y-6">
      <div>
        <p className="label-white text-[10px] mb-2">AI request tank (live)</p>
        <p className="text-white text-sm mb-1">{LEVEL_COPY[data.level]}</p>
        <p className="text-dynamic text-xs">
          Updates every few seconds. Counts asks to the AI (text opinions + human-review rewrites).
        </p>
        {error && <p className="text-dynamic text-xs mt-2">Live refresh paused: {error}</p>}
      </div>

      <div className="cosmic-glass p-5 space-y-4">
        <Meter label="This minute" value={data.lastMinute} max={data.limits.requestsPerMinute} pct={data.minuteFillPct} />
        <Meter label="Today" value={data.today} max={data.limits.requestsPerDay} pct={data.dayFillPct} />
      </div>

      <div className="cosmic-glass p-5">
        <p className="label-white text-[10px] mb-4">Last 12 hours</p>
        <div className="flex items-end gap-1 h-28">
          {data.hourChart.map((bucket) => {
            const h = Math.max(4, Math.round((bucket.count / maxBar) * 100));
            return (
              <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[9px] text-white/50 tabular-nums">{bucket.count || ""}</span>
                <div
                  className="w-full rounded-sm bg-[#4ec4ff]/80"
                  style={{ height: `${h}%` }}
                  title={`${bucket.label}: ${bucket.count}`}
                />
                <span className="text-[8px] text-white/40 truncate w-full text-center">{bucket.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cosmic-glass p-5 space-y-2 text-sm">
        <p className="text-white">Today breakdown</p>
        <p className="text-dynamic text-xs">Text AI asks: {data.evaluateToday}</p>
        <p className="text-dynamic text-xs">Human-review AI rewrites: {data.humanReviewToday}</p>
        <p className="text-dynamic text-xs">Demo (no API key): {data.demoToday}</p>
        <div className="cosmic-divider my-3" />
        <p className="text-white">Room left today (rough)</p>
        <p className="text-dynamic text-xs">
          ~{data.peopleEstimate.light} more people if each asks once
        </p>
        <p className="text-dynamic text-xs">
          ~{data.peopleEstimate.heavy} more people if each uses all 5 free asks
        </p>
        <p className="text-dynamic text-xs mt-3">
          Free Groq tank: {data.limits.requestsPerMinute}/min · {data.limits.requestsPerDay}/day for the whole site
        </p>
        <p className="text-dynamic text-[10px] mt-2 opacity-70">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  max,
  pct,
}: {
  label: string;
  value: number;
  max: number;
  pct: number;
}) {
  const color =
    pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : pct >= 40 ? "bg-yellow-300" : "bg-[#4ec4ff]";
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-white">{label}</span>
        <span className="text-dynamic tabular-nums">
          {value} / {max} ({pct}%)
        </span>
      </div>
      <div className="h-3 w-full bg-white/10 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
