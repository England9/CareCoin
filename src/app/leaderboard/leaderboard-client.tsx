"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";
import { formatCoins, formatHours, formatLbs } from "@/lib/format";

type Row = {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  isDemo: boolean;
  coins: number;
  lifetimeCoins: number;
  totalHours: number;
  trashLbs: number;
  eventsAttended: number;
  level: number;
  streakDays: number;
  monthlyCoins: number;
  monthlyHours: number;
  monthlyTrash: number;
};

export function LeaderboardClient({
  volunteers,
  myId,
  myCity,
}: {
  volunteers: Row[];
  myId: string | null;
  myCity: string | null;
}) {
  const [scope, setScope] = useState<"global" | "monthly" | "local">("global");
  const [metric, setMetric] = useState<"coins" | "hours" | "trash">("coins");

  const ranked = useMemo(() => {
    let list = [...volunteers];
    if (scope === "local" && myCity) {
      list = list.filter((v) => v.city === myCity);
    }
    list.sort((a, b) => {
      const av =
        scope === "monthly"
          ? metric === "coins"
            ? a.monthlyCoins
            : metric === "hours"
              ? a.monthlyHours
              : a.monthlyTrash
          : metric === "coins"
            ? a.lifetimeCoins
            : metric === "hours"
              ? a.totalHours
              : a.trashLbs;
      const bv =
        scope === "monthly"
          ? metric === "coins"
            ? b.monthlyCoins
            : metric === "hours"
              ? b.monthlyHours
              : b.monthlyTrash
          : metric === "coins"
            ? b.lifetimeCoins
            : metric === "hours"
              ? b.totalHours
              : b.trashLbs;
      return bv - av;
    });
    return list;
  }, [volunteers, scope, metric, myCity]);

  function value(v: Row) {
    if (scope === "monthly") {
      if (metric === "coins") return formatCoins(v.monthlyCoins);
      if (metric === "hours") return formatHours(v.monthlyHours);
      return formatLbs(v.monthlyTrash);
    }
    if (metric === "coins") return formatCoins(v.lifetimeCoins);
    if (metric === "hours") return formatHours(v.totalHours);
    return formatLbs(v.trashLbs);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Leaderboards</h1>
        <p className="mt-1 text-sm text-slate-600">
          Rankings for Care Coins, volunteer hours, and trash collected. Demo profiles are clearly labeled.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["global", "monthly", "local"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-xl px-4 py-2 text-sm font-bold capitalize ${scope === s ? "bg-teal-700 text-white" : "border border-teal-200 bg-white text-teal-900"}`}
          >
            {s}{s === "local" && myCity ? ` · ${myCity}` : ""}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {([
          ["coins", "Total coins"],
          ["hours", "Volunteer hours"],
          ["trash", "Trash (lbs)"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMetric(k)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold ${metric === k ? "bg-amber-400 text-amber-950" : "bg-teal-50 text-teal-900"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-teal-100 bg-white/85 shadow-sm">
        {ranked.slice(0, 50).map((v, i) => (
          <Link
            key={v.id}
            href={`/profile/${v.id}`}
            className={`flex items-center gap-3 border-b border-teal-50 px-4 py-3 last:border-0 hover:bg-teal-50/60 ${v.id === myId ? "bg-amber-50/70" : ""}`}
          >
            <span className="w-8 font-display text-lg font-extrabold text-teal-700">
              {i + 1}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.avatarUrl ?? ""} alt="" className="h-10 w-10 rounded-full bg-teal-100" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-teal-950">
                {v.name}{" "}
                {v.isDemo ? <Badge tone="demo">Demo</Badge> : <Badge tone="teal">Verified activity</Badge>}
                {v.id === myId ? <Badge tone="gold">You</Badge> : null}
              </p>
              <p className="text-xs text-slate-500">
                Lv {v.level} · {v.city}, {v.state} · {v.eventsAttended} events · streak {v.streakDays}d
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-amber-700">{value(v)}</p>
              <p className="text-[10px] text-slate-400">sample stats linked to seed data</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
