"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import {
  getShareStatus,
  toggleExternalSharing,
  type ShareStatus,
} from "@/lib/actions/sharing";

interface ShareDialogProps {
  pageId: string;
}

export function ShareDialog({ pageId }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ShareStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getShareStatus(pageId)
        .then(setStatus)
        .catch(() => toast.error("Failed to load sharing status"))
        .finally(() => setLoading(false));
    }
  }, [open, pageId]);

  async function handleToggle(enabled: boolean) {
    setToggling(true);
    const result = await toggleExternalSharing(pageId, enabled);

    if (!result.success) {
      toast.error(result.error);
      setToggling(false);
      return;
    }

    if (result.shareStatus) {
      setStatus(result.shareStatus);
    }
    setToggling(false);
    toast.success(enabled ? "Public sharing enabled" : "Public sharing disabled");
  }

  async function handleCopy() {
    if (!status?.publicUrl) return;
    await navigator.clipboard.writeText(status.publicUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
        <Share2 className="h-4 w-4" />
        Share
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share publicly</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this page without signing in.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-toggle" className="flex flex-col gap-1">
                <span>Share to web</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Publish a read-only version of this page
                </span>
              </Label>
              <Switch
                id="share-toggle"
                checked={status?.isShared ?? false}
                onCheckedChange={handleToggle}
                disabled={toggling}
              />
            </div>

            {status?.isShared && status.publicUrl && (
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={status.publicUrl}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
