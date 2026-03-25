import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { getTenantUrl, getRootUrl } from "@/lib/tenant";

/**
 * Post-login redirect handler.
 * Checks if the user belongs to an org and redirects accordingly.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(getRootUrl("/login"));
  }

  // Find user's first org
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: { select: { slug: true } } },
  });

  if (membership?.organization?.slug) {
    return NextResponse.redirect(
      getTenantUrl(membership.organization.slug, "/")
    );
  }

  // No org — redirect to onboarding
  return NextResponse.redirect(getRootUrl("/onboarding"));
}
