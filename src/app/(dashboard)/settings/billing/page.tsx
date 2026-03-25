"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  getBillingInfo,
  createCheckoutSession,
  createBillingPortalSession,
  type BillingInfo,
} from "@/lib/actions/billing";
import { CreditCard, ExternalLink, Loader2, Check } from "lucide-react";

const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_BADGE_VARIANT: Record<string, "secondary" | "default" | "outline"> = {
  free: "secondary",
  starter: "default",
  pro: "default",
  enterprise: "default",
};

function formatLimit(value: number): string {
  if (value === Infinity) return "Unlimited";
  return value.toLocaleString();
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const info = await getBillingInfo();
        setBilling(info);
      } catch {
        toast.error("Failed to load billing info");
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription updated successfully");
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled");
    }
  }, [searchParams]);

  async function handleUpgrade(priceId: string) {
    setCheckoutLoading(priceId);
    const result = await createCheckoutSession(priceId);

    if (!result.success) {
      toast.error(result.error);
      setCheckoutLoading(null);
      return;
    }

    if (result.url) {
      window.location.href = result.url;
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    const result = await createBillingPortalSession();

    if (!result.success) {
      toast.error(result.error);
      setPortalLoading(false);
      return;
    }

    if (result.url) {
      window.location.href = result.url;
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading billing info...</p>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Unable to load billing info</p>
      </div>
    );
  }

  const starterPriceId = process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and plan
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                {billing.hasSubscription && billing.currentPeriodEnd
                  ? `Renews ${new Date(billing.currentPeriodEnd).toLocaleDateString()}`
                  : "No active subscription"}
              </CardDescription>
            </div>
            <Badge variant={PLAN_BADGE_VARIANT[billing.plan] || "secondary"}>
              {PLAN_NAMES[billing.plan] || billing.plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Team members", used: billing.seatsUsed, max: billing.maxSeats },
              { label: "Spaces", used: billing.spacesUsed, max: billing.maxSpaces },
              { label: "External shares", used: billing.externalSharesUsed, max: billing.maxExternalShares },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold">{stat.used}</span>
                  <span className="text-xs text-muted-foreground">/ {formatLimit(stat.max)}</span>
                </div>
                {stat.max !== Infinity && stat.max > 0 && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-muted">
                    <div
                      className="h-full rounded-sm bg-primary"
                      style={{ width: `${Math.min((stat.used / stat.max) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manage Subscription */}
      {billing.hasSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Manage subscription</CardTitle>
            <CardDescription>
              Update payment method, view invoices, or cancel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              variant="outline"
            >
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Open billing portal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      {billing.plan !== "enterprise" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {billing.plan === "free" ? "Upgrade your plan" : "Change plan"}
            </CardTitle>
            <CardDescription>
              Get more features and higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {billing.plan === "free" && starterPriceId && (
                <div className="rounded-sm border p-5">
                  <h3 className="text-sm font-semibold">Starter</h3>
                  <div className="mt-2 flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold">$4</span>
                    <span className="text-xs text-muted-foreground">/user/mo</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {["Up to 50 members", "Unlimited spaces", "5 GB storage", "5 external shares"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => handleUpgrade(starterPriceId)}
                    disabled={checkoutLoading === starterPriceId}
                  >
                    {checkoutLoading === starterPriceId && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Upgrade to Starter
                  </Button>
                </div>
              )}

              {(billing.plan === "free" || billing.plan === "starter") &&
                proPriceId && (
                  <div className="rounded-sm border border-primary p-5 shadow-[0_0_0_1px_var(--primary)]">
                    <h3 className="text-sm font-semibold">Pro</h3>
                    <div className="mt-2 flex items-baseline gap-0.5">
                      <span className="text-2xl font-bold">$8</span>
                      <span className="text-xs text-muted-foreground">/user/mo</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {["Unlimited members", "Unlimited spaces", "50 GB storage", "Unlimited shares"].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => handleUpgrade(proPriceId)}
                      disabled={checkoutLoading === proPriceId}
                    >
                      {checkoutLoading === proPriceId && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
