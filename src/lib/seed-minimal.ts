import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACHIEVEMENT_DEFS, levelFromCoins } from "./leveling";

/** Compact demo seed safe to run inside Cloudflare Workers. */
export async function seedMinimal(prisma: PrismaClient, opts: { force?: boolean } = {}) {
  if (opts.force) {
    await prisma.redemption.deleteMany();
    await prisma.coinTransaction.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.eventSignup.deleteMany();
    await prisma.event.deleteMany();
    await prisma.charity.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.communityStat.deleteMany();
    await prisma.user.deleteMany();
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const a of ACHIEVEMENT_DEFS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      create: { ...a },
      update: {},
    });
  }

  const rewards = [
    { name: "$5 Cash", description: "Demo cash reward", category: "CASH", coinCost: 5000, imageEmoji: "💵", imageColor: "#1B7A4E", sortOrder: 1 },
    { name: "$10 Cash", description: "Demo cash reward", category: "CASH", coinCost: 10000, imageEmoji: "💵", imageColor: "#1B7A4E", sortOrder: 2 },
    { name: "$25 Cash", description: "Demo cash reward", category: "CASH", coinCost: 25000, imageEmoji: "💸", imageColor: "#0F5C3A", sortOrder: 3 },
    { name: "$50 Cash", description: "Demo cash reward", category: "CASH", coinCost: 50000, imageEmoji: "💰", imageColor: "#0A4A2E", sortOrder: 4 },
    { name: "$100 Gift Card", description: "Demo gift card", category: "CASH", coinCost: 100000, imageEmoji: "🎁", imageColor: "#C45C26", sortOrder: 5 },
    { name: "Coffee Gift Card", description: "Demo prize", category: "PHYSICAL", coinCost: 5000, imageEmoji: "☕", imageColor: "#6B3F2A", sortOrder: 6 },
    { name: "Wireless Earbuds", description: "Demo prize", category: "PHYSICAL", coinCost: 40000, imageEmoji: "🎧", imageColor: "#2C3E50", sortOrder: 7 },
    { name: "Nintendo Switch", description: "Demo prize", category: "PHYSICAL", coinCost: 100000, imageEmoji: "🎮", imageColor: "#E63946", sortOrder: 8 },
  ];
  for (const r of rewards) {
    await prisma.reward.create({ data: { ...r, isDemo: true, available: true } });
  }

  await prisma.user.create({
    data: {
      email: "admin@carecoin.app",
      passwordHash,
      name: "Care Coin Admin",
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=AdminCare",
      city: "San Francisco",
      state: "CA",
    },
  });

  const volunteer = await prisma.user.create({
    data: {
      email: "volunteer@carecoin.app",
      passwordHash,
      name: "Jordan Lee",
      role: "VOLUNTEER",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanLee",
      bio: "Weekend volunteer focused on ocean cleanups.",
      city: "Santa Monica",
      state: "CA",
      lat: 34.0195,
      lng: -118.4912,
      coins: 12400,
      lifetimeCoins: 18600,
      totalHours: 42,
      trashLbs: 118,
      eventsAttended: 14,
      streakDays: 3,
      level: levelFromCoins(18600),
      shareDemographics: true,
      ageRange: "25-34",
    },
  });

  const charityOwner = await prisma.user.create({
    data: {
      email: "charity@carecoin.app",
      passwordHash,
      name: "Sam Rivera",
      role: "CHARITY",
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=SamRivera",
      city: "Santa Monica",
      state: "CA",
    },
  });

  const charity = await prisma.charity.create({
    data: {
      userId: charityOwner.id,
      name: "Pacific Tide Keepers",
      description: "Ocean conservation crews protecting coastal ecosystems.",
      status: "APPROVED",
      sdgs: JSON.stringify([14, 13, 15]),
      city: "Santa Monica",
      state: "CA",
      lat: 34.0195,
      lng: -118.4912,
      isDemo: false,
    },
  });

  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  await prisma.event.create({
    data: {
      charityId: charity.id,
      title: "Sunrise Beach Sweep — Santa Monica",
      description: "Remove plastics and fishing line. Gloves and bags provided.",
      sdg: 14,
      address: "100 Community Way",
      city: "Santa Monica",
      state: "CA",
      lat: 34.0195,
      lng: -118.4912,
      startAt: start,
      endAt: end,
      hoursRequired: 3,
      baseCoinReward: 400,
      topCoinBonus: 150,
      category: "beach_cleanup",
      isSponsored: true,
      isDemo: true,
    },
  });

  // A handful of demo leaderboard users
  const names = ["Kit Coleman", "Blair Bryant", "Theo Coleman", "Peyton Patterson", "Ava Chen"];
  for (let i = 0; i < names.length; i++) {
    const lifetimeCoins = 28000 - i * 1500;
    await prisma.user.create({
      data: {
        email: `demo.volunteer${i + 1}@carecoin.app`,
        passwordHash,
        name: names[i],
        role: "VOLUNTEER",
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(names[i])}`,
        city: "Santa Monica",
        state: "CA",
        isDemo: true,
        coins: lifetimeCoins - 2000,
        lifetimeCoins,
        totalHours: 120 - i * 10,
        trashLbs: 400 - i * 30,
        eventsAttended: 40 - i * 3,
        streakDays: 5,
        level: levelFromCoins(lifetimeCoins),
      },
    });
  }

  await prisma.communityStat.create({
    data: {
      id: "global",
      totalHours: 1900,
      totalTrashLbs: 6800,
      totalEvents: 26,
      totalVolunteers: 8,
      totalCoinsEarned: 1500000,
    },
  });

  return {
    volunteer: volunteer.email,
    message: "Minimal Cloudflare demo seed complete. Use password123 for demo accounts.",
  };
}
