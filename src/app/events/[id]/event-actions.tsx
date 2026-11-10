"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, CoinBurst } from "@/components/ui";
import type { AppRole } from "@/lib/auth";

export function EventActions({
  eventId,
  signedUp,
  attendanceStatus,
  geofenceRadiusM,
  eventLat,
  eventLng,
  hoursRequired,
  isLoggedIn,
  role,
}: {
  eventId: string;
  signedUp: boolean;
  attendanceStatus: string | null;
  geofenceRadiusM: number;
  eventLat: number;
  eventLng: number;
  hoursRequired: number;
  isLoggedIn: boolean;
  role: AppRole | null;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [burst, setBurst] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  async function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation unavailable"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
      });
    });
  }

  async function signup() {
    setLoading(true);
    setMsg("");
    const res = await fetch(`/api/events/${eventId}/signup`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Could not sign up");
      return;
    }
    setMsg("You're registered!");
    router.refresh();
  }

  async function check(action: "checkin" | "checkout") {
    setLoading(true);
    setMsg("");
    try {
      const pos = await getPosition();
      setDistance(null);
      const res = await fetch(`/api/events/${eventId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          // Demo fallback: allow simulating on-site if far away
          demoForceInside: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDistance(data.distanceM ?? null);
        setMsg(data.error || "Location verification failed");
        setLoading(false);
        return;
      }
      setDistance(data.distanceM ?? null);
      setMsg(data.message || "Success");
      if (action === "checkout") {
        setBurst(true);
        setTimeout(() => setBurst(false), 1800);
      }
      router.refresh();
    } catch {
      setMsg("Please allow precise GPS during check-in/out, or use demo override below.");
    }
    setLoading(false);
  }

  async function demoCheck(action: "checkin" | "checkout") {
    setLoading(true);
    setMsg("");
    const res = await fetch(`/api/events/${eventId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: eventLat,
        lng: eventLng,
        demoForceInside: true,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "Demo check failed");
      return;
    }
    setMsg(data.message + " (demo location)");
    if (action === "checkout") {
      setBurst(true);
      setTimeout(() => setBurst(false), 1800);
    }
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-teal-100 bg-white/80 p-4">
        <p className="text-sm text-slate-600">Sign in as a volunteer to register and check in.</p>
        <a href="/login" className="mt-3 inline-block">
          <Button>Sign in</Button>
        </a>
      </div>
    );
  }

  if (role !== "VOLUNTEER") {
    return (
      <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 text-sm text-slate-600">
        Volunteer accounts check in here. Charity organizers verify attendance from the Charity dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-teal-100 bg-white/85 p-4 shadow-sm">
      <CoinBurst show={burst} />
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-lg font-bold text-teal-950">Your participation</p>
        {attendanceStatus ? <Badge>{attendanceStatus.replaceAll("_", " ")}</Badge> : null}
      </div>
      <p className="text-sm text-slate-600">
        Expected ~{hoursRequired} hrs. Geofence radius {geofenceRadiusM}m. Precise location is only used for
        verification and is not stored beyond check coordinates.
      </p>
      <div className="flex flex-wrap gap-2">
        {!signedUp ? (
          <Button onClick={signup} disabled={loading}>
            Register for event
          </Button>
        ) : null}
        {signedUp && (!attendanceStatus || attendanceStatus === "REGISTERED") ? (
          <>
            <Button onClick={() => check("checkin")} disabled={loading}>
              GPS check in
            </Button>
            <Button variant="secondary" onClick={() => demoCheck("checkin")} disabled={loading}>
              Demo check in
            </Button>
          </>
        ) : null}
        {attendanceStatus === "CHECKED_IN" ? (
          <>
            <Button onClick={() => check("checkout")} disabled={loading}>
              GPS check out
            </Button>
            <Button variant="secondary" onClick={() => demoCheck("checkout")} disabled={loading}>
              Demo check out
            </Button>
          </>
        ) : null}
        {attendanceStatus === "CHECKED_OUT" ? (
          <Badge tone="coral">Awaiting charity verification for coins</Badge>
        ) : null}
        {attendanceStatus === "VERIFIED" ? (
          <Badge tone="gold">Verified — Care Coins awarded</Badge>
        ) : null}
      </div>
      {distance != null ? (
        <p className="text-xs text-slate-500">Distance from venue: {distance}m</p>
      ) : null}
      {msg ? <p className="text-sm font-medium text-teal-800">{msg}</p> : null}
    </div>
  );
}
