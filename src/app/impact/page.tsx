import { prisma } from "@/lib/prisma";
import { formatCompact, formatCoins } from "@/lib/format";
import { FadeIn, Section } from "@/components/ui";
import { MotionCounters } from "./motion-counters";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const [stats, topTrash, topHours, recent] = await Promise.all([
    prisma.communityStat.findUnique({ where: { id: "global" } }),
    prisma.user.findMany({
      where: { role: "VOLUNTEER" },
      orderBy: { trashLbs: "desc" },
      take: 5,
      select: { id: true, name: true, trashLbs: true, isDemo: true, avatarUrl: true },
    }),
    prisma.user.findMany({
      where: { role: "VOLUNTEER" },
      orderBy: { totalHours: "desc" },
      take: 5,
      select: { id: true, name: true, totalHours: true, isDemo: true, avatarUrl: true },
    }),
    prisma.attendance.findMany({
      where: { status: "VERIFIED" },
      include: {
        user: { select: { name: true, isDemo: true } },
        event: { select: { title: true, city: true } },
      },
      orderBy: { verifiedAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl font-extrabold text-teal-950 sm:text-4xl">
          Lifetime Impact
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Collective hours volunteered and pounds of trash removed by the Care Coin community — a
          social movement measured in real care.
        </p>
      </FadeIn>

      <MotionCounters
        hours={stats?.totalHours ?? 0}
        trash={stats?.totalTrashLbs ?? 0}
        volunteers={stats?.totalVolunteers ?? 0}
        coins={stats?.totalCoinsEarned ?? 0}
        events={stats?.totalEvents ?? 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Trash champions" subtitle="Pounds removed across cleanups.">
          <div className="space-y-2">
            {topTrash.map((u, i) => (
              <a key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2 border border-teal-100">
                <span className="w-6 font-bold text-teal-700">#{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.avatarUrl ?? ""} alt="" className="h-8 w-8 rounded-full" />
                <span className="flex-1 text-sm font-semibold">
                  {u.name} {u.isDemo ? "(demo)" : ""}
                </span>
                <span className="text-sm font-bold text-teal-800">{u.trashLbs.toFixed(0)} lbs</span>
              </a>
            ))}
          </div>
        </Section>
        <Section title="Hour heroes" subtitle="Time given to communities.">
          <div className="space-y-2">
            {topHours.map((u, i) => (
              <a key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2 border border-teal-100">
                <span className="w-6 font-bold text-teal-700">#{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.avatarUrl ?? ""} alt="" className="h-8 w-8 rounded-full" />
                <span className="flex-1 text-sm font-semibold">
                  {u.name} {u.isDemo ? "(demo)" : ""}
                </span>
                <span className="text-sm font-bold text-teal-800">{u.totalHours.toFixed(0)} hrs</span>
              </a>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Recent verified moments">
        <div className="space-y-2">
          {recent.map((r) => (
            <div key={r.id} className="rounded-xl border border-teal-100 bg-white/80 px-3 py-2 text-sm">
              <p className="font-semibold text-teal-950">
                {r.user.name} {r.user.isDemo ? "(demo)" : ""} completed {r.event.title}
              </p>
              <p className="text-xs text-slate-500">
                {r.event.city} · {r.hoursVerified} hrs · {r.trashLbsVerified} lbs · +
                {formatCoins(r.coinsAwarded)} coins
              </p>
            </div>
          ))}
        </div>
      </Section>

      <p className="text-xs text-slate-500">
        Community totals include seeded demo activity so the movement feels alive on day one. Live
        verified totals update when charities confirm participation.
        {" "}Aggregate figure snapshot: {formatCompact(stats?.totalHours ?? 0)} hrs ·{" "}
        {formatCompact(stats?.totalTrashLbs ?? 0)} lbs.
      </p>
    </div>
  );
}
