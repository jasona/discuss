"use server";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe/client";
import type Stripe from "stripe";
import { getOrgContext } from "@/lib/actions/context";
import { canManageBilling } from "@/lib/permissions";
import { PLAN_LIMITS, type PlanType } from "@/lib/constants";
import { getLimitWarnings as _getLimitWarnings } from "@/lib/plan-limits";

// ─── Types ──────────────────────────────────────────────

export interface BillingInfo {
  plan: PlanType;
  status: string;
  seatCount: number;
  seatsUsed: number;
  maxSeats: number;
  spacesUsed: number;
  maxSpaces: number;
  externalSharesUsed: number;
  maxExternalShares: number;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  hasSubscription: boolean;
}

// ─── Get Billing Info ───────────────────────────────────

export async function getBillingInfo(): Promise<BillingInfo> {
  const ctx = await getOrgContext();

  const [subscription, org, memberCount, spaceCount, externalShareCount] =
    await Promise.all([
      prisma.subscription.findFirst({
        where: { orgId: ctx.orgId },
      }),
      prisma.organization.findUnique({
        where: { id: ctx.orgId },
        select: { stripeCustomerId: true },
      }),
      prisma.orgMember.count({ where: { orgId: ctx.orgId } }),
      prisma.space.count({ where: { orgId: ctx.orgId, isArchived: false } }),
      prisma.page.count({
        where: { orgId: ctx.orgId, isExternallyShared: true },
      }),
    ]);

  const plan = (subscription?.plan || "free") as PlanType;
  const limits = PLAN_LIMITS[plan];

  return {
    plan,
    status: subscription?.status || "active",
    seatCount: subscription?.seatCount || 1,
    seatsUsed: memberCount,
    maxSeats: limits.maxUsers,
    spacesUsed: spaceCount,
    maxSpaces: limits.maxSpaces,
    externalSharesUsed: externalShareCount,
    maxExternalShares: limits.maxExternalShares,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() || null,
    stripeCustomerId: org?.stripeCustomerId || null,
    hasSubscription: !!subscription?.stripeSubscriptionId,
  };
}

// ─── Create Checkout Session ────────────────────────────

export async function createCheckoutSession(
  planPriceId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const ctx = await getOrgContext();

    if (!canManageBilling(ctx.role)) {
      return { success: false, error: "Only the organization owner can manage billing" };
    }

    const memberCount = await prisma.orgMember.count({
      where: { orgId: ctx.orgId },
    });

    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { stripeCustomerId: true, name: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://discusslabs.com";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: planPriceId,
          quantity: memberCount,
        },
      ],
      success_url: `${appUrl}/settings/billing?success=true`,
      cancel_url: `${appUrl}/settings/billing?canceled=true`,
      client_reference_id: ctx.orgId,
      metadata: { orgId: ctx.orgId },
    };

    if (org?.stripeCustomerId) {
      sessionParams.customer = org.stripeCustomerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { success: true, url: session.url || undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Create Billing Portal Session ──────────────────────

export async function createBillingPortalSession(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const ctx = await getOrgContext();

    if (!canManageBilling(ctx.role)) {
      return { success: false, error: "Only the organization owner can manage billing" };
    }

    const org = await prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { stripeCustomerId: true },
    });

    if (!org?.stripeCustomerId) {
      return { success: false, error: "No billing account found" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://discusslabs.com";

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${appUrl}/settings/billing`,
    });

    return { success: true, url: session.url };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Limit Warnings ─────────────────────────────────────

export async function getLimitWarnings(orgId: string): Promise<string[]> {
  return _getLimitWarnings(orgId);
}
