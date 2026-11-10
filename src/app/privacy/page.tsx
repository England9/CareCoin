import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrivacyForm } from "./privacy-form";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/privacy");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-teal-950">Privacy settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Care Coin collects consent-based demographics, approximate location, event participation,
          and engagement metrics for aggregated insights. Precise GPS is requested only during
          check-in and check-out.
        </p>
      </div>
      <PrivacyForm
        shareDemographics={user.shareDemographics}
        shareApproxLocation={user.shareApproxLocation}
        ageRange={user.ageRange ?? ""}
      />
    </div>
  );
}
