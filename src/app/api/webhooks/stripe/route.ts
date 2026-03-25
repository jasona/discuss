import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] error handling ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ───────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.client_reference_id || session.metadata?.orgId;
  if (!orgId) {
    console.error("[stripe webhook] no orgId in checkout session");
    return;
  }

  // Set Stripe customer ID on the org
  if (session.customer) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId: session.customer as string },
    });
  }

  // Retrieve the subscription to get plan details
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    await syncSubscription(orgId, subscription);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.orgId;

  // Find org by Stripe customer ID if no metadata
  let resolvedOrgId: string | undefined = orgId;
  if (!resolvedOrgId) {
    const org = await prisma.organization.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
      select: { id: true },
    });
    resolvedOrgId = org?.id;
  }

  if (!resolvedOrgId) {
    console.error("[stripe webhook] cannot resolve org for subscription update");
    return;
  }

  await syncSubscription(resolvedOrgId, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: subscription.customer as string },
    select: { id: true },
  });

  if (!org) return;

  // Downgrade to free plan
  await prisma.subscription.updateMany({
    where: { orgId: org.id },
    data: {
      plan: "free",
      status: "canceled",
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
    select: { id: true },
  });

  if (!org) return;

  await prisma.subscription.updateMany({
    where: { orgId: org.id },
    data: { status: "past_due" },
  });
}

// ─── Helpers ────────────────────────────────────────────

function resolvePlan(priceId: string): "free" | "starter" | "pro" | "enterprise" {
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (priceId === starterPriceId) return "starter";
  if (priceId === proPriceId) return "pro";

  // Default to starter if unknown
  return "starter";
}

async function syncSubscription(
  orgId: string,
  subscription: Stripe.Subscription
) {
  const item = subscription.items.data[0];
  if (!item) return;

  const plan = resolvePlan(item.price.id);
  const seatCount = item.quantity || 1;

  // Period info is on subscription items in newer Stripe API versions
  const periodStart = item.current_period_start
    ? new Date(item.current_period_start * 1000)
    : null;
  const periodEnd = item.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;

  const data = {
    stripeSubscriptionId: subscription.id,
    stripePriceId: item.price.id,
    plan,
    status: subscription.status === "active" ? "active" as const : "past_due" as const,
    seatCount,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  };

  await prisma.subscription.upsert({
    where: { orgId },
    create: { orgId, ...data },
    update: data,
  });
}
