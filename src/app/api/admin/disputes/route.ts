import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, action } = await req.json();
  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "RESOLVE") {
    await prisma.$transaction([
      prisma.dispute.update({
        where: { id },
        data: {
          status: "RESOLVED",
          resolution: "Admin resolved in favor of volunteer review path",
          reviewerId: session.user.id,
        },
      }),
      prisma.attendance.update({
        where: { id: dispute.attendanceId },
        data: { status: "CHECKED_OUT", notes: "Returned to charity verification after dispute" },
      }),
    ]);
    return NextResponse.json({ message: "Dispute resolved — returned to verification queue" });
  }

  await prisma.$transaction([
    prisma.dispute.update({
      where: { id },
      data: {
        status: "REJECTED",
        resolution: "Dispute dismissed",
        reviewerId: session.user.id,
      },
    }),
    prisma.attendance.update({
      where: { id: dispute.attendanceId },
      data: { status: "VERIFIED" },
    }),
  ]);
  return NextResponse.json({ message: "Dispute dismissed" });
}
