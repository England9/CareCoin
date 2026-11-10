import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, ProgressBar, Section, StatTile } from "@/components/ui";
import { formatCoins, formatHours, formatLbs } from "@/lib/format";
import { levelProgress } from "@/lib/leveling";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = id === "me" ? session?.user?.id : id;
  if (id === "me" && !session?.user) redirect("/login?callbackUrl=/profile/me");
  if (!userId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: { include: { achievement: true } },
      charity: true,
      attendances: {
        where: { status: "VERIFIED" },
        include: { event: { include: { charity: true } } },
        orderBy: { verifiedAt: "desc" },
        take: 10,
      },
    },
  });
  if (!user) notFound();

  const lp = levelProgress(user.lifetimeCoins);
  const isSelf = session?.user?.id === user.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-[1.75rem] border border-teal-100 bg-white/85 p-5 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatarUrl ?? ""} alt="" className="h-20 w-20 rounded-2xl bg-teal-100" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold text-teal-950">{user.name}</h1>
            {user.isDemo ? <Badge tone="demo">Demo profile</Badge> : <Badge>Real account</Badge>}
            <Badge tone="slate">{user.role}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {user.city}, {user.state} · Level {user.level}
            {user.bio ? ` · ${user.bio}` : ""}
          </p>
          {user.isDemo ? (
            <p className="mt-2 text-xs text-sky-800">
              Sample statistics for demonstration. Not linked to live verified GPS activity.
            </p>
          ) : null}
        </div>
      </div>

      {user.role === "VOLUNTEER" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Coins balance" value={formatCoins(user.coins)} />
            <StatTile label="Lifetime coins" value={formatCoins(user.lifetimeCoins)} />
            <StatTile label="Hours" value={formatHours(user.totalHours)} />
            <StatTile label="Trash" value={formatLbs(user.trashLbs)} />
          </div>

          <div className="rounded-2xl border border-teal-100 bg-white/85 p-5">
            <p className="font-display text-lg font-bold text-teal-950">Level progress</p>
            <ProgressBar value={lp.progress} className="mt-3" />
            <p className="mt-2 text-xs text-slate-500">
              {formatCoins(lp.remaining)} coins to level {lp.level + 1} · streak {user.streakDays}d ·{" "}
              {user.eventsAttended} events
            </p>
          </div>

          <Section title="Badges">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {user.achievements.map((a) => (
                <div key={a.id} className="rounded-2xl border border-teal-100 bg-white p-3 text-center">
                  <div className="text-3xl">{a.achievement.icon}</div>
                  <p className="mt-1 text-sm font-bold">{a.achievement.name}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Recent verified impact">
            <div className="space-y-2">
              {user.attendances.map((a) => (
                <div key={a.id} className="rounded-xl border border-teal-100 bg-white/80 px-3 py-2 text-sm">
                  <p className="font-bold text-teal-950">{a.event.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.event.charity.name} · {a.hoursVerified} hrs · {a.trashLbsVerified} lbs · +
                    {formatCoins(a.coinsAwarded)} coins
                    {a.event.isDemo ? " · Demo event" : ""}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </>
      ) : null}

      {user.charity ? (
        <Section title="Organization">
          <div className="rounded-2xl border border-teal-100 bg-white/85 p-4">
            <p className="font-display text-xl font-bold">{user.charity.name}</p>
            <p className="mt-1 text-sm text-slate-600">{user.charity.description}</p>
            <div className="mt-2 flex gap-2">
              <Badge>{user.charity.status}</Badge>
              {user.charity.isDemo ? <Badge tone="demo">Demo</Badge> : null}
            </div>
          </div>
        </Section>
      ) : null}

      {isSelf ? (
        <p className="text-sm">
          <a href="/privacy" className="font-semibold text-teal-700 underline">
            Privacy settings & data deletion
          </a>
        </p>
      ) : null}
    </div>
  );
}
