import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Section, StatTile } from "@/components/ui";
import { CharityVerifyPanel } from "./verify-panel";
import { CreateEventForm } from "./create-event-form";

export const dynamic = "force-dynamic";

export default async function CharityDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/charity");
  if (session.user.role !== "CHARITY" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const charity = await prisma.charity.findUnique({
    where: { userId: session.user.id },
    include: {
      events: {
        include: {
          attendances: {
            include: { user: { select: { id: true, name: true, avatarUrl: true, isDemo: true } } },
          },
          _count: { select: { signups: true } },
        },
        orderBy: { startAt: "desc" },
      },
    },
  });

  if (!charity) {
    return (
      <div className="rounded-2xl border border-teal-100 bg-white p-6">
        <h1 className="font-display text-2xl font-bold">No charity profile</h1>
        <p className="mt-2 text-sm text-slate-600">Register as a charity to access this dashboard.</p>
      </div>
    );
  }

  const pendingVerify = charity.events.flatMap((e) =>
    e.attendances
      .filter((a) => a.status === "CHECKED_OUT")
      .map((a) => ({
        attendanceId: a.id,
        eventTitle: e.title,
        eventId: e.id,
        volunteerName: a.user.name,
        volunteerId: a.user.id,
        isDemo: a.user.isDemo,
        hoursRequired: e.hoursRequired,
        category: e.category,
      }))
  );

  const verified = charity.events.flatMap((e) => e.attendances.filter((a) => a.status === "VERIFIED"));
  const totalHours = verified.reduce((s, a) => s + (a.hoursVerified || 0), 0);
  const totalTrash = verified.reduce((s, a) => s + (a.trashLbsVerified || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-extrabold text-teal-950">{charity.name}</h1>
          <Badge tone={charity.status === "APPROVED" ? "teal" : "coral"}>{charity.status}</Badge>
          {charity.isDemo ? <Badge tone="demo">Demo charity</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-slate-600">{charity.description}</p>
      </div>

      {charity.status !== "APPROVED" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Your charity is awaiting admin approval. You can explore the dashboard, but event creation unlocks after approval.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Events" value={`${charity.events.length}`} />
        <StatTile label="Verified hours" value={`${totalHours.toFixed(1)}`} />
        <StatTile label="Trash logged" value={`${totalTrash.toFixed(1)} lbs`} />
      </div>

      {charity.status === "APPROVED" ? <CreateEventForm charityId={charity.id} /> : null}

      <Section title="Verify volunteers" subtitle="Confirm hours and trash weights to award Care Coins.">
        <CharityVerifyPanel items={pendingVerify} />
      </Section>

      <Section title="Your events">
        <div className="space-y-3">
          {charity.events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-teal-100 bg-white/85 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/events/${e.id}`} className="font-display text-lg font-bold text-teal-950 hover:underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {format(e.startAt, "MMM d, yyyy · h:mm a")} · {e._count.signups} signups ·{" "}
                    {e.attendances.filter((a) => a.status === "VERIFIED").length} verified
                  </p>
                </div>
                <div className="flex gap-2">
                  {e.isSponsored ? <Badge tone="sponsored">Sponsored</Badge> : null}
                  {e.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Engagement analytics">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Checked out awaiting verify" value={`${pendingVerify.length}`} />
          <StatTile label="Verified attendances" value={`${verified.length}`} />
          <StatTile
            label="Avg hours / verified"
            value={verified.length ? (totalHours / verified.length).toFixed(1) : "0"}
          />
        </div>
      </Section>
    </div>
  );
}
