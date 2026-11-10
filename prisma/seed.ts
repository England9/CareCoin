import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACHIEVEMENT_DEFS, coinsFromHoursAndTrash, levelFromCoins } from "../src/lib/leveling";

const prisma = new PrismaClient();
const Role = { VOLUNTEER: "VOLUNTEER", CHARITY: "CHARITY", ADMIN: "ADMIN" } as const;
const CharityStatus = { PENDING: "PENDING", APPROVED: "APPROVED", REJECTED: "REJECTED" } as const;
const AttendanceStatus = {
  REGISTERED: "REGISTERED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  VERIFIED: "VERIFIED",
  DISPUTED: "DISPUTED",
} as const;
const RewardCategory = { CASH: "CASH", PHYSICAL: "PHYSICAL" } as const;

const FIRST = [
  "Ava","Noah","Mia","Liam","Zoe","Ethan","Luna","Mason","Iris","Owen",
  "Nora","Caleb","Ruby","Leo","Chloe","Hudson","Ellie","Felix","Sadie","Kai",
  "Hazel","Jasper","Willow","Theo","Piper","Miles","Ivy","Asher","Nova","Finn",
  "Quinn","Rowan","Skye","Blake","Remy","Jordan","Casey","Avery","Reese","Parker",
  "Morgan","Cameron","Hayden","Riley","Taylor","Jamie","Alex","Sam","Drew","Charlie",
  "Robin","Sage","River","Phoenix","Eden","Marley","Shay","Dana","Kerry","Lee",
  "Toni","Ari","Jules","Kit","Lane","Micah","Nico","Oakley","Peyton","Rory",
  "Shawn","Tatum","Val","Wren","Yael","Zion","Blair","Corey","Devon","Ellis",
];

const LAST = [
  "Chen","Patel","Garcia","Kim","Nguyen","Brooks","Rivera","Singh","Walsh","Okoro",
  "Torres","Murphy","Hassan","Lee","Baker","Cruz","Morris","Ali","Foster","Bennett",
  "Diaz","Reed","Price","Coleman","Jenkins","Perry","Powell","Long","Patterson","Hughes",
  "Flores","Washington","Butler","Simmons","Foster","Gonzalez","Bryant","Alexander","Russell","Griffin",
];

