import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCompact, formatCoins } from "@/lib/format";
import { FadeIn, Badge, Button } from "@/components/ui";
import { ArrowRight, MapPin, ShieldCheck, Trophy, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, topVolunteers, featuredEvents] = await Promise.all([
    prisma.communityStat.findUnique({ where: { id: "global" } }),
    prisma.user.findMany({
      where: { role: "VOLUNTEER" },
      orderBy: { lifetimeCoins: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        lifetimeCoins: true,
        totalHours: true,
        trashLbs: true,
        isDemo: true,
        city: true,
      },
    }),
    prisma.event.findMany({
      where: { startAt: { gte: new Date() } },
      include: { charity: true },
      orderBy: [{ isSponsored: "desc" }, { startAt: "asc" }],
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-14">
      <section className="hero-plane relative overflow-hidden rounded-[2rem] px-6 py-12 text-white shadow-soft sm:px-10 sm:py-16">
        <div className="absolute -right-8 top-6 h-40 w-40 rounded-full bg-amber-300/30 blur-2xl floaty" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <FadeIn className="relative max-w-xl">
          <p className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Care Coin
          </p>
          <p className="mt-2 text-lg font-semibold text-amber-200 sm:text-xl">
            Get Paid to Care.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            Discover nearby volunteering, verify your impact with GPS check-in, and earn Care Coins
            for hours that matter.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/discover">
              <Button size="lg" className="bg-white text-teal-900 hover:bg-amber-100">
                Find events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                Join as volunteer
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      <FadeIn delay={0.1} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Community hours", value: formatCompact(stats?.totalHours ?? 0), icon: <ShieldCheck className="h-4 w-4 text-teal-700" /> },
          { label: "Trash removed", value: `${formatCompact(stats?.totalTrashLbs ?? 0)} lbs`, icon: <MapPin className="h-4 w-4 text-teal-700" /> },
          { label: "Care Coins earned", value: formatCompact(stats?.totalCoinsEarned ?? 0), icon: <Coins className="h-4 w-4 text-amber-600" /> },
          { label: "Active volunteers", value: formatCompact(stats?.totalVolunteers ?? 0), icon: <Trophy className="h-4 w-4 text-teal-700" /> },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700/70">{s.label}</p>
              {s.icon}
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-teal-950">{s.value}</p>
          </div>
        ))}
      </FadeIn>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-teal-950">Featured opportunities</h2>
          <div className="space-y-3">
            {featuredEvents.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="block rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {e.isSponsored ? <Badge tone="sponsored">Sponsored</Badge> : null}
                  {e.isDemo ? <Badge tone="demo">Demo event</Badge> : null}
                  <Badge>SDG {e.sdg}</Badge>
                </div>
                <p className="mt-2 font-display text-lg font-bold text-teal-950">{e.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {e.charity.name} · {e.city}, {e.state} · {e.baseCoinReward}+ coins
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-teal-950">Top carers</h2>
          <div className="space-y-2 rounded-2xl border border-teal-100 bg-white/80 p-3 shadow-sm">
            {topVolunteers.map((v, i) => (
              <Link
                key={v.id}
                href={`/profile/${v.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-teal-50"
              >
                <span className="w-6 text-sm font-bold text-teal-700">#{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.avatarUrl ?? ""} alt="" className="h-9 w-9 rounded-full bg-teal-100" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-teal-950">
                    {v.name} {v.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.totalHours.toFixed(0)} hrs · {v.trashLbs.toFixed(0)} lbs trash
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-700">{formatCoins(v.lifetimeCoins)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-teal-100 bg-white/70 p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold text-teal-950">How Care Coin works</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Show up", d: "Find events on the map, register, and check in with GPS geofencing." },
            { t: "Get verified", d: "Charities confirm hours and trash collected before rewards issue." },
            { t: "Earn & redeem", d: "Climb leaderboards, unlock badges, and try the demo rewards store." },
          ].map((step, i) => (
            <div key={step.t} className="rounded-2xl bg-teal-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Step {i + 1}</p>
              <p className="mt-1 font-display text-lg font-bold text-teal-950">{step.t}</p>
              <p className="mt-2 text-sm text-slate-600">{step.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Demo logins: volunteer@carecoin.app · charity@carecoin.app · admin@carecoin.app — password{" "}
          <code className="rounded bg-slate-100 px-1">password123</code>
        </p>
      </section>
    </div>
  );
}
