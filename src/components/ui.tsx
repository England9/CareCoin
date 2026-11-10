"use client";

import { clsx } from "clsx";
import { MotionProps, motion } from "framer-motion";
import { ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return clsx(parts);
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 shadow-sm",
    secondary: "bg-white text-teal-900 border border-teal-200 hover:bg-teal-50",
    ghost: "bg-transparent text-teal-900 hover:bg-teal-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    gold: "bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-sm",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "teal",
  className,
}: {
  children: ReactNode;
  tone?: "teal" | "gold" | "coral" | "slate" | "demo" | "sponsored";
  className?: string;
}) {
  const tones = {
    teal: "bg-teal-100 text-teal-800",
    gold: "bg-amber-100 text-amber-900",
    coral: "bg-orange-100 text-orange-800",
    slate: "bg-slate-100 text-slate-700",
    demo: "bg-sky-100 text-sky-800 border border-sky-200",
    sponsored: "bg-violet-100 text-violet-800 border border-violet-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-teal-100", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r from-teal-600 to-amber-400", barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-teal-100/80 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700/70">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-teal-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-teal-950 sm:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: MotionProps & { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CoinBurst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-3xl bg-amber-400 px-8 py-6 text-center shadow-2xl"
        initial={{ scale: 0.6, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        <div className="text-4xl">🪙</div>
        <p className="mt-2 font-display text-xl font-bold text-amber-950">Care Coins earned!</p>
      </motion.div>
    </motion.div>
  );
}
