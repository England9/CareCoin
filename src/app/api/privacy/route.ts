import { NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      shareDemographics: Boolean(body.shareDemographics),
      shareApproxLocation: Boolean(body.shareApproxLocation),
      ageRange: body.ageRange || null,
    },
  });
  return NextResponse.json({ message: "Privacy preferences saved" });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Admin accounts cannot self-delete in demo" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: session.user.id } });
  try {
    await signOut({ redirect: false });
  } catch {
    /* session cleared client-side */
  }
  return NextResponse.json({ ok: true });
}
