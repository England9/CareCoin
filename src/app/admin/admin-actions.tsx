"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button } from "@/components/ui";

export function AdminActions({
  pendingCharities,
  disputes,
}: {
  pendingCharities: Array<{
    id: string;
    name: string;
    description: string;
    city: string;
    state: string;
    owner: string;
    email: string;
    isDemo: boolean;
  }>;
  disputes: Array<{
    id: string;
    reason: string;
    volunteerName: string;
    eventTitle: string;
    attendanceId: string;
  }>;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function charityAction(id: string, action: "APPROVE" | "REJECT") {
    const res = await fetch("/api/admin/charities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || "");
    router.refresh();
  }

  async function disputeAction(id: string, action: "RESOLVE" | "REJECT") {
    const res = await fetch("/api/admin/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || "");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {msg ? <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">{msg}</p> : null}

      <div className="space-y-3">
        {pendingCharities.length === 0 ? (
          <p className="text-sm text-slate-500">No charities pending approval.</p>
        ) : (
          pendingCharities.map((c) => (
            <div key={c.id} className="rounded-2xl border border-teal-100 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <p className="font-display text-lg font-bold text-teal-950">{c.name}</p>
                {c.isDemo ? <Badge tone="demo">Demo</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">{c.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                {c.owner} · {c.email} · {c.city}, {c.state}
              </p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => charityAction(c.id, "APPROVE")}>Approve</Button>
                <Button variant="danger" onClick={() => charityAction(c.id, "REJECT")}>
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-teal-950">Participation disputes</h3>
        <div className="mt-3 space-y-3">
          {disputes.length === 0 ? (
            <p className="text-sm text-slate-500">No open disputes.</p>
          ) : (
            disputes.map((d) => (
              <div key={d.id} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                <p className="font-bold text-teal-950">
                  {d.volunteerName} · {d.eventTitle}
                </p>
                <p className="mt-1 text-sm text-slate-600">{d.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => disputeAction(d.id, "RESOLVE")}>Resolve</Button>
                  <Button variant="secondary" onClick={() => disputeAction(d.id, "REJECT")}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
