import { prisma } from "./prisma";
import { levelFromCoins } from "./leveling";

export async function syncUserAchievements(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const achievements = await prisma.achievement.findMany();
  const existing = await prisma.userAchievement.findMany({ where: { userId } });
  const have = new Set(existing.map((e) => e.achievementId));
  const unlocked = [];

  for (const a of achievements) {
    if (have.has(a.id)) continue;
    const value =
      a.metric === "hours"
        ? user.totalHours
        : a.metric === "trash"
          ? user.trashLbs
          : a.metric === "events"
            ? user.eventsAttended
            : a.metric === "coins"
              ? user.lifetimeCoins
              : user.streakDays;
    if (value >= a.threshold) {
      const row = await prisma.userAchievement.create({
        data: { userId, achievementId: a.id },
        include: { achievement: true },
      });
      unlocked.push(row.achievement);
    }
  }

  const level = levelFromCoins(user.lifetimeCoins);
  if (level !== user.level) {
    await prisma.user.update({ where: { id: userId }, data: { level } });
  }

  return unlocked;
}

export async function refreshCommunityStats() {
  const volunteers = await prisma.user.findMany({
    where: { role: "VOLUNTEER" },
    select: {
      totalHours: true,
      trashLbs: true,
      lifetimeCoins: true,
    },
  });
  const events = await prisma.attendance.count({ where: { status: "VERIFIED" } });
  const totalHours = volunteers.reduce((s, v) => s + v.totalHours, 0);
  const totalTrashLbs = volunteers.reduce((s, v) => s + v.trashLbs, 0);
  const totalCoinsEarned = volunteers.reduce((s, v) => s + v.lifetimeCoins, 0);

  await prisma.communityStat.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      totalHours,
      totalTrashLbs,
      totalEvents: events,
      totalVolunteers: volunteers.length,
      totalCoinsEarned,
    },
    update: {
      totalHours,
      totalTrashLbs,
      totalEvents: events,
      totalVolunteers: volunteers.length,
      totalCoinsEarned,
    },
  });
}
