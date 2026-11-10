"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventMap } from "@/components/event-map";
import { Badge, Button } from "@/components/ui";
import { format } from "date-fns";

type EventCard = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  startAt: string;
  endAt: string;
  sdg: number;
  isSponsored: boolean;
  isDemo: boolean;
  baseCoinReward: number;
  hoursRequired: number;
  charityName: string;
  signupCount: number;
  category: string;
};

export function DiscoverClient({
  events,
  cities,
  charities,
  sdgs,
  initial,
}: {
  events: EventCard[];
  cities: string[];
  charities: { id: string; name: string; city: string }[];
  sdgs: { id: number; name: string; color: string }[];
  initial: { city?: string; charity?: string; sdg?: string; q?: string };
}) {
  const router = useRouter();
  const [city, setCity] = useState(initial.city || "");
  const [charity, setCharity] = useState(initial.charity || "");
  const [sdg, setSdg] = useState(initial.sdg || "");
  const [q, setQ] = useState(initial.q || "");
  const [dateMode, setDateMode] = useState<"all" | "upcoming" | "past">("upcoming");

  const filtered = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => {
      const t = new Date(e.startAt).getTime();
      if (dateMode === "upcoming" && t < now) return false;
      if (dateMode === "past" && t >= now) return false;
      return true;
    });
  }, [events, dateMode]);

  const center = useMemo<[number, number]>(() => {
    if (!filtered.length) return [34.0195, -118.4912];
    const lat = filtered.reduce((s, e) => s + e.lat, 0) / filtered.length;
    const lng = filtered.reduce((s, e) => s + e.lng, 0) / filtered.length;
    return [lat, lng];
  }, [filtered]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (charity) params.set("charity", charity);
    if (sdg) params.set("sdg", sdg);
    if (q) params.set("q", q);
    router.push(`/discover?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={applyFilters} className="glass grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events"
          className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm lg:col-span-2"
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm">
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={charity} onChange={(e) => setCharity(e.target.value)} className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm">
          <option value="">All charities</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={sdg} onChange={(e) => setSdg(e.target.value)} className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm">
          <option value="">All SDGs</option>
          {sdgs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}. {s.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit">Apply filters</Button>
          <div className="flex overflow-hidden rounded-xl border border-teal-200">
            {(["upcoming", "past", "all"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDateMode(m)}
                className={`px-3 py-2 text-xs font-semibold capitalize ${dateMode === m ? "bg-teal-700 text-white" : "bg-white text-teal-900"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </form>

      <EventMap
        events={filtered}
        center={center}
        onSelect={(id) => router.push(`/events/${id}`)}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-teal-800">{filtered.length} events</p>
        {filtered.map((e) => (
          <Link
            key={e.id}
            href={`/events/${e.id}`}
            className="block rounded-2xl border border-teal-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-wrap gap-2">
              {e.isSponsored ? <Badge tone="sponsored">Sponsored placement</Badge> : null}
              {e.isDemo ? <Badge tone="demo">Demo</Badge> : null}
              <Badge>SDG {e.sdg}</Badge>
              <Badge tone="gold">{e.baseCoinReward}+ coins</Badge>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-teal-950">{e.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{e.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              {e.charityName} · {e.city}, {e.state} · {format(new Date(e.startAt), "MMM d, h:mm a")} ·{" "}
              {e.hoursRequired} hrs · {e.signupCount} signed up
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
