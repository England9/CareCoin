/** Level = floor(sqrt(lifetimeCoins / 500)) + 1 */
export function levelFromCoins(lifetimeCoins: number): number {
  return Math.floor(Math.sqrt(Math.max(0, lifetimeCoins) / 500)) + 1;
}

export function coinsForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 500;
}

export function levelProgress(lifetimeCoins: number) {
  const level = levelFromCoins(lifetimeCoins);
  const current = coinsForLevel(level);
  const next = coinsForLevel(level + 1);
  const span = next - current || 1;
  const progress = Math.min(1, Math.max(0, (lifetimeCoins - current) / span));
  return { level, current, next, progress, remaining: Math.max(0, next - lifetimeCoins) };
}

export function coinsFromHoursAndTrash(hours: number, trashLbs: number, baseReward: number, isTop: boolean, topBonus: number) {
  const hourCoins = Math.round(hours * 120);
  const trashCoins = Math.round(trashLbs * 8);
  const bonus = isTop ? topBonus : 0;
  return Math.max(baseReward, hourCoins + trashCoins) + bonus;
}

export const ACHIEVEMENT_DEFS = [
  { code: "hours_10", name: "First Decade", description: "Volunteer 10 hours", icon: "⏱️", threshold: 10, metric: "hours" },
  { code: "hours_50", name: "Dedicated Hands", description: "Volunteer 50 hours", icon: "🙌", threshold: 50, metric: "hours" },
  { code: "hours_100", name: "Century of Care", description: "Volunteer 100 hours", icon: "💯", threshold: 100, metric: "hours" },
  { code: "trash_25", name: "Cleanup Crew", description: "Collect 25 lbs of trash", icon: "🗑️", threshold: 25, metric: "trash" },
  { code: "trash_100", name: "Litter Legend", description: "Collect 100 lbs of trash", icon: "♻️", threshold: 100, metric: "trash" },
  { code: "trash_500", name: "Eco Titan", description: "Collect 500 lbs of trash", icon: "🌍", threshold: 500, metric: "trash" },
  { code: "events_5", name: "Getting Started", description: "Attend 5 events", icon: "🌱", threshold: 5, metric: "events" },
  { code: "events_25", name: "Community Fixture", description: "Attend 25 events", icon: "🏘️", threshold: 25, metric: "events" },
  { code: "events_50", name: "Impact Machine", description: "Attend 50 events", icon: "⚡", threshold: 50, metric: "events" },
  { code: "coins_5k", name: "Coin Collector", description: "Earn 5,000 Care Coins", icon: "🪙", threshold: 5000, metric: "coins" },
  { code: "coins_25k", name: "Care Magnate", description: "Earn 25,000 Care Coins", icon: "👑", threshold: 25000, metric: "coins" },
  { code: "streak_7", name: "Week Warrior", description: "7-day volunteering streak", icon: "🔥", threshold: 7, metric: "streak" },
] as const;
