"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Section } from "@/components/ui";
import { SDGS } from "@/lib/sdgs";

export function CreateEventForm({ charityId }: { charityId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/charity/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charityId,
        title: fd.get("title"),
        description: fd.get("description"),
        sdg: Number(fd.get("sdg")),
        address: fd.get("address"),
        city: fd.get("city"),
        state: fd.get("state"),
        startAt: fd.get("startAt"),
        hoursRequired: Number(fd.get("hoursRequired")),
        baseCoinReward: Number(fd.get("baseCoinReward")),
        category: fd.get("category"),
        isSponsored: fd.get("isSponsored") === "on",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Could not create event");
      return;
    }
    setMsg("Event created");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <Section title="Create event" subtitle="Approved charities can host SDG-aligned volunteering events.">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-teal-100 bg-white/85 p-4 sm:grid-cols-2">
        <input name="title" required placeholder="Event title" className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm sm:col-span-2" />
        <textarea name="description" required placeholder="Description" rows={3} className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm sm:col-span-2" />
        <select name="sdg" className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" defaultValue={14}>
          {SDGS.map((s) => (
            <option key={s.id} value={s.id}>
              SDG {s.id}: {s.name}
            </option>
          ))}
        </select>
        <select name="category" className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" defaultValue="beach_cleanup">
          <option value="beach_cleanup">Beach cleanup</option>
          <option value="park_cleanup">Park cleanup</option>
          <option value="food_drive">Food drive</option>
          <option value="homelessness">Homelessness support</option>
          <option value="education">Education</option>
          <option value="animal_welfare">Animal welfare</option>
          <option value="community_service">Community service</option>
        </select>
        <input name="address" required placeholder="Address" className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input name="city" required defaultValue="Santa Monica" className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
          <input name="state" required defaultValue="CA" className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
        </div>
        <input name="startAt" type="datetime-local" required className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
        <input name="hoursRequired" type="number" step="0.5" min="1" defaultValue={3} className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
        <input name="baseCoinReward" type="number" min="50" defaultValue={400} className="rounded-xl border border-teal-200 px-3 py-2.5 text-sm" />
        <label className="flex items-center gap-2 text-sm font-semibold text-teal-900">
          <input name="isSponsored" type="checkbox" />
          Sponsored placement (paid promo label)
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Publish event"}
          </Button>
          {msg ? <p className="mt-2 text-sm text-teal-800">{msg}</p> : null}
        </div>
      </form>
    </Section>
  );
}
