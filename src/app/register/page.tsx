"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      role: String(fd.get("role")),
      city: String(fd.get("city")),
      state: String(fd.get("state")),
      charityName: String(fd.get("charityName") || ""),
      charityDescription: String(fd.get("charityDescription") || ""),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Join Care Coin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Register as a volunteer or charity. Charities require admin approval before hosting events.
        </p>
      </div>
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-5 shadow-sm">
        <label className="block text-sm font-semibold text-teal-900">
          Full name
          <input name="name" required className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-semibold text-teal-900">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-semibold text-teal-900">
          Password
          <input name="password" type="password" minLength={6} required className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-semibold text-teal-900">
          I am a…
          <select name="role" className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5" defaultValue="VOLUNTEER">
            <option value="VOLUNTEER">Volunteer</option>
            <option value="CHARITY">Charity organizer</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-teal-900">
            City
            <input name="city" required defaultValue="Santa Monica" className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          </label>
          <label className="block text-sm font-semibold text-teal-900">
            State
            <input name="state" required defaultValue="CA" className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          </label>
        </div>
        <div className="space-y-3 rounded-xl bg-teal-50/80 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Charity details (if registering as charity)</p>
          <input name="charityName" placeholder="Organization name" className="w-full rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
          <textarea name="charityDescription" placeholder="Mission & SDG focus" rows={3} className="w-full rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
