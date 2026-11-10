"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { formatCompact } from "@/lib/format";

function Counter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => formatCompact(v) + suffix);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [mv, value]);

  return (
    <div className="rounded-2xl border border-teal-100 bg-white/85 p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-700/70">{label}</p>
      <motion.p className="mt-2 font-display text-3xl font-extrabold text-teal-950">{rounded}</motion.p>
    </div>
  );
}

export function MotionCounters({
  hours,
  trash,
  volunteers,
  coins,
  events,
}: {
  hours: number;
  trash: number;
  volunteers: number;
  coins: number;
  events: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Counter value={hours} label="Hours volunteered" />
      <Counter value={trash} label="Trash removed" suffix=" lbs" />
      <Counter value={volunteers} label="Volunteers" />
      <Counter value={coins} label="Care Coins earned" />
      <Counter value={events} label="Verified attendances" />
    </div>
  );
}
