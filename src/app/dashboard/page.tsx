import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, ProgressBar, Section, StatTile } from "@/components/ui";
import { formatCoins, formatHours, formatLbs } from "@/lib/format";
import { levelProgress } from "@/lib/leveling";
import { DashboardAnimations } from "./dashboard-animations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "CHARITY") redirect("/charity");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      achievements: { include: { achievement: true }, orderBy: { unlockedAt: "desc" } },
      attendances: {
        include: { event: { include: { charity: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      coinTransactions: { orderBy: { createdAt: "desc" }, take: 8 },
      redemptions: { include: { reward: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!user) redirect("/login");

  const charitiesSupported = await prisma.attendance.findMany({
    where: { userId: user.id, status: "VERIFIED" },
    include: { event: { include: { charity: true } } },
  });
  const charitySet = Array.from(
    new Map(charitiesSupported.map((a) => [a.event.charityId, a.event.charity])).values()
  );
  const sdgCounts = charitiesSupported.reduce<Record<number, number>>((acc, a) => {
    acc[a.event.sdg] = (acc[a.event.sdg] || 0) + 1;
    return acc;
  }, {});

  const rewards = await prisma.reward.findMany({ orderBy: { coinCost: "asc" } });
  const nextReward = rewards.find((r) => r.coinCost > user.coins) ?? rewards[rewards.length - 1];
  const lp = levelProgress(user.lifetimeCoins);

  return (
    <div className="space-y-8">
      <DashboardAnimations level={user.level} coins={user.coins} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-teal-950">Hey, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-slate-600">Your volunteering impact, coins, and streak at a glance.</p>
        </div>
        <Link href="/discover" className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">
          Find events
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Care Coins" value={formatCoins(user.coins)} hint={`${formatCoins(user.lifetimeCoins)} lifetime`} />
        <StatTile label="Volunteer hours" value={formatHours(user.totalHours)} />
        <StatTile label="Trash collected" value={formatLbs(user.trashLbs)} />
        <StatTile label="Events attended" value={`${user.eventsAttended}`} hint={`Streak ${user.streakDays} days`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-teal-100 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Level {lp.level}</p>
          <p className="mt-1 font-display text-xl font-bold text-teal-950">Progress to level {lp.level + 1}</p>
          <ProgressBar value={lp.progress} className="mt-3" />
          <p className="mt-2 text-xs text-slate-500">{formatCoins(lp.remaining)} coins to next level</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Next demo reward</p>
          <p className="mt-1 font-display text-xl font-bold text-amber-950">{nextReward?.name}</p>
          <ProgressBar value={Math.min(1, user.coins / (nextReward?.coinCost || 1))} className="mt-3" barClassName="from-amber-500 to-orange-400" />
          <p className="mt-2 text-xs text-amber-900/70">
            {formatCoins(Math.max(0, (nextReward?.coinCost || 0) - user.coins))} coins to go ·{" "}
            <Link href="/rewards" className="font-semibold underline">
              Open store
            </Link>
          </p>
        </div>
      </div>

      <Section title="Achievement badges" subtitle="Milestones for hours, trash, events, coins, and streaks.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {user.achievements.map((ua) => (
            <div key={ua.id} className="rounded-2xl border border-teal-100 bg-white p-3 text-center shadow-sm">
              <div className="text-3xl">{ua.achievement.icon}</div>
              <p className="mt-2 text-sm font-bold text-teal-950">{ua.achievement.name}</p>
              <p className="text-xs text-slate-500">{ua.achievement.description}</p>
            </div>
          ))}
          {user.achievements.length === 0 ? (
            <p className="col-span-full text-sm text-slate-500">Complete verified events to unlock badges.</p>
          ) : null}
        </div>
      </Section>

      <Section title="Volunteering history">
        <div className="space-y-2">
          {user.attendances.map((a) => (
            <Link
              key={a.id}
              href={`/events/${a.eventId}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-100 bg-white/80 px-3 py-3"
            >
              <div>
                <p className="text-sm font-bold text-teal-950">{a.event.title}</p>
                <p className="text-xs text-slate-500">
                  {a.event.charity.name} · {a.status.replaceAll("_", " ")}
                  {a.hoursVerified != null ? ` · ${a.hoursVerified} hrs` : ""}
                  {a.trashLbsVerified != null ? ` · ${a.trashLbsVerified} lbs` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {a.event.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                {a.coinsAwarded > 0 ? <Badge tone="gold">+{formatCoins(a.coinsAwarded)}</Badge> : null}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Supported charities">
          <div className="flex flex-wrap gap-2">
            {charitySet.map((c) => (
              <Badge key={c.id} tone="teal">
                {c.name}
              </Badge>
            ))}
            {charitySet.length === 0 ? <p className="text-sm text-slate-500">No verified events yet.</p> : null}
          </div>
        </Section>
        <Section title="SDG contributions">
          <div className="flex flex-wrap gap-2">
            {Object.entries(sdgCounts).map(([sdg, count]) => (
              <Badge key={sdg} tone="slate">
                SDG {sdg} · {count}
              </Badge>
            ))}
            {Object.keys(sdgCounts).length === 0 ? (
              <p className="text-sm text-slate-500">SDG tags appear after verified participation.</p>
            ) : null}
          </div>
        </Section>
      </div>

      <Section title="Privacy & data" subtitle="You control demographics sharing and can delete your data.">
        <Link href="/privacy" className="text-sm font-semibold text-teal-700 underline">
          Manage privacy settings
        </Link>
      </Section>
    </div>
  );
}
