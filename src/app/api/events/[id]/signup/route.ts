import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "VOLUNTEER") {
    return NextResponse.json({ error: "Only volunteers can sign up" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { signups: true } }, charity: true },
  });
  if (!event || event.charity.status !== "APPROVED") {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event._count.signups >= event.maxVolunteers) {
    return NextResponse.json({ error: "Event is full" }, { status: 400 });
  }

  await prisma.eventSignup.upsert({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
    create: { eventId: id, userId: session.user.id },
    update: {},
  });
  await prisma.attendance.upsert({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
    create: { eventId: id, userId: session.user.id, status: "REGISTERED" },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
