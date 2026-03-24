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
} from "lucide-react";

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

        <Separator />

        {/* Search trigger */}
        <div className="px-3 py-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => {
              // Trigger Cmd+K
              document.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                })
              );
            }}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left text-sm">Search...</span>
            <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </Button>
        </div>

        <Separator />

        <SidebarContent className="flex flex-1 flex-col overflow-hidden">
          <SpaceTree />
        </SidebarContent>

        <SidebarFooter className="border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initial}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{displayName}</p>
                {user.fullName && (
                  <p className="truncate text-xs text-muted-foreground">
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
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>

      {/* Global command palette */}
      <CommandPalette />
    </SidebarProvider>
  );
}
