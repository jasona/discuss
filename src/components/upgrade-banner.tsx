"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, ArrowUpRight } from "lucide-react";
import { getLimitWarnings } from "@/lib/actions/billing";

interface UpgradeBannerProps {
  orgId: string;
}

export function UpgradeBanner({ orgId }: UpgradeBannerProps) {
  const router = useRouter();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getLimitWarnings(orgId).then(setWarnings).catch(() => {});
  }, [orgId]);

  if (dismissed || warnings.length === 0) return null;

  return (
    <div className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-sm dark:bg-amber-950/30">
      <span className="flex-1 text-amber-800 dark:text-amber-200">
        {warnings[0]}.{" "}
        {warnings.length > 1 && `(+${warnings.length - 1} more) `}
        Consider upgrading your plan.
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={() => router.push("/settings/billing")}
      >
        <ArrowUpRight className="mr-1 h-3 w-3" />
        Upgrade
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
