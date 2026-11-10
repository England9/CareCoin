import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RewardsClient } from "./rewards-client";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/rewards");

  const [user, rewards, redemptions] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.reward.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.redemption.findMany({
      where: { userId: session.user.id },
      include: { reward: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <RewardsClient
      balance={user.coins}
      lifetimeCoins={user.lifetimeCoins}
      rewards={rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category as "CASH" | "PHYSICAL",
        coinCost: r.coinCost,
        imageEmoji: r.imageEmoji,
        imageColor: r.imageColor,
        isDemo: r.isDemo,
      }))}
      redemptions={redemptions.map((r) => ({
        id: r.id,
        rewardName: r.reward.name,
        coinCost: r.coinCost,
        status: r.status,
        isDemo: r.isDemo,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
