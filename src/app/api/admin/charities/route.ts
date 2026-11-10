import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, action } = await req.json();
  const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  await prisma.charity.update({ where: { id }, data: { status } });
  return NextResponse.json({ message: `Charity ${status.toLowerCase()}` });
}
