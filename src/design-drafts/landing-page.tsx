"use client";

import { useState } from "react";
import {
  FileText,
  FolderTree,
  MessageSquare,
  Search,
  Check,
  ArrowRight,
  Star,
  Users,
  Globe,
  Shield,
  Code,
  Share2,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Bold,
  Italic,
  List,
  Image,
  Link,
  AtSign,
  Hash,
} from "lucide-react";

// ─── Palette ────────────────────────────────────────────

const palette = {
  navy: "#0a0f1e",
  navyLight: "#111827",
  surface: "#1a2235",
  surfaceHover: "#222d42",
  border: "#2a3550",
  borderLight: "#374363",
  text: "#e2e8f0",
  textMuted: "#8494b0",
  textDim: "#5a6a88",
  accent: "#00d4aa",
  accentHover: "#00e8bb",
  accentDim: "rgba(0, 212, 170, 0.12)",
  white: "#f8fafc",
  offWhite: "#f1f5f9",
  warmGray: "#0f1420",
};

// ─── Nav ────────────────────────────────────────────────

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 z-50 w-full border-b backdrop-blur-md"
      style={{
        backgroundColor: "rgba(10, 15, 30, 0.85)",
        borderColor: palette.border,
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded"
            style={{ backgroundColor: palette.accent, borderRadius: 4 }}
          >
            <FileText className="h-4 w-4" style={{ color: palette.navy }} />
          </div>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: palette.white }}
          >
            discuss
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6 text-sm">
            {["Features", "Pricing", "Docs"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="transition-colors duration-150 hover:opacity-100"
                style={{ color: palette.textMuted }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = palette.text)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = palette.textMuted)
                }
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm transition-colors duration-150"
              style={{ color: palette.textMuted }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = palette.text)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = palette.textMuted)
              }
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: palette.accent,
                color: palette.navy,
                borderRadius: 4,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = palette.accentHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = palette.accent)
              }
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          style={{ color: palette.text }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t px-6 py-4 md:hidden"
          style={{
            backgroundColor: palette.navy,
            borderColor: palette.border,
          }}
        >
          <div className="flex flex-col gap-3">
            {["Features", "Pricing", "Docs"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm"
                style={{ color: palette.textMuted }}
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
            <a href="/login" className="text-sm" style={{ color: palette.textMuted }}>
              Sign in
            </a>
            <a
              href="/signup"
              className="mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: palette.accent,
                color: palette.navy,
                borderRadius: 4,
              }}
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-14"
      style={{ backgroundColor: palette.navy }}
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${palette.text} 1px, transparent 1px), linear-gradient(90deg, ${palette.text} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 opacity-20"
        style={{
          background: `radial-gradient(ellipse at center, ${palette.accent}, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-28 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow */}
          <div
            className="mb-6 inline-flex items-center gap-2 border px-3 py-1 text-xs font-medium tracking-wide"
            style={{
              borderColor: palette.border,
              color: palette.accent,
              borderRadius: 4,
              backgroundColor: palette.accentDim,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
            Now in public beta
          </div>

          <h1
            className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl"
            style={{ color: palette.white }}
          >
            Your team&apos;s knowledge,
            <br />
            <span style={{ color: palette.accent }}>organized.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: palette.textMuted }}
          >
            The Markdown-native wiki that replaces bloated, expensive tools.
            Create, organize, and share documents — at a fraction of the cost.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: palette.accent,
                color: palette.navy,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = palette.accentHover;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = palette.accent;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border px-6 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                borderColor: palette.border,
                color: palette.textMuted,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = palette.borderLight;
                e.currentTarget.style.color = palette.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = palette.border;
                e.currentTarget.style.color = palette.textMuted;
              }}
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Product mockup */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}

// ─── Product Mockup (inline UI illustration) ────────────

function ProductMockup() {
  return (
    <div
      className="overflow-hidden border shadow-2xl"
      style={{
        borderColor: palette.border,
        borderRadius: 6,
        backgroundColor: palette.navyLight,
        boxShadow: `0 40px 80px -20px rgba(0, 0, 0, 0.6), 0 0 40px ${palette.accentDim}`,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: palette.border }}
      >
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div
          className="ml-3 flex-1 text-center text-xs"
          style={{ color: palette.textDim, fontFamily: "var(--font-geist-mono)" }}
        >
          acme.discusslabs.com
        </div>
      </div>

      <div className="flex" style={{ minHeight: 340 }}>
        {/* Sidebar */}
        <div
          className="hidden w-56 shrink-0 border-r p-3 md:block"
          style={{ borderColor: palette.border, backgroundColor: palette.warmGray }}
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: palette.accent,
                color: palette.navy,
                borderRadius: 3,
              }}
            >
              A
            </div>
            <span className="text-xs font-medium" style={{ color: palette.text }}>
              Acme Inc
            </span>
          </div>

          {/* Search */}
          <div
            className="mb-4 flex items-center gap-2 border px-2.5 py-1.5"
            style={{
              borderColor: palette.border,
              borderRadius: 4,
            }}
          >
            <Search className="h-3 w-3" style={{ color: palette.textDim }} />
            <span className="text-xs" style={{ color: palette.textDim }}>
              Search...
            </span>
            <span
              className="ml-auto border px-1 text-[9px]"
              style={{
                borderColor: palette.border,
                color: palette.textDim,
                borderRadius: 2,
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              ⌘K
            </span>
          </div>

          {/* Tree */}
          {[
            { icon: "📐", name: "Engineering", open: true, pages: ["API Docs", "Architecture", "Runbooks"] },
            { icon: "🎨", name: "Design", open: false, pages: [] },
            { icon: "📊", name: "Product", open: false, pages: [] },
          ].map((space) => (
            <div key={space.name} className="mb-1">
              <div className="flex items-center gap-1.5 py-1">
                <ChevronRight
                  className="h-3 w-3"
                  style={{
                    color: palette.textDim,
                    transform: space.open ? "rotate(90deg)" : "none",
                    transition: "transform 150ms",
                  }}
                />
                <span className="text-xs">{space.icon}</span>
                <span className="text-xs font-medium" style={{ color: palette.text }}>
                  {space.name}
                </span>
              </div>
              {space.open &&
                space.pages.map((page, i) => (
                  <div
                    key={page}
                    className="ml-5 flex items-center gap-1.5 py-0.5"
                    style={{
                      backgroundColor: i === 0 ? palette.accentDim : "transparent",
                      borderRadius: 3,
                      paddingLeft: 6,
                      paddingRight: 6,
                    }}
                  >
                    <FileText
                      className="h-3 w-3"
                      style={{ color: i === 0 ? palette.accent : palette.textDim }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: i === 0 ? palette.accent : palette.textMuted }}
                    >
                      {page}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="flex-1 p-5">
          {/* Toolbar */}
          <div
            className="mb-4 flex items-center gap-1 border-b pb-3"
            style={{ borderColor: palette.border }}
          >
            {[Bold, Italic, Code, Link, List, Image].map((Icon, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center"
                style={{
                  color: palette.textDim,
                  borderRadius: 3,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>

          {/* Title */}
          <h2
            className="mb-1 text-xl font-bold"
            style={{ color: palette.white }}
          >
            API Documentation
          </h2>
          <p className="mb-4 text-xs" style={{ color: palette.textDim }}>
            Last edited by Sarah Chen · 2 hours ago
          </p>

          {/* Content lines */}
          <div className="space-y-2.5">
            <div
              className="h-3 rounded"
              style={{ backgroundColor: palette.surface, width: "85%" }}
            />
            <div
              className="h-3 rounded"
              style={{ backgroundColor: palette.surface, width: "92%" }}
            />
            <div
              className="h-3 rounded"
              style={{ backgroundColor: palette.surface, width: "60%" }}
            />

            {/* Code block */}
            <div
              className="mt-3 border p-3"
              style={{
                backgroundColor: palette.warmGray,
                borderColor: palette.border,
                borderRadius: 4,
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: palette.textDim }}>
                <Hash className="h-3 w-3" style={{ color: palette.accent }} />
                <span style={{ color: palette.accent }}>GET</span>
                <span style={{ color: palette.textMuted }}>/api/v1/documents</span>
              </div>
            </div>

            <div
              className="h-3 rounded"
              style={{ backgroundColor: palette.surface, width: "78%" }}
            />
            <div
              className="h-3 rounded"
              style={{ backgroundColor: palette.surface, width: "88%" }}
            />
          </div>

          {/* Save indicator */}
          <div className="mt-4 flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />
            <span
              className="text-[10px]"
              style={{ color: palette.textDim }}
            >
              Saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ──────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: "500+", label: "Teams" },
    { value: "4.9★", label: "Avg. rating" },
    { value: "50k+", label: "Pages created" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section
      className="border-b border-t"
      style={{
        backgroundColor: palette.navyLight,
        borderColor: palette.border,
      }}
    >
      <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x md:grid-cols-4" style={{ borderColor: palette.border }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="px-6 py-6 text-center"
            style={{ borderColor: palette.border }}
          >
            <div
              className="text-2xl font-bold tracking-tight"
              style={{ color: palette.accent }}
            >
              {stat.value}
            </div>
            <div className="mt-1 text-xs" style={{ color: palette.textDim }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ───────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: FileText,
      title: "Rich editor + Markdown",
      description:
        "WYSIWYG editing with a one-click toggle to raw Markdown source. Import and export .md files. Code blocks with syntax highlighting.",
    },
    {
      icon: FolderTree,
      title: "Spaces & nested pages",
      description:
        "Organize docs into spaces with infinite nesting. Drag-and-drop reordering. Configurable default permissions per space.",
    },
    {
      icon: MessageSquare,
      title: "Threaded comments",
      description:
        "Comment on any page with @mention autocomplete. Threaded replies. In-app notifications for mentions and replies.",
    },
    {
      icon: Search,
      title: "Cmd+K instant search",
      description:
        "Full-text search across every page in your workspace. Results ranked by relevance with highlighted snippets. Filter by space.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28" style={{ backgroundColor: palette.white }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: palette.navy }}>
            Everything your team needs.
            <br />
            Nothing it doesn&apos;t.
          </h2>
          <p className="mt-4 text-base" style={{ color: palette.textDim }}>
            Four things, done exceptionally well.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group border p-6 transition-all duration-200"
              style={{
                borderColor: "#e2e8f0",
                borderRadius: 4,
                backgroundColor: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = palette.accent;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${palette.accent}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center"
                style={{
                  backgroundColor: palette.accentDim,
                  borderRadius: 4,
                }}
              >
                <f.icon className="h-5 w-5" style={{ color: palette.accent }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: palette.navy }}>
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#64748b" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Product Showcase ───────────────────────────────────

function Showcase() {
  return (
    <section
      className="border-t py-20 md:py-28"
      style={{ backgroundColor: palette.navy, borderColor: palette.border }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: palette.white }}
          >
            Built for how teams actually work
          </h2>
          <p className="mt-4 text-base" style={{ color: palette.textMuted }}>
            A workspace that stays out of your way. Organize by space, write in Markdown,
            collaborate in threads — all in one clean interface.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <ProductMockup />

          {/* Annotation callouts */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: FolderTree, label: "Space tree", desc: "Navigate nested pages instantly" },
              { icon: Code, label: "Markdown source", desc: "Toggle to raw .md with one click" },
              { icon: AtSign, label: "@mention comments", desc: "Tag teammates, get notified" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ backgroundColor: palette.surface, borderRadius: 4 }}
                >
                  <item.icon className="h-4 w-4" style={{ color: palette.accent }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: palette.text }}>
                    {item.label}
                  </div>
                  <div className="text-xs" style={{ color: palette.textDim }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Switch ─────────────────────────────────────────

function WhySwitch() {
  const reasons = [
    {
      icon: Users,
      stat: "10×",
      title: "Cheaper at scale",
      desc: "A 50-person team pays $200/mo on Starter. The same team on Confluence? $2,500+.",
    },
    {
      icon: Shield,
      title: "No per-feature paywalls",
      desc: "Every feature is available from day one. We charge for seats, not functionality.",
    },
    {
      icon: Code,
      title: "Markdown-native",
      desc: "Import your .md files. Export them back. Your content is never locked in.",
    },
    {
      icon: Share2,
      title: "One-toggle sharing",
      desc: "Share any page publicly with a single switch. Get a clean URL, instantly.",
    },
    {
      icon: Globe,
      title: "Granular permissions",
      desc: "Owner → Admin → Editor → Viewer. Set defaults per space, override per member.",
    },
  ];

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: palette.offWhite }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: palette.navy }}>
            Why teams switch to Discuss
          </h2>
          <p className="mt-4 text-base" style={{ color: "#64748b" }}>
            The tools you&apos;re paying for are 10× more expensive and 10× more complex than they need to be.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className={`border p-5 ${i === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}
              style={{
                borderColor: "#e2e8f0",
                borderRadius: 4,
                backgroundColor: "#fff",
              }}
            >
              <div className="flex items-center gap-3">
                <r.icon className="h-5 w-5" style={{ color: palette.accent }} />
                {r.stat && (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: palette.accent }}
                  >
                    {r.stat}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold" style={{ color: palette.navy }}>
                {r.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#64748b" }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For small teams getting started",
      features: [
        "Up to 5 team members",
        "3 spaces",
        "100 MB storage",
        "Rich editor + Markdown",
        "Threaded comments",
        "Cmd+K search",
      ],
      cta: "Start for free",
      featured: false,
    },
    {
      name: "Starter",
      price: "$4",
      period: "per user / month",
      description: "For growing teams that need more",
      features: [
        "Up to 50 team members",
        "Unlimited spaces",
        "5 GB storage",
        "External page sharing",
        "Everything in Free",
        "Priority support",
      ],
      cta: "Start free trial",
      featured: true,
      badge: "Most popular",
    },
    {
      name: "Pro",
      price: "$8",
      period: "per user / month",
      description: "For teams that need no limits",
      features: [
        "Unlimited team members",
        "Unlimited spaces",
        "50 GB storage",
        "Unlimited external shares",
        "Everything in Starter",
        "Custom subdomain",
      ],
      cta: "Start free trial",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28" style={{ backgroundColor: palette.white }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: palette.navy }}>
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base" style={{ color: "#64748b" }}>
            Start free. Upgrade when you need to. No surprises.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative border p-6 transition-all duration-200"
              style={{
                borderColor: plan.featured ? palette.accent : "#e2e8f0",
                borderRadius: 4,
                backgroundColor: "#fff",
                boxShadow: plan.featured ? `0 0 0 1px ${palette.accent}` : "none",
              }}
              onMouseEnter={(e) => {
                if (!plan.featured) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px -8px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.featured) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-6 px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: palette.accent,
                    color: palette.navy,
                    borderRadius: 3,
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <h3 className="text-sm font-semibold" style={{ color: palette.navy }}>
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight" style={{ color: palette.navy }}>
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: "#94a3b8" }}>
                  {plan.period}
                </span>
              </div>
              <p className="mt-2 text-sm" style={{ color: "#64748b" }}>
                {plan.description}
              </p>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm" style={{ color: "#475569" }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: palette.accent }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="/signup"
                className="mt-6 flex w-full items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: plan.featured ? palette.accent : "transparent",
                  color: plan.featured ? palette.navy : palette.navy,
                  border: plan.featured ? "none" : "1px solid #e2e8f0",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => {
                  if (plan.featured) {
                    e.currentTarget.style.backgroundColor = palette.accentHover;
                  } else {
                    e.currentTarget.style.borderColor = palette.accent;
                    e.currentTarget.style.color = palette.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.featured) {
                    e.currentTarget.style.backgroundColor = palette.accent;
                  } else {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.color = palette.navy;
                  }
                }}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ───────────────────────────────────────

function Testimonials() {
  const quotes = [
    {
      text: "We migrated 400+ pages from Confluence in an afternoon. The Markdown import just worked. Our engineers actually enjoy writing docs now.",
      author: "Marcus Rivera",
      role: "Engineering Lead",
      company: "Stackframe",
    },
    {
      text: "We were paying $3,200/month for Notion. Discuss does everything we need for $320. That's not a rounding error — it's a budget line we deleted.",
      author: "Priya Sharma",
      role: "Head of Product",
      company: "Clearbit Analytics",
    },
    {
      text: "The Cmd+K search is shockingly fast. I can find any doc across our entire workspace in under a second. It's the feature my team mentions most.",
      author: "James Okoro",
      role: "CTO",
      company: "Tidepool Systems",
    },
  ];

  return (
    <section
      className="border-t py-20 md:py-28"
      style={{ backgroundColor: palette.navyLight, borderColor: palette.border }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: palette.white }}
          >
            Trusted by teams that ship
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {quotes.map((q) => (
            <div
              key={q.author}
              className="border p-6"
              style={{
                borderColor: palette.border,
                borderRadius: 4,
                backgroundColor: palette.surface,
              }}
            >
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    style={{ color: "#facc15", fill: "#facc15" }}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: palette.text }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: palette.accentDim,
                    color: palette.accent,
                    borderRadius: 4,
                  }}
                >
                  {q.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: palette.text }}>
                    {q.author}
                  </div>
                  <div className="text-xs" style={{ color: palette.textDim }}>
                    {q.role}, {q.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ──────────────────────────────────────────

function FinalCta() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: palette.white }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: palette.navy }}>
            Start building your team&apos;s
            <br />
            knowledge base — free.
          </h2>
          <p className="mt-4 text-base" style={{ color: "#64748b" }}>
            No credit card required. Free forever for small teams.
          </p>

          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="border px-4 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-[#00d4aa]"
              style={{
                borderColor: "#e2e8f0",
                borderRadius: 4,
                color: palette.navy,
                minWidth: 260,
              }}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: palette.accent,
                color: palette.navy,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = palette.accentHover;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = palette.accent;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
            <Shield className="h-3.5 w-3.5" />
            Free plan includes 5 users, 3 spaces, and 100 MB storage
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────

