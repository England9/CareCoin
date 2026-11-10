export function formatCoins(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatHours(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })} hrs`;
}

export function formatLbs(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })} lbs`;
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
