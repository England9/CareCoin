import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Section } from "@/components/ui";
import { DiscoverClient } from "./discover-client";
import { SDGS } from "@/lib/sdgs";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const sdg = sp.sdg ? Number(sp.sdg) : undefined;
  const city = sp.city;
  const charityId = sp.charity;
  const q = sp.q?.toLowerCase();

  const charities = await prisma.charity.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true },
  });

  const events = await prisma.event.findMany({
    where: {
      ...(sdg ? { sdg } : {}),
      ...(city ? { city } : {}),
      ...(charityId ? { charityId } : {}),
      charity: { status: "APPROVED" },
    },
    include: {
      charity: { select: { id: true, name: true } },
      _count: { select: { signups: true } },
    },
    orderBy: [{ isSponsored: "desc" }, { startAt: "asc" }],
  });

  const filtered = q
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.charity.name.toLowerCase().includes(q)
      )
    : events;

  const cities = Array.from(new Set(events.map((e) => e.city))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Discover events</h1>
        <p className="mt-1 text-sm text-slate-600">
          Explore the map and feed. Filter by city, charity, date window, and UN SDG.
        </p>
      </div>

      <DiscoverClient
        events={filtered.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          lat: e.lat,
          lng: e.lng,
          city: e.city,
          state: e.state,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt.toISOString(),
          sdg: e.sdg,
          isSponsored: e.isSponsored,
          isDemo: e.isDemo,
          baseCoinReward: e.baseCoinReward,
          hoursRequired: e.hoursRequired,
          charityName: e.charity.name,
          signupCount: e._count.signups,
          category: e.category,
        }))}
        cities={cities}
        charities={charities}
        sdgs={[...SDGS]}
        initial={{ city, charity: charityId, sdg: sp.sdg, q: sp.q }}
      />

      <Section title="Quick SDG filters" subtitle="Jump into causes aligned with the UN goals.">
        <div className="flex flex-wrap gap-2">
          {SDGS.slice(0, 12).map((s) => (
            <Link key={s.id} href={`/discover?sdg=${s.id}`}>
              <Badge className="hover:opacity-80" tone="slate">
                {s.id}. {s.name}
              </Badge>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