const CITIES = [
  { city: "Santa Monica", state: "CA", lat: 34.0195, lng: -118.4912 },
  { city: "San Francisco", state: "CA", lat: 37.7749, lng: -122.4194 },
  { city: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321 },
  { city: "Portland", state: "OR", lat: 45.5152, lng: -122.6784 },
  { city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431 },
  { city: "Denver", state: "CO", lat: 39.7392, lng: -104.9903 },
  { city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
  { city: "Boston", state: "MA", lat: 42.3601, lng: -71.0589 },
  { city: "Miami", state: "FL", lat: 25.7617, lng: -80.1918 },
  { city: "New York", state: "NY", lat: 40.7128, lng: -74.006 },
  { city: "San Diego", state: "CA", lat: 32.7157, lng: -117.1611 },
  { city: "Honolulu", state: "HI", lat: 21.3069, lng: -157.8583 },
];

const CHARITIES: Array<{
  name: string;
  description: string;
  sdgs: number[];
  cityIdx: number;
  categoryFocus: string;
}> = [
  { name: "Pacific Tide Keepers", description: "Ocean conservation crews protecting coastal ecosystems through monthly beach cleanups and marine education.", sdgs: [14, 13, 15], cityIdx: 0, categoryFocus: "beach_cleanup" },
  { name: "Urban Canopy Project", description: "Planting native trees and restoring green corridors across city neighborhoods.", sdgs: [15, 11, 13], cityIdx: 1, categoryFocus: "park_cleanup" },
  { name: "Harbor Hope Kitchen", description: "Community kitchens fighting hunger with weekend food drives and meal prep events.", sdgs: [2, 1, 10], cityIdx: 2, categoryFocus: "food_drive" },
  { name: "Trailblaze Restoration", description: "Volunteer trail crews rebuilding eroded paths and removing invasive plants.", sdgs: [15, 3, 11], cityIdx: 3, categoryFocus: "park_cleanup" },
  { name: "Riverbend Wildlife Sanctuary", description: "Animal welfare advocates rehabilitating injured wildlife and stewarding riparian habitats.", sdgs: [15, 14, 3], cityIdx: 4, categoryFocus: "animal_welfare" },
  { name: "Brightpath Tutoring Collective", description: "After-school mentoring and literacy events for underserved students.", sdgs: [4, 10, 5], cityIdx: 5, categoryFocus: "education" },
  { name: "Warm Nights Shelter Network", description: "Homelessness support through packing kits, meal service, and shelter volunteering.", sdgs: [1, 11, 10], cityIdx: 6, categoryFocus: "homelessness" },
  { name: "Bayou Blue Cleanup", description: "Wetland restoration and waterway debris removal across Gulf Coast communities.", sdgs: [14, 6, 13], cityIdx: 8, categoryFocus: "beach_cleanup" },
  { name: "Green Mile Parks Alliance", description: "Neighborhood park revitalization, litter patrols, and playground refresh days.", sdgs: [11, 15, 3], cityIdx: 9, categoryFocus: "park_cleanup" },
  { name: "Coral Compass Foundation", description: "Citizen science dives and shoreline cleanups supporting reef recovery.", sdgs: [14, 13, 17], cityIdx: 11, categoryFocus: "beach_cleanup" },
  { name: "Second Harvest Circle", description: "Rescuing surplus groceries and redistributing them through volunteer-powered food banks.", sdgs: [2, 12, 1], cityIdx: 7, categoryFocus: "food_drive" },
  { name: "Paws & Promise Rescue", description: "Animal shelter support, adoption events, and foster network volunteering.", sdgs: [15, 3, 17], cityIdx: 10, categoryFocus: "animal_welfare" },
  { name: "Sunrise Literacy Lab", description: "Weekend reading clubs and school supply drives for early learners.", sdgs: [4, 5, 10], cityIdx: 4, categoryFocus: "education" },
  { name: "Coastal Drift Collective", description: "Microplastic surveys and public shoreline stewardship days.", sdgs: [14, 12, 13], cityIdx: 0, categoryFocus: "beach_cleanup" },
  { name: "Summit Soil Stewards", description: "Community gardens, compost education, and soil regeneration workshops.", sdgs: [15, 2, 12], cityIdx: 5, categoryFocus: "community_service" },
  { name: "Bridgeway Outreach", description: "Hygiene kit assembly and street outreach supporting people experiencing homelessness.", sdgs: [1, 3, 10], cityIdx: 1, categoryFocus: "homelessness" },
  { name: "Lakeview Habitat Crew", description: "Lakeshore cleanups and nesting habitat protection for migratory birds.", sdgs: [15, 14, 13], cityIdx: 6, categoryFocus: "park_cleanup" },
  { name: "Kindling Youth Mentors", description: "Career-readiness workshops and peer mentoring for teens.", sdgs: [4, 8, 10], cityIdx: 9, categoryFocus: "education" },
  { name: "AquaGuard Watersheds", description: "Storm drain stenciling, creek cleanups, and water quality sampling.", sdgs: [6, 14, 11], cityIdx: 2, categoryFocus: "community_service" },
  { name: "Ember Forest Conservancy", description: "Wildfire resilience plantings and forest floor fuel reduction with trained volunteers.", sdgs: [13, 15, 11], cityIdx: 3, categoryFocus: "community_service" },
  { name: "Harbor Lantern Meals", description: "Evening meal service and pantry restocking for families in need.", sdgs: [2, 1, 3], cityIdx: 7, categoryFocus: "food_drive" },
  { name: "Seaside Otter Watch", description: "Marine mammal monitoring and beach nesting zone stewardship.", sdgs: [14, 15, 17], cityIdx: 10, categoryFocus: "animal_welfare" },
  { name: "Equity Books Mobile", description: "Pop-up libraries and book drives bringing reading access to every zip code.", sdgs: [4, 10, 11], cityIdx: 8, categoryFocus: "education" },
  { name: "Nest & Nourish Collective", description: "Shelter meal prep, clothing sorting, and transitional housing support.", sdgs: [1, 11, 5], cityIdx: 6, categoryFocus: "homelessness" },
  { name: "Dune Guard Rangers", description: "Dune restoration planting and boardwalk litter removal along barrier beaches.", sdgs: [15, 14, 13], cityIdx: 0, categoryFocus: "beach_cleanup" },
  { name: "Civic Bloom Brigade", description: "Murals, community garden builds, and neighborhood beautification days.", sdgs: [11, 3, 17], cityIdx: 4, categoryFocus: "community_service" },
];

const EVENT_TEMPLATES: Array<{
  title: string;
  description: string;
  category: string;
  sdg: number;
  hours: number;
  base: number;
  top: number;
}> = [
  { title: "Sunrise Beach Sweep", description: "Join us at dawn to remove plastics and fishing line before tide comes in. Gloves and bags provided.", category: "beach_cleanup", sdg: 14, hours: 3, base: 400, top: 150 },
  { title: "Park Pathways Cleanup", description: "Clear litter from trails, picnic areas, and playgrounds while logging trash weights for impact tracking.", category: "park_cleanup", sdg: 15, hours: 2.5, base: 350, top: 120 },
  { title: "Neighborhood Food Drive", description: "Sort donations, pack family boxes, and help distribute groceries to local households.", category: "food_drive", sdg: 2, hours: 4, base: 500, top: 200 },
  { title: "Shelter Meal Service", description: "Prep and serve hot meals, restock hygiene kits, and welcome guests with dignity.", category: "homelessness", sdg: 1, hours: 3, base: 420, top: 160 },
  { title: "Reading Buddies Afternoon", description: "Pair with elementary students for one-on-one reading practice and literacy games.", category: "education", sdg: 4, hours: 2, base: 300, top: 100 },
  { title: "Animal Shelter Care Day", description: "Walk dogs, refresh kennels, assemble enrichment toys, and support adoption visitors.", category: "animal_welfare", sdg: 15, hours: 3, base: 380, top: 140 },
  { title: "Creek & Storm Drain Sweep", description: "Remove debris from creekside paths and stencil storm drains with watershed reminders.", category: "community_service", sdg: 6, hours: 3.5, base: 450, top: 180 },
  { title: "Community Garden Build", description: "Build raised beds, mulch pathways, and plant seasonal vegetables for the neighborhood pantry.", category: "community_service", sdg: 11, hours: 4, base: 520, top: 200 },
  { title: "Coastal Dune Planting", description: "Plant native dune grasses and remove invasive ice plant along the shoreline buffer.", category: "beach_cleanup", sdg: 15, hours: 3, base: 430, top: 170 },
  { title: "Weekend Pantry Restock", description: "Unload trucks, rotate inventory, and pack emergency grocery bags for families.", category: "food_drive", sdg: 2, hours: 2.5, base: 360, top: 130 },
];

const REWARDS = [
  { name: "$5 Cash", description: "Demo cash reward credited to your Care Coin wallet simulation.", category: RewardCategory.CASH, coinCost: 5000, imageEmoji: "💵", imageColor: "#1B7A4E", sortOrder: 1 },
  { name: "$10 Cash", description: "Demo cash reward — not a real payout.", category: RewardCategory.CASH, coinCost: 10000, imageEmoji: "💵", imageColor: "#1B7A4E", sortOrder: 2 },
  { name: "$25 Cash", description: "Demo cash reward for high-impact volunteers.", category: RewardCategory.CASH, coinCost: 25000, imageEmoji: "💸", imageColor: "#0F5C3A", sortOrder: 3 },
  { name: "$50 Cash", description: "Demo cash reward. No actual money is transferred.", category: RewardCategory.CASH, coinCost: 50000, imageEmoji: "💰", imageColor: "#0A4A2E", sortOrder: 4 },
  { name: "$100 Gift Card", description: "Demo gift card reward for showcase purposes only.", category: RewardCategory.CASH, coinCost: 100000, imageEmoji: "🎁", imageColor: "#C45C26", sortOrder: 5 },
  { name: "Coffee Gift Card", description: "Demo café gift card — sample redemption only.", category: RewardCategory.PHYSICAL, coinCost: 5000, imageEmoji: "☕", imageColor: "#6B3F2A", sortOrder: 6 },
  { name: "Wireless Earbuds", description: "Demo physical prize. Shipping is not fulfilled.", category: RewardCategory.PHYSICAL, coinCost: 40000, imageEmoji: "🎧", imageColor: "#2C3E50", sortOrder: 7 },
  { name: "Nintendo Switch", description: "Demo console prize for leaderboard legends. Not shipped.", category: RewardCategory.PHYSICAL, coinCost: 100000, imageEmoji: "🎮", imageColor: "#E63946", sortOrder: 8 },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function daysFromNow(days: number, hours = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding Care Coin demo data...");

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

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const a of ACHIEVEMENT_DEFS) {
    await prisma.achievement.create({ data: { ...a } });
  }
  const achievements = await prisma.achievement.findMany();

  for (const r of REWARDS) {
    await prisma.reward.create({ data: { ...r, isDemo: true, available: true } });
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@carecoin.app",
      passwordHash,
      name: "Care Coin Admin",
      role: Role.ADMIN,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=AdminCare",
      city: "San Francisco",
      state: "CA",
      isDemo: false,
      coins: 0,
      shareDemographics: false,
    },
  });

  const realVolunteer = await prisma.user.create({
    data: {
      email: "volunteer@carecoin.app",
      passwordHash,
      name: "Jordan Lee",
      role: Role.VOLUNTEER,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanLee",
      bio: "Weekend volunteer focused on ocean cleanups and food security.",
      city: "Santa Monica",
      state: "CA",
      lat: 34.0195,
      lng: -118.4912,
      isDemo: false,
      coins: 12400,
      lifetimeCoins: 18600,
      totalHours: 42,
      trashLbs: 118,
      eventsAttended: 14,
      streakDays: 3,
      level: levelFromCoins(18600),
      shareDemographics: true,
      ageRange: "25-34",
      shareApproxLocation: true,
    },
  });

  const charityOwner = await prisma.user.create({
    data: {
      email: "charity@carecoin.app",
      passwordHash,
      name: "Sam Rivera",
      role: Role.CHARITY,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=SamRivera",
      city: "Santa Monica",
      state: "CA",
      isDemo: false,
    },
  });

  const charityRecords = [];
  for (let i = 0; i < CHARITIES.length; i++) {
    const c = CHARITIES[i];
    const loc = CITIES[c.cityIdx];
    const owner =
      i === 0
        ? charityOwner
        : await prisma.user.create({
            data: {
              email: `charity${i + 1}@demo.carecoin.app`,
              passwordHash,
              name: `${c.name} Organizer`,
              role: Role.CHARITY,
              avatarUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(c.name)}`,
              city: loc.city,
              state: loc.state,
              lat: loc.lat,
              lng: loc.lng,
              isDemo: true,
            },
          });

    const charity = await prisma.charity.create({
      data: {
        userId: owner.id,
        name: c.name,
        description: c.description,
        website: `https://example.org/${c.name.toLowerCase().replace(/\s+/g, "-")}`,
        logoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=0d7377`,
        status: i < 24 ? CharityStatus.APPROVED : CharityStatus.PENDING,
        sdgs: JSON.stringify(c.sdgs),
        city: loc.city,
        state: loc.state,
        lat: loc.lat,
        lng: loc.lng,
        isDemo: i !== 0,
      },
    });
    charityRecords.push({ charity, focus: c.categoryFocus, loc });
  }

  // Pending charity for admin queue
  const pendingOwner = await prisma.user.create({
    data: {
      email: "pending@demo.carecoin.app",
      passwordHash,
      name: "Pending Org Lead",
      role: Role.CHARITY,
      isDemo: true,
      avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=PendingOrg",
      city: "Austin",
      state: "TX",
    },
  });
  await prisma.charity.create({
    data: {
      userId: pendingOwner.id,
      name: "Future Forests Initiative",
      description: "Awaiting approval to host tree-planting events across Central Texas.",
      status: CharityStatus.PENDING,
      sdgs: JSON.stringify([15, 13]),
      city: "Austin",
      state: "TX",
      lat: 30.2672,
      lng: -97.7431,
      isDemo: true,
    },
  });

  const events = [];
  for (let i = 0; i < charityRecords.length; i++) {
    const { charity, focus, loc } = charityRecords[i];
    if (charity.status !== CharityStatus.APPROVED) continue;
    const templates = EVENT_TEMPLATES.filter((t) => t.category === focus);
    const pool = templates.length ? templates : EVENT_TEMPLATES;
    const count = randInt(2, 4);
    for (let j = 0; j < count; j++) {
      const t = pool[j % pool.length];
      const dayOffset = -20 + i * 2 + j * 3;
      const startAt = daysFromNow(dayOffset, 9);
      const endAt = new Date(startAt.getTime() + t.hours * 60 * 60 * 1000);
      const event = await prisma.event.create({
        data: {
          charityId: charity.id,
          title: `${t.title} — ${loc.city}`,
          description: t.description,
          sdg: t.sdg,
          address: `${100 + i * 7 + j} Community Way`,
          city: loc.city,
          state: loc.state,
          lat: loc.lat + rand(-0.04, 0.04),
          lng: loc.lng + rand(-0.04, 0.04),
          startAt,
          endAt,
          hoursRequired: t.hours,
          baseCoinReward: t.base,
          topCoinBonus: t.top,
          geofenceRadiusM: 150,
          isSponsored: j === 0 && i % 5 === 0,
          maxVolunteers: randInt(25, 80),
          category: t.category,
          isDemo: true,
        },
      });
      events.push(event);
    }
  }

  const demoVolunteers = [];
  for (let i = 0; i < 80; i++) {
    const loc = CITIES[i % CITIES.length];
    const first = FIRST[i % FIRST.length];
    const last = LAST[i % LAST.length];
    const name = `${first} ${last}`;
    const hours = Math.round(rand(8, 160) * 10) / 10;
    const trash = Math.round(rand(5, 520) * 10) / 10;
    const eventsAttended = randInt(3, 55);
    const lifetimeCoins = Math.round(hours * 120 + trash * 8 + eventsAttended * 80 + rand(500, 8000));
    const spent = randInt(0, Math.min(20000, Math.floor(lifetimeCoins * 0.35)));
    const coins = Math.max(0, lifetimeCoins - spent);
    const user = await prisma.user.create({
      data: {
        email: `demo.volunteer${i + 1}@carecoin.app`,
        passwordHash,
        name,
        role: Role.VOLUNTEER,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name + i)}`,
        bio: i % 3 === 0 ? "Demo volunteer profile showcasing Care Coin impact tracking." : null,
        city: loc.city,
        state: loc.state,
        lat: loc.lat + rand(-0.08, 0.08),
        lng: loc.lng + rand(-0.08, 0.08),
        isDemo: true,
        coins,
        lifetimeCoins,
        totalHours: hours,
        trashLbs: trash,
        eventsAttended,
        streakDays: randInt(0, 14),
        level: levelFromCoins(lifetimeCoins),
        shareDemographics: i % 2 === 0,
        ageRange: pick(["18-24", "25-34", "35-44", "45-54", "55+"]),
        shareApproxLocation: true,
      },
    });
    demoVolunteers.push(user);

    for (const a of achievements) {
      const value =
        a.metric === "hours"
          ? hours
          : a.metric === "trash"
            ? trash
            : a.metric === "events"
              ? eventsAttended
              : a.metric === "coins"
                ? lifetimeCoins
                : user.streakDays;
      if (value >= a.threshold) {
        await prisma.userAchievement.create({
          data: { userId: user.id, achievementId: a.id },
        });
      }
    }

    await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        amount: lifetimeCoins,
        reason: "Verified volunteering (seeded demo history)",
        meta: JSON.stringify({ demo: true }),
      },
    });
    if (spent > 0) {
      await prisma.coinTransaction.create({
        data: {
          userId: user.id,
          amount: -spent,
          reason: "Demo reward redemptions",
          meta: JSON.stringify({ demo: true }),
        },
      });
    }
  }

  // Achievements for real volunteer
  for (const a of achievements) {
    const value =
      a.metric === "hours"
        ? realVolunteer.totalHours
        : a.metric === "trash"
          ? realVolunteer.trashLbs
          : a.metric === "events"
            ? realVolunteer.eventsAttended
            : a.metric === "coins"
              ? realVolunteer.lifetimeCoins
              : realVolunteer.streakDays;
    if (value >= a.threshold) {
      await prisma.userAchievement.create({
        data: { userId: realVolunteer.id, achievementId: a.id },
      });
    }
  }

  // Signups & verified attendance for past events
  const pastEvents = events.filter((e) => e.endAt < new Date());
  const upcomingEvents = events.filter((e) => e.startAt >= new Date());

  let totalHours = 0;
  let totalTrash = 0;
  let totalCoins = 0;
  let verifiedCount = 0;

  for (const event of pastEvents) {
    const attendees = [...demoVolunteers]
      .sort(() => Math.random() - 0.5)
      .slice(0, randInt(8, 22));
    if (Math.random() > 0.4) attendees.push(realVolunteer);

    const sortedByImpact = attendees
      .map((u) => ({ u, score: u.totalHours + u.trashLbs }))
      .sort((a, b) => b.score - a.score);

    for (let idx = 0; idx < attendees.length; idx++) {
      const user = attendees[idx];
      const hours = Math.round((event.hoursRequired * rand(0.85, 1.1)) * 10) / 10;
      const trash =
        event.category.includes("cleanup") || event.category === "beach_cleanup" || event.category === "park_cleanup"
          ? Math.round(rand(2, 28) * 10) / 10
          : Math.round(rand(0, 4) * 10) / 10;
      const isTop = sortedByImpact.slice(0, 3).some((x) => x.u.id === user.id);
      const coins = coinsFromHoursAndTrash(hours, trash, event.baseCoinReward, isTop, event.topCoinBonus);

      await prisma.eventSignup.create({
        data: { eventId: event.id, userId: user.id },
      });

      await prisma.attendance.create({
        data: {
          eventId: event.id,
          userId: user.id,
          status: AttendanceStatus.VERIFIED,
          checkInAt: event.startAt,
          checkOutAt: event.endAt,
          checkInLat: event.lat + rand(-0.0005, 0.0005),
          checkInLng: event.lng + rand(-0.0005, 0.0005),
          checkOutLat: event.lat + rand(-0.0005, 0.0005),
          checkOutLng: event.lng + rand(-0.0005, 0.0005),
          hoursVerified: hours,
          trashLbsVerified: trash,
          coinsAwarded: coins,
          verifiedAt: event.endAt,
          notes: "Demo verified participation",
        },
      });

      totalHours += hours;
      totalTrash += trash;
      totalCoins += coins;
      verifiedCount += 1;
    }
  }

  // Upcoming signups including real volunteer
  for (const event of upcomingEvents.slice(0, 25)) {
    const attendees = [...demoVolunteers].sort(() => Math.random() - 0.5).slice(0, randInt(5, 18));
    if (event.city === realVolunteer.city || Math.random() > 0.6) {
      attendees.push(realVolunteer);
    }
    for (const user of attendees) {
      try {
        await prisma.eventSignup.create({ data: { eventId: event.id, userId: user.id } });
        await prisma.attendance.create({
          data: {
            eventId: event.id,
            userId: user.id,
            status: AttendanceStatus.REGISTERED,
          },
        });
      } catch {
        // unique constraint if already signed up
      }
    }
  }

  // Sample redemptions for top demos
  const rewards = await prisma.reward.findMany();
  const coffee = rewards.find((r) => r.name.includes("Coffee"))!;
  const five = rewards.find((r) => r.name === "$5 Cash")!;
  for (const user of demoVolunteers.slice(0, 12)) {
    if (user.coins < coffee.coinCost) continue;
    await prisma.redemption.create({
      data: {
        userId: user.id,
        rewardId: Math.random() > 0.5 ? coffee.id : five.id,
        coinCost: Math.random() > 0.5 ? coffee.coinCost : five.coinCost,
        status: "FULFILLED",
        isDemo: true,
      },
    });
  }

  // One pending attendance for charity verification demo on a recent event
  const recentPast = pastEvents.sort((a, b) => b.endAt.getTime() - a.endAt.getTime())[0];
  if (recentPast) {
    const verifierCharity = await prisma.charity.findUnique({ where: { id: recentPast.charityId } });
    const pendingUser = demoVolunteers[0];
    try {
      await prisma.eventSignup.create({ data: { eventId: recentPast.id, userId: pendingUser.id } });
    } catch {
      /* exists */
    }
    const existing = await prisma.attendance.findUnique({
      where: { eventId_userId: { eventId: recentPast.id, userId: pendingUser.id } },
    });
    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: AttendanceStatus.CHECKED_OUT,
          checkInAt: recentPast.startAt,
          checkOutAt: recentPast.endAt,
          checkInLat: recentPast.lat,
          checkInLng: recentPast.lng,
          checkOutLat: recentPast.lat,
          checkOutLng: recentPast.lng,
          hoursVerified: null,
          trashLbsVerified: null,
          coinsAwarded: 0,
          verifiedAt: null,
          notes: "Awaiting charity verification",
        },
      });
    }
    void verifierCharity;
  }

  // Dispute sample for admin
  const verifiedAtt = await prisma.attendance.findFirst({
    where: { status: AttendanceStatus.VERIFIED, userId: { not: realVolunteer.id } },
  });
  if (verifiedAtt) {
    await prisma.dispute.create({
      data: {
        attendanceId: verifiedAtt.id,
        volunteerId: verifiedAtt.userId,
        reason: "Volunteer reports trash weight was under-counted at check-out.",
        status: "OPEN",
      },
    });
    await prisma.attendance.update({
      where: { id: verifiedAtt.id },
      data: { status: AttendanceStatus.DISPUTED },
    });
  }

  const volunteerCount = await prisma.user.count({ where: { role: Role.VOLUNTEER } });

  await prisma.communityStat.create({
    data: {
      id: "global",
      totalHours: Math.round((totalHours + realVolunteer.totalHours + demoVolunteers.reduce((s, u) => s + u.totalHours, 0) * 0.15) * 10) / 10,
      totalTrashLbs: Math.round((totalTrash + realVolunteer.trashLbs + demoVolunteers.reduce((s, u) => s + u.trashLbs, 0) * 0.15) * 10) / 10,
      totalEvents: pastEvents.length,
      totalVolunteers: volunteerCount,
      totalCoinsEarned: totalCoins + demoVolunteers.reduce((s, u) => s + u.lifetimeCoins, 0),
    },
  });

  console.log("Seed complete.");
  console.log({
    admin: admin.email,
    volunteer: realVolunteer.email,
    charity: charityOwner.email,
    password: "password123",
    charities: charityRecords.length,
    events: events.length,
    demoVolunteers: demoVolunteers.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
