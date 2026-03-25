import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { getRootUrl } from "@/lib/tenant";

/**
 * Post-login redirect handler.
 * Checks if the user belongs to an org and redirects with tenant param.
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    // Redirect to a page that sets the tenant cookie client-side
    return NextResponse.redirect(
      `${appUrl}/auth/set-tenant?slug=${membership.organization.slug}`
    );
  }

  // No org — redirect to onboarding
  return NextResponse.redirect(getRootUrl("/onboarding"));
}
