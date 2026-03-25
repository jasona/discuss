"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { useTheme } from "next-themes";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { OrgSwitcher } from "@/components/sidebar/org-switcher";
import { SpaceTree } from "@/components/sidebar/space-tree";
import { CommandPalette } from "@/components/search/command-palette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Archive,
  CreditCard,
} from "lucide-react";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface AppShellProps {
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: string;
  children: React.ReactNode;
}

export function AppShell({
  user,
  orgId,
  orgSlug,
  orgName,
  role,
  children,
}: AppShellProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const displayName = user.fullName || user.email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-3">
          <OrgSwitcher currentOrgSlug={orgSlug} currentOrgName={orgName} />
        </SidebarHeader>

        {/* Search trigger */}
        <div className="px-3 py-2">
          <button
            className="flex w-full items-center gap-2 rounded-sm border border-sidebar-border px-2.5 py-1.5 text-sidebar-text-muted transition-colors duration-100 hover:border-sidebar-text-dim"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                })
              );
            }}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left text-xs">Search...</span>
            <kbd className="pointer-events-none rounded-sm border border-sidebar-border px-1 font-mono text-[10px] text-sidebar-text-dim">
              ⌘K
            </kbd>
          </button>
        </div>

        <SidebarContent className="flex flex-1 flex-col overflow-hidden">
          <SpaceTree />
        </SidebarContent>

        <SidebarFooter className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-sidebar-hover">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                {displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-medium">{displayName}</p>
                {user.fullName && (
                  <p className="truncate text-[10px] text-sidebar-text-dim">
                    {user.email}
                  </p>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Theme submenu */}
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4" />
                System
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {(role === "owner" || role === "admin") && (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings/general")}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings/archived")}
                  >
                    <Archive className="h-4 w-4" />
                    Archived items
                  </DropdownMenuItem>
                  {role === "owner" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/settings/billing")}
                    >
                      <CreditCard className="h-4 w-4" />
                      Billing
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-11 items-center justify-between border-b px-4">
          <SidebarTrigger className="h-7 w-7 text-muted-foreground hover:bg-muted" />
          <NotificationBell />
        </header>

        {/* Upgrade banner */}
        <UpgradeBanner orgId={orgId} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>

      {/* Global command palette */}
      <CommandPalette />
    </SidebarProvider>
  );
}
