"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, ProgressBar, Section } from "@/components/ui";
import { formatCoins } from "@/lib/format";

type Reward = {
  id: string;
  name: string;
  description: string;
  category: "CASH" | "PHYSICAL";
  coinCost: number;
  imageEmoji: string;
  imageColor: string;
  isDemo: boolean;
};

export function RewardsClient({
  balance,
  lifetimeCoins,
  rewards,
  redemptions,
}: {
  balance: number;
  lifetimeCoins: number;
  rewards: Reward[];
  redemptions: Array<{
    id: string;
    rewardName: string;
    coinCost: number;
    status: string;
    isDemo: boolean;
    createdAt: string;
  }>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"CASH" | "PHYSICAL">("CASH");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [bal, setBal] = useState(balance);

  const nextReward = useMemo(() => {
    return [...rewards].sort((a, b) => a.coinCost - b.coinCost).find((r) => r.coinCost > bal) ?? rewards[rewards.length - 1];
  }, [rewards, bal]);

  const progressToNext = nextReward ? Math.min(1, bal / nextReward.coinCost) : 1;

  async function redeem(id: string) {
    setLoading(id);
    setMsg("");
    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId: id }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setMsg(data.error || "Redemption failed");
      return;
    }
    setBal(data.balance);
    setCelebrate(true);
    setMsg(`Demo redemption recorded for ${data.rewardName}. No real payout/shipment.`);
    setTimeout(() => setCelebrate(false), 2000);
    router.refresh();
  }

  const visible = rewards.filter((r) => r.category === tab);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {celebrate ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-teal-950/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-3xl bg-white px-8 py-7 text-center shadow-2xl"
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-5xl">✨🎁</div>
              <p className="mt-3 font-display text-2xl font-extrabold text-teal-950">Reward unlocked!</p>
              <p className="mt-1 text-sm text-slate-600">Demo only — no real cash or shipping.</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Rewards Store</h1>
        <p className="mt-1 text-sm text-slate-600">
          Redeem Care Coins for demo cash rewards and physical prizes. Nothing is paid out or shipped yet.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Available balance</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-amber-950">{formatCoins(bal)}</p>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Progress to next reward</p>
          <p className="mt-1 text-sm font-semibold text-teal-950">
            {nextReward.name} · {formatCoins(nextReward.coinCost)} coins
          </p>
          <ProgressBar value={progressToNext} className="mt-3" />
          <p className="mt-2 text-xs text-slate-500">
            Lifetime earned: {formatCoins(lifetimeCoins)} · Need {formatCoins(Math.max(0, nextReward.coinCost - bal))} more
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["CASH", "PHYSICAL"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === t ? "bg-teal-700 text-white" : "bg-white text-teal-900 border border-teal-200"}`}
          >
            {t === "CASH" ? "Cash Rewards" : "Physical Prizes"}
          </button>
        ))}
      </div>

      {msg ? <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">{msg}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((r, i) => {
          const pct = Math.min(1, bal / r.coinCost);
          const can = bal >= r.coinCost;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-teal-100 bg-white/90 shadow-sm"
            >
              <div className="flex items-center gap-4 p-4" style={{ background: `${r.imageColor}18` }}>
                <div
                  className="grid h-16 w-16 place-items-center rounded-2xl text-3xl shadow-sm"
                  style={{ background: r.imageColor }}
                >
                  <span className="drop-shadow">{r.imageEmoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {r.isDemo ? <Badge tone="demo">Demo reward</Badge> : null}
                    <Badge tone="gold">{formatCoins(r.coinCost)} coins</Badge>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-teal-950">{r.name}</h3>
                  <p className="text-xs text-slate-600">{r.description}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Your progress</span>
                    <span>{Math.round(pct * 100)}%</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
                <Button
                  className="w-full"
                  variant={can ? "gold" : "secondary"}
                  disabled={!can || loading === r.id}
                  onClick={() => redeem(r.id)}
                >
                  {loading === r.id ? "Redeeming…" : can ? "Redeem (demo)" : "Not enough coins"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Section title="Redemption history" subtitle="All demo redemptions — no real fulfillment.">
        <div className="space-y-2">
          {redemptions.length === 0 ? (
            <p className="text-sm text-slate-500">No redemptions yet.</p>
          ) : (
            redemptions.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-teal-100 bg-white/80 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-teal-950">
                    {r.rewardName} {r.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleString()} · {r.status}
                  </p>
                </div>
                <p className="text-sm font-bold text-amber-700">-{formatCoins(r.coinCost)}</p>
              </div>
            ))
          )}
        </div>
      </Section>
    </div>
  );
}
