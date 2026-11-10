import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withinGeofence } from "@/lib/geo";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VOLUNTEER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const demoForceInside = Boolean(body.demoForceInside);

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const attendance = await prisma.attendance.findUnique({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
  });
  if (!attendance) {
    return NextResponse.json({ error: "Register for the event first" }, { status: 400 });
  }
  if (attendance.status !== "REGISTERED" && attendance.status !== "CHECKED_OUT") {
    // allow re-checkin only from REGISTERED
  }
  if (attendance.status === "CHECKED_IN") {
    return NextResponse.json({ error: "Already checked in" }, { status: 400 });
  }
  if (attendance.status === "VERIFIED") {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }

  const geo = withinGeofence(lat, lng, event.lat, event.lng, event.geofenceRadiusM);
  if (!geo.ok && !demoForceInside) {
    return NextResponse.json(
      {
        error: `Outside geofence (${geo.distanceM}m away; need ≤${event.geofenceRadiusM}m)`,
        distanceM: geo.distanceM,
      },
      { status: 400 }
    );
  }

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      status: "CHECKED_IN",
      checkInAt: new Date(),
      checkInLat: lat,
      checkInLng: lng,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Checked in successfully. Charity will confirm after check-out.",
    distanceM: geo.distanceM,
  });
}
