import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["VOLUNTEER", "CHARITY"]),
  city: z.string().min(1),
  state: z.string().min(1),
  charityName: z.string().optional(),
  charityDescription: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: body.name,
        role: body.role,
        city: body.city,
        state: body.state,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(body.name)}`,
        isDemo: false,
        shareApproxLocation: true,
      },
    });

    if (body.role === "CHARITY") {
      await prisma.charity.create({
        data: {
          userId: user.id,
          name: body.charityName || `${body.name}'s Charity`,
          description: body.charityDescription || "Pending organization profile",
          status: "PENDING",
          sdgs: JSON.stringify([11, 17]),
          city: body.city,
          state: body.state,
          lat: 34.0195,
          lng: -118.4912,
          isDemo: false,
        },
      });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }
}
