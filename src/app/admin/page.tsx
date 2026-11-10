import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Section, StatTile } from "@/components/ui";
import { AdminActions } from "./admin-actions";
import { formatCoins } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [pendingCharities, disputes, flagged, stats, recentRedemptions] = await Promise.all([
    prisma.charity.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dispute.findMany({
      where: { status: "OPEN" },
      include: {
        volunteer: true,
        attendance: { include: { event: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attendance.findMany({
      where: {
        OR: [
          { status: "DISPUTED" },
          {
            AND: [
              { checkInLat: { not: null } },
              { status: { in: ["CHECKED_IN", "CHECKED_OUT"] } },
            ],
          },
        ],
      },
      include: {
        user: true,
        event: true,
      },
      take: 20,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.communityStat.findUnique({ where: { id: "global" } }),
    prisma.redemption.findMany({
      include: { user: true, reward: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Approve charities, review disputes, monitor check-ins, and oversee demo reward distribution.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pending charities" value={`${pendingCharities.length}`} />
        <StatTile label="Open disputes" value={`${disputes.length}`} />
        <StatTile label="Community hours" value={`${(stats?.totalHours ?? 0).toFixed(0)}`} />
        <StatTile label="Coins earned" value={formatCoins(stats?.totalCoinsEarned ?? 0)} />
      </div>

      <Section title="Approve charities">
        <AdminActions pendingCharities={pendingCharities.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          city: c.city,
          state: c.state,
          owner: c.user.name,
          email: c.user.email,
          isDemo: c.isDemo,
        }))} disputes={disputes.map((d) => ({
          id: d.id,
          reason: d.reason,
          volunteerName: d.volunteer.name,
          eventTitle: d.attendance.event.title,
          attendanceId: d.attendanceId,
        }))} />
      </Section>

      <Section title="Check-in monitoring" subtitle="Review recent GPS check-ins for anomalous patterns.">
        <div className="space-y-2">
          {flagged.map((a) => (
            <div key={a.id} className="rounded-xl border border-teal-100 bg-white/80 px-3 py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-teal-950">{a.user.name}</span>
                {a.user.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                <Badge>{a.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {a.event.title} · in ({a.checkInLat?.toFixed(4)}, {a.checkInLng?.toFixed(4)}) · out (
                {a.checkOutLat?.toFixed(4)}, {a.checkOutLng?.toFixed(4)})
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Reward distribution log" subtitle="Demo redemptions only — no real payouts.">
        <div className="space-y-2">
          {recentRedemptions.map((r) => (
            <div key={r.id} className="flex justify-between rounded-xl border border-teal-100 bg-white/80 px-3 py-2 text-sm">
              <span>
                {r.user.name} · {r.reward.name} <Badge tone="demo">Demo</Badge>
              </span>
              <span className="font-bold text-amber-700">-{formatCoins(r.coinCost)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
