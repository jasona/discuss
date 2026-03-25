"use client";

import { useEffect, useState } from "react";
import { getTenantUrl } from "@/lib/tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus } from "lucide-react";
import { getUserOrgs } from "@/lib/actions/user-orgs";

interface Org {
  id: string;
  name: string;
  slug: string;
}

interface OrgSwitcherProps {
  currentOrgSlug: string;
  currentOrgName: string;
}

export function OrgSwitcher({ currentOrgSlug, currentOrgName }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState<Org[]>([]);

  useEffect(() => {
    getUserOrgs().then(setOrgs);
  }, []);

  function switchOrg(slug: string) {
    if (slug === currentOrgSlug) return;
    window.location.href = getTenantUrl(slug, "/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-sidebar-hover">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground">
            {currentOrgName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-sm font-medium">
            {currentOrgName}
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-text-dim" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrg(org.slug)}
            className={
              org.slug === currentOrgSlug ? "bg-accent" : ""
            }
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            (window.location.href = getTenantUrl(currentOrgSlug, "/onboarding"))
          }
        >
          <Plus className="h-4 w-4" />
          <span>Create organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
