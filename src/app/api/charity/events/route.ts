import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CHARITY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const charity = await prisma.charity.findUnique({ where: { userId: session.user.id } });
  if (!charity || charity.status !== "APPROVED") {
    return NextResponse.json({ error: "Charity not approved" }, { status: 403 });
  }

  const startAt = new Date(String(body.startAt));
  const hoursRequired = Number(body.hoursRequired) || 3;
  const endAt = new Date(startAt.getTime() + hoursRequired * 60 * 60 * 1000);

  const event = await prisma.event.create({
    data: {
      charityId: charity.id,
      title: String(body.title),
      description: String(body.description),
      sdg: Number(body.sdg) || 11,
      address: String(body.address),
      city: String(body.city),
      state: String(body.state),
      lat: charity.lat + (Math.random() - 0.5) * 0.02,
      lng: charity.lng + (Math.random() - 0.5) * 0.02,
      startAt,
      endAt,
      hoursRequired,
      baseCoinReward: Number(body.baseCoinReward) || 400,
      topCoinBonus: 150,
      category: String(body.category || "community_service"),
      isSponsored: Boolean(body.isSponsored),
      isDemo: false,
      maxVolunteers: 50,
      geofenceRadiusM: 150,
    },
  });

  return NextResponse.json({ ok: true, id: event.id });
}
