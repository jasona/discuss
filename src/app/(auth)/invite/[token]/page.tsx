"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  getInvitationByToken,
  acceptInvitation,
} from "@/lib/actions/invitations";
import { getTenantUrl } from "@/lib/tenant";

interface InvitationInfo {
  orgName: string;
  role: string;
  email: string;
}

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Check auth status
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Fetch invitation details
      const inv = await getInvitationByToken(token);
      if (!inv) {
        setError("This invitation is invalid, expired, or has already been accepted.");
        setLoading(false);
        return;
      }

      const org = inv.organizations as { name: string; slug: string };
      setInvitation({
        orgName: org.name,
        role: inv.default_role,
        email: inv.email,
      });
      setLoading(false);
    }

    load();
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    const result = await acceptInvitation(token);

    if (!result.success) {
      toast.error(result.error || "Failed to accept invitation");
      setAccepting(false);
      return;
    }

    toast.success("Welcome to the team!");
    window.location.href = getTenantUrl(result.orgSlug!, "/");
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading invitation...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Invalid invitation</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Go to login
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            You&apos;re invited!
          </CardTitle>
          <CardDescription>
            <strong>{invitation?.orgName}</strong> invited you as{" "}
            <strong>{invitation?.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Link
            href={`/signup?invite=${token}`}
            className={buttonVariants({ className: "w-full" })}
          >
            Create an account to join
          </Link>
          <Link
            href={`/login?invite=${token}`}
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            Already have an account? Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Join {invitation?.orgName}</CardTitle>
        <CardDescription>
          You&apos;ve been invited as <strong>{invitation?.role}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full"
        >
          {accepting ? "Joining..." : "Accept invitation"}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full" })}>
          Decline
        </Link>
      </CardContent>
    </Card>
  );
}