function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Changelog", "Docs"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security"],
    },
  ];

  return (
    <footer
      className="border-t py-12"
      style={{ backgroundColor: palette.navy, borderColor: palette.border }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center"
                style={{ backgroundColor: palette.accent, borderRadius: 4 }}
              >
                <FileText className="h-4 w-4" style={{ color: palette.navy }} />
              </div>
              <span className="text-lg font-semibold tracking-tight" style={{ color: palette.white }}>
                discuss
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: palette.textDim }}>
              The Markdown-native knowledge base for teams that move fast.
            </p>
            <div className="mt-4 flex gap-3">
              {["Twitter", "GitHub", "LinkedIn"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-1 text-xs transition-colors duration-150"
                  style={{ color: palette.textDim }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = palette.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = palette.textDim)}
                >
                  <ExternalLink className="h-3 w-3" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-10">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: palette.textMuted }}>
                  {col.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors duration-150"
                        style={{ color: palette.textDim }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = palette.text)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = palette.textDim)}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-10 border-t pt-6 text-center text-xs"
          style={{ borderColor: palette.border, color: palette.textDim }}
        >
          © {new Date().getFullYear()} Discuss Labs, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ─── Page ───────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      <Nav />
      <Hero />
      <StatsBar />
      <Features />
      <Showcase />
      <WhySwitch />
      <Pricing />
      <Testimonials />
      <FinalCta />
      <Footer />
    </div>
  );
}
