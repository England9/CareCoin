"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  Trophy,
  Gift,
  Users,
  Shield,
  Menu,
  X,
  Coins,
  HeartHandshake,
  LogOut,
} from "lucide-react";
import { cn, Badge } from "./ui";
import { formatCoins } from "@/lib/format";

const links = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/impact", label: "Impact", icon: HeartHandshake },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Nav() {
  const pathname = usePathname();
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const user = data?.user;

  const extra =
    user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : user?.role === "CHARITY"
        ? [{ href: "/charity", label: "Charity", icon: Users }]
        : [];

  const all = [...links, ...extra];

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-[#f3fbf8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-lg shadow-sm">
            🪙
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-extrabold tracking-tight text-teal-950">
              Care Coin
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-teal-700/70">
              Get Paid to Care
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {all.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition",
                  active ? "bg-teal-700 text-white" : "text-teal-900/80 hover:bg-teal-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/rewards"
                className="hidden items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-950 sm:inline-flex"
              >
                <Coins className="h-4 w-4" />
                {formatCoins(user.coins)}
              </Link>
              <Link
                href="/profile/me"
                className="hidden max-w-[140px] truncate text-sm font-semibold text-teal-900 sm:block"
              >
                {user.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-xl p-2 text-teal-800 hover:bg-teal-100 md:inline-flex"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white md:inline-flex"
            >
              Sign in
            </Link>
          )}
          <button
            className="rounded-xl p-2 text-teal-900 hover:bg-teal-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-teal-900/10 bg-[#f3fbf8] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {all.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-100"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-3 py-2">
                  <Badge tone="gold">{formatCoins(user.coins)} coins</Badge>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-100"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
