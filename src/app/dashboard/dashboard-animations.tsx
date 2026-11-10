"use client";

import { motion } from "framer-motion";

export function DashboardAnimations({ level, coins }: { level: number; coins: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      aria-hidden
    >
      <span className="sr-only">
        Level {level}, {coins} coins
      </span>
    </motion.div>
  );
}
