import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rewardId } = await req.json();
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || !reward.available) {
    return NextResponse.json({ error: "Reward not available" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.coins < reward.coinCost) {
    return NextResponse.json({ error: "Insufficient Care Coins" }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { coins: { decrement: reward.coinCost } },
    }),
    prisma.redemption.create({
      data: {
        userId: user.id,
        rewardId: reward.id,
        coinCost: reward.coinCost,
        status: "PENDING",
        isDemo: true,
      },
    }),
    prisma.coinTransaction.create({
      data: {
        userId: user.id,
        amount: -reward.coinCost,
        reason: `Demo redemption: ${reward.name}`,
        meta: JSON.stringify({ rewardId: reward.id, demo: true }),
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    balance: updated.coins,
    rewardName: reward.name,
  });
}
