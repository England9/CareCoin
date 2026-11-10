"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(params.get("callbackUrl") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to track impact and earn Care Coins.</p>
      </div>
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-5 shadow-sm">
        <label className="block text-sm font-semibold text-teal-900">
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue="volunteer@carecoin.app"
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2.5 outline-none ring-teal-600 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-semibold text-teal-900">
          Password
          <input
            name="password"
            type="password"
            required
            defaultValue="password123"
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2.5 outline-none ring-teal-600 focus:ring-2"
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="rounded-2xl bg-teal-50 p-4 text-xs text-teal-900">
        <p className="font-bold">Demo accounts</p>
        <ul className="mt-2 space-y-1">
          <li>volunteer@carecoin.app</li>
          <li>charity@carecoin.app</li>
          <li>admin@carecoin.app</li>
        </ul>
        <p className="mt-2">Password: password123</p>
      </div>
      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link href="/register" className="font-semibold text-teal-700 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
