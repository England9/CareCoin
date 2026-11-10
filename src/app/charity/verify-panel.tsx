"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";

type Item = {
  attendanceId: string;
  eventTitle: string;
  eventId: string;
  volunteerName: string;
  volunteerId: string;
  isDemo: boolean;
  hoursRequired: number;
  category: string;
};

export function CharityVerifyPanel({ items }: { items: Item[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function verify(item: Item, form: HTMLFormElement) {
    setLoading(item.attendanceId);
    setMsg("");
    const fd = new FormData(form);
    const res = await fetch("/api/charity/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendanceId: item.attendanceId,
        hours: Number(fd.get("hours")),
        trashLbs: Number(fd.get("trashLbs")),
        markTop: fd.get("markTop") === "on",
      }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setMsg(data.error || "Verification failed");
      return;
    }
    setMsg(`Verified ${item.volunteerName} — awarded ${data.coinsAwarded} Care Coins`);
    router.refresh();
  }

  if (!items.length) {
    return <p className="text-sm text-slate-500">No volunteers awaiting verification.</p>;
  }

  return (
    <div className="space-y-3">
      {msg ? <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">{msg}</p> : null}
      {items.map((item) => (
        <form
          key={item.attendanceId}
          className="rounded-2xl border border-teal-100 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            verify(item, e.currentTarget);
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-teal-950">{item.volunteerName}</p>
            {item.isDemo ? <Badge tone="demo">Demo</Badge> : null}
          </div>
          <p className="text-xs text-slate-500">{item.eventTitle}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-teal-900">
              Hours
              <input
                name="hours"
                type="number"
                step="0.1"
                min="0"
                defaultValue={item.hoursRequired}
                className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2"
              />
            </label>
            <label className="text-xs font-semibold text-teal-900">
              Trash (lbs)
              <input
                name="trashLbs"
                type="number"
                step="0.1"
                min="0"
                defaultValue={item.category.includes("cleanup") ? 8 : 0}
                className="mt-1 w-full rounded-xl border border-teal-200 px-3 py-2"
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-teal-900">
              <input name="markTop" type="checkbox" className="h-4 w-4" />
              Top performer bonus
            </label>
          </div>
          <Button type="submit" className="mt-3" disabled={loading === item.attendanceId}>
            {loading === item.attendanceId ? "Verifying…" : "Verify & award coins"}
          </Button>
        </form>
      ))}
    </div>
  );
}
