"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui";

export function PrivacyForm({
  shareDemographics,
  shareApproxLocation,
  ageRange,
}: {
  shareDemographics: boolean;
  shareApproxLocation: boolean;
  ageRange: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shareDemographics: fd.get("shareDemographics") === "on",
        shareApproxLocation: fd.get("shareApproxLocation") === "on",
        ageRange: String(fd.get("ageRange") || ""),
      }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || "");
    router.refresh();
  }

  async function deleteData() {
    if (!confirm("Delete your Care Coin account and associated data? This cannot be undone.")) return;
    const res = await fetch("/api/privacy", { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/";
    } else {
      setMsg(data.error || "Could not delete");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-teal-100 bg-white/85 p-5">
        <label className="flex items-start gap-3 text-sm">
          <input name="shareDemographics" type="checkbox" defaultChecked={shareDemographics} className="mt-1" />
          <span>
            <strong>Share demographics</strong> for aggregated analytics (age range, etc.). Never sold
            individually.
          </span>
        </label>
        <label className="block text-sm font-semibold text-teal-900">
          Age range (optional)
          <select name="ageRange" defaultValue={ageRange} className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2.5">
            <option value="">Prefer not to say</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
          </select>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input name="shareApproxLocation" type="checkbox" defaultChecked={shareApproxLocation} className="mt-1" />
          <span>
            <strong>Share approximate location</strong> (city-level) for local leaderboards and discovery.
            Precise GPS is still only used at check-in/out.
          </span>
        </label>
        <Button type="submit">Save preferences</Button>
      </form>

      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <p className="font-display text-lg font-bold text-rose-900">Delete my data</p>
        <p className="mt-1 text-sm text-rose-800/80">
          Removes your account, attendance records, redemptions, and coin history. Demo community
          aggregates may retain anonymized historical totals.
        </p>
        <Button variant="danger" className="mt-3" onClick={deleteData}>
          Delete account
        </Button>
      </div>
      {msg ? <p className="text-sm text-teal-800">{msg}</p> : null}
    </div>
  );
}
