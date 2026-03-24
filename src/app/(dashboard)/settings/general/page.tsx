"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { getOrgSettings, updateOrgName } from "@/lib/actions/settings";

export default function GeneralSettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const settings = await getOrgSettings();
      if (settings) {
        setOrgName(settings.name);
        setOrgSlug(settings.slug);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await updateOrgName(orgName);
    if (result.success) {
      toast.success("Organization name updated");
    } else {
      toast.error(result.error || "Failed to update");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">General settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization&apos;s basic information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization name</CardTitle>
          <CardDescription>
            This is the name displayed throughout the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex items-end gap-3">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subdomain</CardTitle>
          <CardDescription>
            Your workspace URL. This cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={orgSlug} disabled className="font-mono" />
            <span className="shrink-0 text-sm text-muted-foreground">
              .discusslabs.com
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
