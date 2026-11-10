import { prisma } from "@/lib/prisma";
import { LeaderboardClient } from "./leaderboard-client";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await auth();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const volunteers = await prisma.user.findMany({
    where: { role: "VOLUNTEER" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      city: true,
      state: true,
      isDemo: true,
      coins: true,
      lifetimeCoins: true,
      totalHours: true,
      trashLbs: true,
      eventsAttended: true,
      level: true,
      streakDays: true,
    },
    orderBy: { lifetimeCoins: "desc" },
  });

  const monthlyAgg = await prisma.attendance.groupBy({
    by: ["userId"],
    where: {
      status: "VERIFIED",
      verifiedAt: { gte: monthStart },
    },
    _sum: { coinsAwarded: true, hoursVerified: true, trashLbsVerified: true },
  });
  const monthlyMap = new Map(monthlyAgg.map((m) => [m.userId, m]));

  const withMonthly = volunteers.map((v) => {
    const m = monthlyMap.get(v.id);
    return {
      ...v,
      monthlyCoins: m?._sum.coinsAwarded ?? 0,
      monthlyHours: m?._sum.hoursVerified ?? 0,
      monthlyTrash: m?._sum.trashLbsVerified ?? 0,
    };
  });

  const me = session?.user ? withMonthly.find((v) => v.id === session.user.id) : null;
  const myCity = me?.city;

  return (
    <LeaderboardClient
      volunteers={withMonthly}
      myId={session?.user?.id ?? null}
      myCity={myCity ?? null}
    />
  );
}
