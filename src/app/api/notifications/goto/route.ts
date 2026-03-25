import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/db";
import { getTenantSlug } from "@/lib/tenant.server";

/**
 * Redirect to the correct page URL given a pageId.
 * Resolves the spaceId so we can build the proper route.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const pageId = request.nextUrl.searchParams.get("pageId");
  if (!pageId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const tenantSlug = await getTenantSlug();
  if (!tenantSlug) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      organization: { slug: tenantSlug },
    },
    select: { spaceId: true },
  });

  if (!page) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(
    new URL(`/${page.spaceId}/${pageId}`, request.url)
  );
}
