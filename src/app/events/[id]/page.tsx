import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSdg } from "@/lib/sdgs";
import { Badge, Section, StatTile } from "@/components/ui";
import { EventActions } from "./event-actions";
import { formatCoins } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      charity: true,
      signups: { include: { user: { select: { id: true, name: true, avatarUrl: true, isDemo: true } } } },
      attendances: true,
      _count: { select: { signups: true } },
    },
  });
  if (!event) notFound();

  const sdg = getSdg(event.sdg);
  const myAttendance = session?.user
    ? event.attendances.find((a) => a.userId === session.user.id)
    : null;
  const signedUp = session?.user
    ? event.signups.some((s) => s.userId === session.user.id)
    : false;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[1.75rem] border border-teal-100 bg-white/85 shadow-sm">
        <div
          className="px-6 py-8 text-white"
          style={{
            background: `linear-gradient(120deg, ${sdg.color}cc, #0d7377 70%)`,
          }}
        >
          <div className="flex flex-wrap gap-2">
            {event.isSponsored ? <Badge tone="sponsored">Sponsored</Badge> : null}
            {event.isDemo ? <Badge tone="demo">Demo event</Badge> : null}
            <Badge tone="gold">SDG {event.sdg}: {sdg.name}</Badge>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold">{event.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">{event.description}</p>
          <p className="mt-4 text-sm text-white/80">
            Hosted by{" "}
            <Link href={`/profile/${event.charity.userId}`} className="font-semibold underline">
              {event.charity.name}
            </Link>
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="When" value={format(event.startAt, "MMM d")} hint={`${format(event.startAt, "h:mm a")} – ${format(event.endAt, "h:mm a")}`} />
          <StatTile label="Location" value={event.city} hint={`${event.address}, ${event.state}`} />
          <StatTile label="Rewards" value={`${formatCoins(event.baseCoinReward)}+`} hint={`Top bonus +${event.topCoinBonus}`} />
          <StatTile label="Signed up" value={`${event._count.signups}`} hint={`Capacity ${event.maxVolunteers}`} />
        </div>
      </div>

      <EventActions
        eventId={event.id}
        signedUp={signedUp}
        attendanceStatus={myAttendance?.status ?? null}
        geofenceRadiusM={event.geofenceRadiusM}
        eventLat={event.lat}
        eventLng={event.lng}
        hoursRequired={event.hoursRequired}
        isLoggedIn={!!session?.user}
        role={session?.user?.role ?? null}
      />

      <Section title="What to expect" subtitle="Hours, geofence verification, and charity confirmation.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4 border border-teal-100">
            <p className="font-display font-bold text-teal-950">Required hours</p>
            <p className="mt-1 text-sm text-slate-600">{event.hoursRequired} hours on site</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 border border-teal-100">
            <p className="font-display font-bold text-teal-950">Geofence</p>
            <p className="mt-1 text-sm text-slate-600">
              Check-in/out must be within {event.geofenceRadiusM}m of the venue. Precise GPS is requested only then.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 border border-teal-100">
            <p className="font-display font-bold text-teal-950">Category</p>
            <p className="mt-1 text-sm capitalize text-slate-600">{event.category.replaceAll("_", " ")}</p>
          </div>
        </div>
      </Section>

      <Section title="Volunteers signed up">
        <div className="flex flex-wrap gap-3">
          {event.signups.slice(0, 24).map((s) => (
            <Link key={s.id} href={`/profile/${s.user.id}`} className="flex items-center gap-2 rounded-full border border-teal-100 bg-white px-2 py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.user.avatarUrl ?? ""} alt="" className="h-7 w-7 rounded-full" />
              <span className="text-xs font-semibold text-teal-900">
                {s.user.name}
                {s.user.isDemo ? " · Demo" : ""}
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
