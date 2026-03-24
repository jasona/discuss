"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createOrg, checkSlugAvailability } from "@/lib/actions/org";
import { getTenantUrl } from "@/lib/tenant";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [slugError, setSlugError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const router = useRouter();

  // Auto-generate slug from org name
  function handleOrgNameChange(value: string) {
    setOrgName(value);
    const generated = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    setSlug(generated);
  }

  // Debounced slug availability check
  const checkSlug = useCallback(async (value: string) => {
    if (value.length < 3) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    const result = await checkSlugAvailability(value);
    if (result.available) {
      setSlugStatus("available");
      setSlugError("");
    } else {
      setSlugStatus(result.error?.includes("reserved") ? "taken" : result.error?.includes("taken") ? "taken" : "invalid");
      setSlugError(result.error || "Invalid slug");
    }
  }, []);

  useEffect(() => {
    if (slug.length < 3) {
      setSlugStatus("idle");
      return;
    }

    const timer = setTimeout(() => checkSlug(slug), 400);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (slugStatus !== "available") return;

    setLoading(true);
    const result = await createOrg(orgName, slug);

    if (!result.success) {
      toast.error(result.error || "Failed to create organization");
      setLoading(false);
      return;
    }

    setCreatedSlug(result.slug!);
    setStep(2);
    setLoading(false);
  }

  async function handleFinish() {
    // Redirect to the org subdomain
    const url = getTenantUrl(createdSlug, "/");
    window.location.href = url;
  }

  if (step === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">You&apos;re all set!</CardTitle>
            <CardDescription>
              Your workspace is ready at{" "}
              <span className="font-mono text-primary">
                {createdSlug}.discusslabs.com
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button onClick={handleFinish} className="w-full">
              Go to your workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Create your workspace
          </CardTitle>
          <CardDescription>
            Set up your organization to start collaborating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrg} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Inc."
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  type="text"
                  placeholder="acme"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  required
                  minLength={3}
                  maxLength={40}
                  className="font-mono"
                />
                <span className="shrink-0 text-sm text-muted-foreground">
                  .discusslabs.com
                </span>
              </div>
              <div className="h-5">
                {slugStatus === "checking" && (
                  <p className="text-xs text-muted-foreground">Checking...</p>
                )}
                {slugStatus === "available" && (
                  <Badge variant="secondary" className="text-xs text-green-600">
                    Available
                  </Badge>
                )}
                {(slugStatus === "taken" || slugStatus === "invalid") && (
                  <p className="text-xs text-destructive">{slugError}</p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || slugStatus !== "available"}
            >
              {loading ? "Creating workspace..." : "Create workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
