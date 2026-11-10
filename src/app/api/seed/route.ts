import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedMinimal } from "@/lib/seed-minimal";

/**
 * One-time / on-demand demo seed for Cloudflare D1.
 * Protected by SEED_SECRET (or AUTH_SECRET).
 */
export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET || process.env.AUTH_SECRET;
  const provided = req.headers.get("x-seed-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = new URL(req.url).searchParams.get("force") === "1";
  const existing = await prisma.user.count();
  if (existing > 0 && !force) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: `Database already has ${existing} users. Pass ?force=1 to wipe+reseed (destructive).`,
    });
  }

  try {
    const result = await seedMinimal(prisma, { force: force || existing > 0 });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: "Seed failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
