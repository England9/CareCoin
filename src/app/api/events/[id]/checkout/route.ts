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
  if (!attendance || attendance.status !== "CHECKED_IN") {
    return NextResponse.json({ error: "Check in before checking out" }, { status: 400 });
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
      status: "CHECKED_OUT",
      checkOutAt: new Date(),
      checkOutLat: lat,
      checkOutLng: lng,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Checked out. Waiting for charity to verify hours & trash weight before coins are issued.",
    distanceM: geo.distanceM,
  });
}
