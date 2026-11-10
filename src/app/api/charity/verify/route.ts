import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coinsFromHoursAndTrash, levelFromCoins } from "@/lib/leveling";
import { syncUserAchievements, refreshCommunityStats } from "@/lib/achievements";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "CHARITY" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const attendanceId = String(body.attendanceId);
  const hours = Number(body.hours);
  const trashLbs = Number(body.trashLbs);
  const markTop = Boolean(body.markTop);

  if (Number.isNaN(hours) || hours < 0 || Number.isNaN(trashLbs) || trashLbs < 0) {
    return NextResponse.json({ error: "Invalid hours or trash weight" }, { status: 400 });
  }

  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { event: { include: { charity: true } }, user: true },
  });
  if (!attendance) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });

  if (session.user.role === "CHARITY" && attendance.event.charity.userId !== session.user.id) {
    return NextResponse.json({ error: "Not your event" }, { status: 403 });
  }
  if (attendance.status !== "CHECKED_OUT" && attendance.status !== "DISPUTED") {
    return NextResponse.json({ error: "Volunteer must be checked out before verification" }, { status: 400 });
  }

  const coins = coinsFromHoursAndTrash(
    hours,
    trashLbs,
    attendance.event.baseCoinReward,
    markTop,
    attendance.event.topCoinBonus
  );

  await prisma.$transaction([
    prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        status: "VERIFIED",
        hoursVerified: hours,
        trashLbsVerified: trashLbs,
        coinsAwarded: coins,
        verifiedById: session.user.id,
        verifiedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: attendance.userId },
      data: {
        coins: { increment: coins },
        lifetimeCoins: { increment: coins },
        totalHours: { increment: hours },
        trashLbs: { increment: trashLbs },
        eventsAttended: { increment: 1 },
        streakDays: { increment: 1 },
        level: levelFromCoins(attendance.user.lifetimeCoins + coins),
      },
    }),
    prisma.coinTransaction.create({
      data: {
        userId: attendance.userId,
        amount: coins,
        reason: `Verified: ${attendance.event.title}`,
        meta: JSON.stringify({ attendanceId, hours, trashLbs, markTop }),
      },
    }),
  ]);

  await syncUserAchievements(attendance.userId);
  await refreshCommunityStats();

  return NextResponse.json({ ok: true, coinsAwarded: coins });
}
