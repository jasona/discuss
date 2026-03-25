"use client";

import { useState } from "react";
import {
  FileText,
  FolderTree,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Archive,
  CreditCard,
  Bold,
  Italic,
  Strikethrough,
  Link,
  Code,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Table,
  Image,
  Minus,
  MoreHorizontal,
  Check,
  Copy,
  AtSign,
  MessageSquare,
  Mail,
  Share2,
  UserPlus,
  MoreVertical,
  X,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// ─── Design Tokens ──────────────────────────────────────

const t = {
  // Sidebar (dark)
  sidebarBg: "#0a0f1e",
  sidebarSurface: "#111827",
  sidebarBorder: "#1e293b",
  sidebarText: "#e2e8f0",
  sidebarTextMuted: "#64748b",
  sidebarTextDim: "#475569",
  sidebarHover: "#1a2332",
  sidebarActive: "rgba(0, 212, 170, 0.08)",
  sidebarActiveBorder: "#00d4aa",

  // Content (light)
  contentBg: "#ffffff",
  contentSurface: "#f8fafc",
  contentBorder: "#e2e8f0",
  contentBorderLight: "#f1f5f9",
  contentText: "#0f172a",
  contentTextMuted: "#64748b",
  contentTextDim: "#94a3b8",

  // Accent
  accent: "#00d4aa",
  accentHover: "#00e8bb",
  accentDim: "rgba(0, 212, 170, 0.1)",
  accentText: "#0a0f1e",

  // Role badges
  ownerBg: "#fef3c7",
  ownerText: "#92400e",
  adminBg: "#dbeafe",
  adminText: "#1e40af",
  editorBg: "#d1fae5",
  editorText: "#065f46",
  viewerBg: "#f1f5f9",
  viewerText: "#475569",

  // Status
  danger: "#ef4444",
  dangerBg: "#fef2f2",
};

// ─── Screen Selector ────────────────────────────────────

const SCREENS = [
  "Editor",
  "Viewer",
  "Members",
  "Billing",
  "Notifications",
  "Share",
  "Login",
] as const;

type Screen = (typeof SCREENS)[number];

export default function AppDesignSystem() {
  const [activeScreen, setActiveScreen] = useState<Screen>("Editor");

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Screen selector tabs */}
      <div
        className="sticky top-0 z-[60] flex items-center gap-1 border-b px-4 py-2"
        style={{ backgroundColor: t.sidebarBg, borderColor: t.sidebarBorder }}
      >
        <span
          className="mr-3 text-xs font-medium uppercase tracking-wider"
          style={{ color: t.sidebarTextDim }}
        >
          Screens
        </span>
        {SCREENS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveScreen(s)}
            className="px-3 py-1 text-xs font-medium transition-colors duration-100"
            style={{
              color: activeScreen === s ? t.accent : t.sidebarTextMuted,
              backgroundColor:
                activeScreen === s ? t.accentDim : "transparent",
              borderRadius: 4,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Render active screen */}
      {activeScreen === "Editor" && <EditorScreen />}
      {activeScreen === "Viewer" && <ViewerScreen />}
      {activeScreen === "Members" && <MembersScreen />}
      {activeScreen === "Billing" && <BillingScreen />}
      {activeScreen === "Notifications" && <NotificationsScreen />}
      {activeScreen === "Share" && <ShareScreen />}
      {activeScreen === "Login" && <LoginScreen />}
    </div>
  );
}

// ─── Shared: Sidebar ────────────────────────────────────

function AppSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const [engineeringOpen, setEngineeringOpen] = useState(true);

  if (collapsed) {
    return (
      <div
        className="flex w-12 shrink-0 flex-col items-center border-r py-3"
        style={{ backgroundColor: t.sidebarBg, borderColor: t.sidebarBorder }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: t.accent,
            color: t.accentText,
            borderRadius: 4,
          }}
        >
          A
        </div>
        <div className="mt-4">
          <Search className="h-4 w-4" style={{ color: t.sidebarTextDim }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-60 shrink-0 flex-col border-r"
      style={{ backgroundColor: t.sidebarBg, borderColor: t.sidebarBorder }}
    >
      {/* Org switcher */}
      <div className="border-b p-3" style={{ borderColor: t.sidebarBorder }}>
        <button className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 transition-colors duration-100"
          style={{ borderRadius: 4 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div
            className="flex h-7 w-7 items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: t.accent,
              color: t.accentText,
              borderRadius: 4,
            }}
          >
            A
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-sm font-medium" style={{ color: t.sidebarText }}>
              Acme Engineering
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: t.sidebarTextDim }} />
        </button>
      </div>

      {/* Search */}
      <div className="border-b p-3" style={{ borderColor: t.sidebarBorder }}>
        <button
          className="flex w-full items-center gap-2 border px-2.5 py-1.5 transition-colors duration-100"
          style={{
            borderColor: t.sidebarBorder,
            borderRadius: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.sidebarTextDim)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.sidebarBorder)}
        >
          <Search className="h-3.5 w-3.5" style={{ color: t.sidebarTextDim }} />
          <span className="flex-1 text-left text-xs" style={{ color: t.sidebarTextDim }}>
            Search...
          </span>
          <kbd
            className="border px-1 text-[10px]"
            style={{
              borderColor: t.sidebarBorder,
              color: t.sidebarTextDim,
              borderRadius: 2,
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Space tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {[
          {
            icon: "📐",
            name: "Engineering",
            open: engineeringOpen,
            toggle: () => setEngineeringOpen(!engineeringOpen),
            pages: [
              { name: "API Documentation", active: true },
              { name: "Architecture Decisions", active: false },
              { name: "Deployment Runbooks", active: false },
              { name: "Incident Response", active: false },
              { name: "Onboarding Guide", active: false },
            ],
          },
          { icon: "🎨", name: "Design", open: false, toggle: () => {}, pages: [] },
          { icon: "📊", name: "Product", open: false, toggle: () => {}, pages: [] },
        ].map((space) => (
          <div key={space.name} className="mb-0.5">
            <button
              onClick={space.toggle}
              className="flex w-full items-center gap-1.5 px-2 py-1.5 transition-colors duration-100"
              style={{ borderRadius: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.sidebarHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <ChevronRight
                className="h-3 w-3 transition-transform duration-150"
                style={{
                  color: t.sidebarTextDim,
                  transform: space.open ? "rotate(90deg)" : "none",
                }}
              />
              <span className="text-sm">{space.icon}</span>
              <span className="text-xs font-medium" style={{ color: t.sidebarText }}>
                {space.name}
              </span>
            </button>

            {space.open &&
              space.pages.map((page) => (
                <button
                  key={page.name}
                  className="flex w-full items-center gap-2 py-1 pl-7 pr-2 transition-colors duration-100"
                  style={{
                    backgroundColor: page.active ? t.sidebarActive : "transparent",
                    borderRadius: 4,
                    borderLeft: page.active ? `2px solid ${t.sidebarActiveBorder}` : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!page.active) e.currentTarget.style.backgroundColor = t.sidebarHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!page.active) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FileText
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: page.active ? t.accent : t.sidebarTextDim }}
                  />
                  <span
                    className="truncate text-xs"
                    style={{
                      color: page.active ? t.accent : t.sidebarTextMuted,
                      fontWeight: page.active ? 500 : 400,
                    }}
                  >
                    {page.name}
                  </span>
                </button>
              ))}
          </div>
        ))}
      </div>

      {/* User menu */}
      <div className="border-t p-2" style={{ borderColor: t.sidebarBorder }}>
        <button
          className="flex w-full items-center gap-2.5 px-2 py-1.5 transition-colors duration-100"
          style={{ borderRadius: 4 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.sidebarHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div
            className="flex h-7 w-7 items-center justify-center text-xs font-semibold"
            style={{
              backgroundColor: t.sidebarSurface,
              color: t.sidebarText,
              borderRadius: 4,
            }}
          >
            SC
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-xs font-medium" style={{ color: t.sidebarText }}>
              Sarah Chen
            </div>
            <div className="truncate text-[10px]" style={{ color: t.sidebarTextDim }}>
              sarah@acme.dev
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Shared: Header ─────────────────────────────────────

function AppHeader({ unreadCount = 3 }: { unreadCount?: number }) {
  return (
    <header
      className="flex h-11 items-center justify-between border-b px-4"
      style={{ borderColor: t.contentBorder }}
    >
      <button
        className="flex h-7 w-7 items-center justify-center transition-colors duration-100"
        style={{ borderRadius: 4, color: t.contentTextMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <PanelLeftClose className="h-4 w-4" />
      </button>

      <button
        className="relative flex h-7 w-7 items-center justify-center transition-colors duration-100"
        style={{ borderRadius: 4, color: t.contentTextMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center px-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: t.danger, borderRadius: 8 }}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}

// ─── Shared: Shell ──────────────────────────────────────

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-36px)]" style={{ backgroundColor: t.contentBg }}>
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ─── 1. Editor Screen ───────────────────────────────────

function EditorScreen() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: t.contentTextDim }}>
          <span className="transition-colors duration-100 hover:underline" style={{ cursor: "pointer" }}>
            Engineering
          </span>
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: t.contentTextMuted }}>API Documentation</span>
        </div>

        {/* Share + Comments buttons */}
        <div className="mt-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors duration-100"
              style={{
                borderColor: t.contentBorder,
                color: t.contentTextMuted,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.color = t.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.contentBorder;
                e.currentTarget.style.color = t.contentTextMuted;
              }}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <button
              className="flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors duration-100"
              style={{
                borderColor: t.contentBorder,
                color: t.contentTextMuted,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Comments
              <span
                className="ml-0.5 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: t.contentSurface,
                  color: t.contentTextMuted,
                  borderRadius: 8,
                }}
              >
                4
              </span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1
          className="mt-4 text-3xl font-bold leading-tight tracking-tight outline-none"
          style={{ color: t.contentText }}
          contentEditable
          suppressContentEditableWarning
        >
          API Documentation
        </h1>

        {/* Meta */}
        <p className="mt-2 text-xs" style={{ color: t.contentTextDim }}>
          Last edited by{" "}
          <span style={{ color: t.contentTextMuted }}>Sarah Chen</span> · 2 hours ago
        </p>

        {/* Toolbar */}
        <div
          className="mt-5 flex items-center gap-0.5 border-b pb-3"
          style={{ borderColor: t.contentBorderLight }}
        >
          {/* Text style dropdown */}
          <button
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors duration-100"
            style={{ color: t.contentTextMuted, borderRadius: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Paragraph
            <ChevronDown className="h-3 w-3" />
          </button>

          <div className="mx-1 h-4 w-px" style={{ backgroundColor: t.contentBorderLight }} />

          {[Bold, Italic, Strikethrough].map((Icon, i) => (
            <ToolbarButton key={i} Icon={Icon} active={i === 0} />
          ))}

          <div className="mx-1 h-4 w-px" style={{ backgroundColor: t.contentBorderLight }} />

          <ToolbarButton Icon={Link} />
          <ToolbarButton Icon={Code} />

          <div className="mx-1 h-4 w-px" style={{ backgroundColor: t.contentBorderLight }} />

          {[List, ListOrdered, ListChecks].map((Icon, i) => (
            <ToolbarButton key={i} Icon={Icon} />
          ))}

          <div className="mx-1 h-4 w-px" style={{ backgroundColor: t.contentBorderLight }} />

          <ToolbarButton Icon={Quote} />
          <ToolbarButton Icon={Table} />
          <ToolbarButton Icon={Image} />
          <ToolbarButton Icon={Minus} />

          <div className="mx-1 h-4 w-px" style={{ backgroundColor: t.contentBorderLight }} />

          <button
            className="flex items-center gap-1 px-2 py-1 text-xs transition-colors duration-100"
            style={{
              color: t.contentTextDim,
              borderRadius: 4,
              fontFamily: "var(--font-geist-mono)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {"</>"}
          </button>

          <ToolbarButton Icon={MoreHorizontal} />

          {/* Save status */}
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
            <span className="text-[11px]" style={{ color: t.contentTextDim }}>
              Saved
            </span>
          </div>
        </div>

        {/* Editor content */}
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: t.contentText }}>
            Authentication
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: t.contentTextMuted }}>
            All API requests require a valid API key passed via the{" "}
            <code
              className="border px-1 py-0.5 text-xs"
              style={{
                backgroundColor: t.contentSurface,
                borderColor: t.contentBorder,
                borderRadius: 3,
                fontFamily: "var(--font-geist-mono)",
                color: t.contentText,
              }}
            >
              Authorization
            </code>{" "}
            header. You can generate API keys from the Settings page in your dashboard. Keep your keys
            secure and never commit them to version control.
          </p>

          {/* Code block */}
          <div
            className="border"
            style={{
              backgroundColor: t.sidebarBg,
              borderColor: t.sidebarBorder,
              borderRadius: 4,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-3 py-1.5"
              style={{ borderColor: t.sidebarBorder }}
            >
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: t.sidebarTextDim, fontFamily: "var(--font-geist-mono)" }}
              >
                bash
              </span>
              <button
                className="flex items-center gap-1 text-[10px] transition-colors duration-100"
                style={{ color: t.sidebarTextDim }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.sidebarText)}
                onMouseLeave={(e) => (e.currentTarget.style.color = t.sidebarTextDim)}
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <pre
              className="overflow-x-auto p-3 text-xs leading-relaxed"
              style={{ color: t.sidebarText, fontFamily: "var(--font-geist-mono)" }}
            >
              {`curl -X GET https://api.acme.dev/v1/documents \\
  -H "Authorization: Bearer sk_live_a1b2c3d4e5f6" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>

          <ul className="space-y-1.5 pl-5" style={{ listStyleType: "disc" }}>
            {[
              "API keys are scoped to the organization level",
              "Rotate keys every 90 days for security",
              "Rate limit: 1,000 requests per minute",
            ].map((item) => (
              <li key={item} className="text-sm" style={{ color: t.contentTextMuted }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function ToolbarButton({
  Icon,
  active = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <button
      className="flex h-7 w-7 items-center justify-center transition-colors duration-100"
      style={{
        color: active ? t.accent : t.contentTextDim,
        backgroundColor: active ? t.accentDim : "transparent",
        borderRadius: 4,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = t.contentSurface;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

// ─── 2. Viewer Screen ───────────────────────────────────

function ViewerScreen() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-6">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: t.contentTextDim }}>
          <span>Engineering</span>
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: t.contentTextMuted }}>API Documentation</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight" style={{ color: t.contentText }}>
          API Documentation
        </h1>
        <p className="mt-2 text-xs" style={{ color: t.contentTextDim }}>
          Last updated{" "}
          <span style={{ color: t.contentTextMuted }}>Mar 25, 2026</span> · 2 hours ago
        </p>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: t.contentText }}>
            Authentication
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: t.contentTextMuted }}>
            All API requests require a valid API key passed via the Authorization header.
            You can generate API keys from the Settings page in your dashboard.
          </p>
          <div
            className="border p-3"
            style={{
              backgroundColor: t.sidebarBg,
              borderColor: t.sidebarBorder,
              borderRadius: 4,
            }}
          >
            <pre
              className="text-xs leading-relaxed"
              style={{ color: t.sidebarText, fontFamily: "var(--font-geist-mono)" }}
            >
              {`curl -X GET https://api.acme.dev/v1/documents \\
  -H "Authorization: Bearer sk_live_a1b2c3d4e5f6"`}
            </pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── 3. Members Screen ──────────────────────────────────

function MembersScreen() {
  const members = [
    { name: "Sarah Chen", email: "sarah@acme.dev", role: "Owner" as const, joined: "Jan 12, 2026" },
    { name: "Marcus Rivera", email: "marcus@acme.dev", role: "Admin" as const, joined: "Feb 3, 2026" },
    { name: "Priya Sharma", email: "priya@acme.dev", role: "Editor" as const, joined: "Feb 18, 2026" },
    { name: "James Okoro", email: "james@acme.dev", role: "Viewer" as const, joined: "Mar 1, 2026" },
    { name: "Alex Kim", email: "alex@acme.dev", role: "Editor" as const, joined: "Mar 10, 2026" },
  ];

  const roleBadge = (role: "Owner" | "Admin" | "Editor" | "Viewer") => {
    const styles = {
      Owner: { bg: t.ownerBg, color: t.ownerText },
      Admin: { bg: t.adminBg, color: t.adminText },
      Editor: { bg: t.editorBg, color: t.editorText },
      Viewer: { bg: t.viewerBg, color: t.viewerText },
    };
    const s = styles[role];
    return (
      <span
        className="inline-flex px-2 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: s.bg, color: s.color, borderRadius: 3 }}
      >
        {role}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: t.contentText }}>
              Members
            </h1>
            <p className="mt-1 text-sm" style={{ color: t.contentTextDim }}>
              Manage who has access to this workspace
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-100"
            style={{
              backgroundColor: t.accent,
              color: t.accentText,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.accentHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = t.accent)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite member
          </button>
        </div>

        {/* Members table */}
        <div className="mt-6 border" style={{ borderColor: t.contentBorder, borderRadius: 4 }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: t.contentSurface }}>
                <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: t.contentTextDim }}>
                  Member
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: t.contentTextDim }}>
                  Role
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: t.contentTextDim }}>
                  Joined
                </th>
                <th className="w-10 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={m.email}
                  className="border-t transition-colors duration-100"
                  style={{ borderColor: t.contentBorderLight }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: t.sidebarBg,
                          color: t.sidebarText,
                          borderRadius: 4,
                        }}
                      >
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: t.contentText }}>
                          {m.name}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: t.contentTextDim, fontFamily: "var(--font-geist-mono)" }}
                        >
                          {m.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{roleBadge(m.role)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: t.contentTextDim }}>
                    {m.joined}
                  </td>
                  <td className="px-4 py-3">
                    {m.role !== "Owner" && (
                      <button
                        className="flex h-7 w-7 items-center justify-center transition-colors duration-100"
                        style={{ color: t.contentTextDim, borderRadius: 4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending invitations */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold" style={{ color: t.contentText }}>
            Pending invitations
          </h2>
          <div
            className="mt-3 flex items-center justify-between border px-4 py-3"
            style={{ borderColor: t.contentBorder, borderRadius: 4 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center"
                style={{ backgroundColor: t.contentSurface, borderRadius: 4 }}
              >
                <Mail className="h-4 w-4" style={{ color: t.contentTextDim }} />
              </div>
              <div>
                <div
                  className="text-sm"
                  style={{ color: t.contentText, fontFamily: "var(--font-geist-mono)" }}
                >
                  dev@newcorp.com
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: t.contentTextDim }}>
                  {roleBadge("Editor")}
                  <span>· Expires in 5 days</span>
                </div>
              </div>
            </div>
            <button
              className="text-xs transition-colors duration-100"
              style={{ color: t.danger }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── 4. Billing Screen ──────────────────────────────────

function BillingScreen() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-6">
        <h1 className="text-xl font-bold" style={{ color: t.contentText }}>
          Billing
        </h1>
        <p className="mt-1 text-sm" style={{ color: t.contentTextDim }}>
          Manage your subscription and plan
        </p>

        {/* Current plan */}
        <div
          className="mt-6 border p-5"
          style={{ borderColor: t.contentBorder, borderRadius: 4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold" style={{ color: t.contentText }}>
                  Current plan
                </h2>
                <span
                  className="px-2 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: t.adminBg, color: t.adminText, borderRadius: 3 }}
                >
                  Starter
                </span>
              </div>
              <p className="mt-1 text-xs" style={{ color: t.contentTextDim }}>
                Renews Apr 15, 2026
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors duration-100"
              style={{ borderColor: t.contentBorder, color: t.contentTextMuted, borderRadius: 4 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.color = t.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.contentBorder;
                e.currentTarget.style.color = t.contentTextMuted;
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Manage subscription
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">
            {[
              { label: "Team members", used: 5, max: 50 },
              { label: "Spaces", used: 2, max: "∞" },
              { label: "External shares", used: 1, max: 5 },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xs" style={{ color: t.contentTextDim }}>
                  {stat.label}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold" style={{ color: t.contentText }}>
                    {stat.used}
                  </span>
                  <span className="text-xs" style={{ color: t.contentTextDim }}>
                    / {stat.max}
                  </span>
                </div>
                {typeof stat.max === "number" && (
                  <div
                    className="mt-1.5 h-1 overflow-hidden"
                    style={{ backgroundColor: t.contentBorderLight, borderRadius: 2 }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${(stat.used / stat.max) * 100}%`,
                        backgroundColor: t.accent,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade */}
        <h2 className="mt-8 text-sm font-semibold" style={{ color: t.contentText }}>
          Upgrade your plan
        </h2>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {[
            {
              name: "Starter",
              price: "$4",
              current: true,
              features: ["Up to 50 members", "Unlimited spaces", "5 GB storage", "5 external shares"],
            },
            {
              name: "Pro",
              price: "$8",
              current: false,
              features: ["Unlimited members", "Unlimited spaces", "50 GB storage", "Unlimited shares"],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="border p-5"
              style={{
                borderColor: plan.current ? t.accent : t.contentBorder,
                borderRadius: 4,
                boxShadow: plan.current ? `0 0 0 1px ${t.accent}` : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: t.contentText }}>
                  {plan.name}
                </h3>
                {plan.current && (
                  <span className="text-[10px] font-medium" style={{ color: t.accent }}>
                    Current
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-2xl font-bold" style={{ color: t.contentText }}>
                  {plan.price}
                </span>
                <span className="text-xs" style={{ color: t.contentTextDim }}>
                  /user/mo
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: t.contentTextMuted }}>
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: t.accent }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 w-full py-2 text-xs font-medium transition-all duration-100"
                style={{
                  backgroundColor: plan.current ? "transparent" : t.accent,
                  color: plan.current ? t.contentTextDim : t.accentText,
                  border: plan.current ? `1px solid ${t.contentBorder}` : "none",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => {
                  if (!plan.current) e.currentTarget.style.backgroundColor = t.accentHover;
                }}
                onMouseLeave={(e) => {
                  if (!plan.current) e.currentTarget.style.backgroundColor = t.accent;
                }}
              >
                {plan.current ? "Current plan" : "Upgrade to Pro"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

// ─── 5. Notifications Screen ────────────────────────────

function NotificationsScreen() {
  const notifications = [
    {
      type: "mention" as const,
      message: "Sarah mentioned you in API Documentation",
      time: "5m ago",
      read: false,
    },
    {
      type: "reply" as const,
      message: "Marcus replied to your comment in Architecture Decisions",
      time: "1h ago",
      read: false,
    },
    {
      type: "invitation" as const,
      message: "You've been invited to join Acme Engineering",
      time: "3h ago",
      read: false,
    },
    {
      type: "mention" as const,
      message: "Priya mentioned you in Deployment Runbooks",
      time: "Yesterday",
      read: true,
    },
  ];

  const typeIcon = (type: "mention" | "reply" | "invitation") => {
    const config = {
      mention: { Icon: AtSign, color: "#3b82f6" },
      reply: { Icon: MessageSquare, color: t.accent },
      invitation: { Icon: Mail, color: "#a855f7" },
    };
    const c = config[type];
    return <c.Icon className="h-4 w-4 shrink-0" style={{ color: c.color }} />;
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-6">
        <p className="mb-4 text-xs" style={{ color: t.contentTextDim }}>
          Preview of the notification popover (shown inline here for design reference)
        </p>

        <div
          className="w-80 border"
          style={{ borderColor: t.contentBorder, borderRadius: 4, backgroundColor: t.contentBg }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: t.contentBorderLight }}
          >
            <h3 className="text-sm font-semibold" style={{ color: t.contentText }}>
              Notifications
            </h3>
            <button
              className="flex items-center gap-1 text-[11px] transition-colors duration-100"
              style={{ color: t.contentTextDim }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.contentTextMuted)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.contentTextDim)}
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          </div>

          <div>
            {notifications.map((n, i) => (
              <button
                key={i}
                className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors duration-100"
                style={{
                  borderColor: t.contentBorderLight,
                  backgroundColor: !n.read ? "rgba(0, 212, 170, 0.03)" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !n.read
                    ? "rgba(0, 212, 170, 0.03)"
                    : "transparent";
                }}
              >
                {typeIcon(n.type)}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: !n.read ? t.contentText : t.contentTextMuted,
                      fontWeight: !n.read ? 500 : 400,
                    }}
                  >
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: t.contentTextDim }}>
                    {n.time}
                  </p>
                </div>
                {!n.read && (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── 6. Share Screen ────────────────────────────────────

function ShareScreen() {
  const [shared, setShared] = useState(true);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-8 py-6">
        <p className="mb-4 text-xs" style={{ color: t.contentTextDim }}>
          Preview of the share dialog (shown inline here for design reference)
        </p>

        <div
          className="w-[420px] border"
          style={{ borderColor: t.contentBorder, borderRadius: 4, backgroundColor: t.contentBg }}
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: t.contentText }}>
                Share publicly
              </h3>
              <p className="mt-0.5 text-xs" style={{ color: t.contentTextDim }}>
                Anyone with the link can view this page
              </p>
            </div>
            <button
              className="flex h-7 w-7 items-center justify-center transition-colors duration-100"
              style={{ color: t.contentTextDim, borderRadius: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium" style={{ color: t.contentText }}>
                  Share to web
                </span>
                <span className="text-xs" style={{ color: t.contentTextDim }}>
                  Publish a read-only version
                </span>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setShared(!shared)}
                className="relative h-5 w-9 transition-colors duration-200"
                style={{
                  backgroundColor: shared ? t.accent : t.contentBorder,
                  borderRadius: 10,
                }}
              >
                <span
                  className="absolute top-0.5 h-4 w-4 bg-white transition-transform duration-200"
                  style={{
                    borderRadius: 8,
                    transform: shared ? "translateX(18px)" : "translateX(2px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                />
              </button>
            </div>

            {shared && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  readOnly
                  value="https://acme.discusslabs.com/public/a1b2c3d4e5f6"
                  className="flex-1 border px-3 py-1.5 text-xs outline-none"
                  style={{
                    borderColor: t.contentBorder,
                    borderRadius: 4,
                    color: t.contentText,
                    fontFamily: "var(--font-geist-mono)",
                    backgroundColor: t.contentSurface,
                  }}
                />
                <button
                  className="flex h-8 w-8 items-center justify-center border transition-colors duration-100"
                  style={{
                    borderColor: t.contentBorder,
                    borderRadius: 4,
                    color: t.contentTextMuted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = t.accent;
                    e.currentTarget.style.color = t.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = t.contentBorder;
                    e.currentTarget.style.color = t.contentTextMuted;
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── 7. Login Screen ────────────────────────────────────

function LoginScreen() {
  return (
    <div
      className="flex min-h-[calc(100vh-36px)] items-center justify-center"
      style={{ backgroundColor: t.contentSurface }}
    >
      <div
        className="w-full max-w-sm border bg-white p-6"
        style={{ borderColor: t.contentBorder, borderRadius: 4 }}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={{ backgroundColor: t.accent, borderRadius: 4 }}
          >
            <FileText className="h-4.5 w-4.5" style={{ color: t.accentText }} />
          </div>
          <span className="text-xl font-semibold tracking-tight" style={{ color: t.contentText }}>
            discuss
          </span>
        </div>

        <h1
          className="text-center text-lg font-bold"
          style={{ color: t.contentText }}
        >
          Welcome back
        </h1>
        <p className="mt-1 text-center text-xs" style={{ color: t.contentTextDim }}>
          Sign in to your Discuss account
        </p>

        {/* OAuth */}
        <div className="mt-5 grid gap-2">
          {["Google", "GitHub"].map((provider) => (
            <button
              key={provider}
              className="flex w-full items-center justify-center gap-2 border py-2 text-sm font-medium transition-colors duration-100"
              style={{
                borderColor: t.contentBorder,
                color: t.contentText,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.contentSurface)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Continue with {provider}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: `1px solid ${t.contentBorder}` }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="bg-white px-2 text-xs"
              style={{ color: t.contentTextDim }}
            >
              or
            </span>
          </div>
        </div>

        {/* Form */}
        <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-xs font-medium" style={{ color: t.contentText }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className="mt-1 w-full border px-3 py-2 text-sm outline-none transition-colors duration-100 focus:border-[#00d4aa]"
              style={{
                borderColor: t.contentBorder,
                borderRadius: 4,
                color: t.contentText,
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: t.contentText }}>
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full border px-3 py-2 text-sm outline-none transition-colors duration-100 focus:border-[#00d4aa]"
              style={{
                borderColor: t.contentBorder,
                borderRadius: 4,
                color: t.contentText,
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-sm font-medium transition-all duration-100"
            style={{
              backgroundColor: t.accent,
              color: t.accentText,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = t.accentHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = t.accent)}
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: t.contentTextDim }}>
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-medium transition-colors duration-100"
            style={{ color: t.accent }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.accentHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.accent)}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
