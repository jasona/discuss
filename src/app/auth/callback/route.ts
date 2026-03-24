export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTenantUrl, getRootUrl } from "@/lib/tenant";

/**
 * Auth callback handler.
 * After Supabase Auth confirms the session (email confirm, OAuth redirect),
 * this route exchanges the code for a session and redirects the user to:
 * - Their invitation acceptance page (if invite token present)
 * - Their org subdomain (if they belong to an org)
 * - The onboarding page (if they have no org)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const inviteToken = searchParams.get("invite");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If there's an invitation token, redirect to accept it
  if (inviteToken) {
    return NextResponse.redirect(getRootUrl(`/invite/${inviteToken}`));
  }

  // Check if the user belongs to any org
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(getRootUrl("/login"));
  }

  // Look up their orgs
  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id, organizations(slug)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (memberships?.organizations) {
    // Redirect to their org subdomain
    const orgs = memberships.organizations as unknown as
      | { slug: string }
      | { slug: string }[];
    const slug = Array.isArray(orgs) ? orgs[0]?.slug : orgs.slug;
    if (slug) {
      return NextResponse.redirect(getTenantUrl(slug, "/"));
    }
  }

  // No org — redirect to onboarding
  return NextResponse.redirect(getRootUrl("/onboarding"));
}
